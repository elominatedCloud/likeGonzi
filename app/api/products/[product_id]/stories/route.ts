import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import type { StoryRow } from "@/lib/mappers";
import { normalizeProductId } from "@/lib/mock-db";
import {
  resolveOwnedProductRef,
  resolveOwnedProductRefs,
} from "@/lib/supabase-product-refs";
import { getBearerToken } from "@/lib/supabase-server";
import { toSupabaseStoryDTOs } from "@/lib/supabase-story-mapper";
import {
  createStory,
  isKnownProduct,
  listStories,
} from "@/lib/story-store";
import type {
  CreateStoryBody,
  StoryRecord,
} from "@/types/story-api";

type RouteContext = { params: Promise<{ product_id: string }> };

async function buildProductIdsMap(
  supabase: SupabaseClient,
  storyIds: string[],
): Promise<Record<string, string[]>> {
  if (storyIds.length === 0) return {};
  const { data } = await supabase
    .from("story_products")
    .select("story_id, product_unit_id")
    .in("story_id", storyIds);

  const map: Record<string, string[]> = {};
  for (const row of data ?? []) {
    (map[row.story_id] ??= []).push(row.product_unit_id);
  }
  return map;
}

function storyListResponse(request: Request, stories: StoryRecord[]) {
  const groupBy = new URL(request.url).searchParams.get("group_by");

  if (groupBy === "month") {
    const groups: Record<string, StoryRecord[]> = {};
    for (const story of stories) {
      const key = story.created_at.slice(0, 7);
      (groups[key] ??= []).push(story);
    }
    return ok({ group_by: "month", groups });
  }

  if (groupBy === "trip") {
    const groups: Record<string, StoryRecord[]> = {};
    for (const story of stories) {
      const key = story.place || "미지정";
      (groups[key] ??= []).push(story);
    }
    return ok({ group_by: "trip", groups });
  }

  return ok(stories);
}

/**
 * Bearer 토큰이 있으면 Supabase/RLS, 없으면 해커톤 데모 store를 사용한다.
 */
export async function GET(request: Request, context: RouteContext) {
  const { product_id } = await context.params;

  if (!getBearerToken(request)) {
    const demoProductId = normalizeProductId(product_id);
    if (!isKnownProduct(demoProductId)) {
      return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
    }
    return storyListResponse(request, listStories(demoProductId));
  }

  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const { data: links, error: linkError } = await supabase
    .from("story_products")
    .select("story_id")
    .eq("product_unit_id", productRef.unitId);
  if (linkError) {
    console.error("[stories GET] link query error", linkError);
    return fail("QUERY_FAILED", "기록을 불러오지 못했습니다", 500);
  }

  const storyIds = (links ?? []).map((link) => link.story_id);
  if (storyIds.length === 0) return storyListResponse(request, []);

  const { data: storyRows, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .in("id", storyIds)
    .order("created_at", { ascending: false });
  if (storyError) {
    console.error("[stories GET] story query error", storyError);
    return fail("QUERY_FAILED", "기록을 불러오지 못했습니다", 500);
  }

  const productIdsMap = await buildProductIdsMap(supabase, storyIds);
  const stories = await toSupabaseStoryDTOs(
    supabase,
    storyRows as StoryRow[],
    productIdsMap,
  );
  return storyListResponse(request, stories);
}

export async function POST(request: Request, context: RouteContext) {
  const { product_id } = await context.params;
  const body = await readJson<CreateStoryBody>(request);
  if (!body) {
    return fail("INVALID_JSON", "Request body must be valid JSON");
  }
  if (!body.tag?.trim()) {
    return fail("VALIDATION_ERROR", "tag is required (제품 태그/제목)");
  }

  if (!getBearerToken(request)) {
    const demoProductId = normalizeProductId(product_id);
    if (!isKnownProduct(demoProductId)) {
      return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
    }
    if (!body.image_url?.trim() && !body.photo_path?.trim()) {
      return fail("VALIDATION_ERROR", "image_url or photo_path is required");
    }
    return ok(
      createStory(demoProductId, {
        ...body,
        product_ids: body.product_ids?.map(normalizeProductId),
        tag: body.tag.trim(),
      }),
      201,
    );
  }

  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;
  if (!body.image_url?.trim() && !body.photo_path?.trim()) {
    return fail("VALIDATION_ERROR", "image_url or photo_path is required");
  }

  const requestedProducts = body.product_ids?.length
    ? body.product_ids
    : [product_id];
  const resolved = await resolveOwnedProductRefs(supabase, requestedProducts);
  if (resolved.missing.length > 0 || resolved.refs.length === 0) {
    return fail(
      "PRODUCT_NOT_FOUND",
      "제품을 찾을 수 없거나 소유 제품이 아닙니다",
      404,
    );
  }

  const requestedDate = body.date ? new Date(body.date) : new Date();
  if (Number.isNaN(requestedDate.getTime())) {
    return fail("VALIDATION_ERROR", "date must be a valid date");
  }
  const storyDate = requestedDate.toISOString().slice(0, 10);

  if (body.photo_path?.trim()) {
    const { data: created, error: rpcError } = await supabase.rpc(
      "create_story_with_products",
      {
        p_tag: body.tag.trim(),
        p_photo_path: body.photo_path.trim(),
        p_location: body.place?.trim() || null,
        p_memo: body.memo?.trim() || null,
        p_story_date: storyDate,
        p_product_slugs: resolved.refs.map((ref) => ref.slug),
      },
    );
    const storyId = (created as { id?: string } | null)?.id;
    if (rpcError || !storyId) {
      console.error("[stories POST] create RPC error", rpcError);
      return fail("STORY_CREATE_FAILED", "기록 저장에 실패했습니다", 400);
    }

    if (body.story?.trim()) {
      await supabase
        .from("stories")
        .update({ story: body.story.trim() })
        .eq("id", storyId);
    }
    const { data: storyRow } = await supabase
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .single();
    if (!storyRow) {
      return fail("STORY_CREATE_FAILED", "저장된 기록을 확인하지 못했습니다", 500);
    }

    const [dto] = await toSupabaseStoryDTOs(
      supabase,
      [storyRow as StoryRow],
      { [storyId]: resolved.refs.map((ref) => ref.unitId) },
    );
    return ok(dto, 201);
  }

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    photo_url: body.image_url!.trim(),
    tag: body.tag.trim(),
    location: body.place?.trim() ?? "",
    memo: body.memo?.trim() ?? "",
    story: body.story?.trim() ?? null,
    story_date: storyDate,
  };
  const { data: storyRow, error: insertError } = await supabase
    .from("stories")
    .insert(insertPayload)
    .select()
    .single();
  if (insertError || !storyRow) {
    console.error("[stories POST] insert error", insertError);
    return fail("STORY_CREATE_FAILED", "기록 저장에 실패했습니다", 400);
  }

  const storyId = storyRow.id as string;
  const unitIds = resolved.refs.map((ref) => ref.unitId);
  const { error: linkError } = await supabase.from("story_products").insert(
    unitIds.map((unitId) => ({
      story_id: storyId,
      product_unit_id: unitId,
    })),
  );
  if (linkError) {
    await supabase.from("stories").delete().eq("id", storyId);
    console.error("[stories POST] link error", linkError);
    return fail("STORY_CREATE_FAILED", "제품 연결에 실패했습니다", 400);
  }

  const [dto] = await toSupabaseStoryDTOs(
    supabase,
    [storyRow as StoryRow],
    { [storyId]: unitIds },
  );
  return ok(dto, 201);
}

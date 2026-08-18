import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toStoryDTO, type StoryRow } from "@/lib/mappers";
import type { CreateStoryBody } from "@/types/story-api";

type RouteContext = { params: Promise<{ product_id: string }> };

/**
 * story_id 배열을 받아서 story_id -> product_unit_id[] 매핑을 만든다.
 * (story_products는 다대다라 한 번에 groupBy 형태로 조회)
 */
async function buildProductIdsMap(
  supabase: Awaited<ReturnType<typeof requireSupabaseUser>>["supabase"],
  storyIds: string[],
): Promise<Record<string, string[]>> {
  if (!supabase || storyIds.length === 0) return {};
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

/**
 * 2.1 기록 작성 — Story 생성
 * POST /api/products/{product_id}/stories
 *
 * Story 목록 (+ optional group_by=month|trip for 2.3)
 * GET  /api/products/{product_id}/stories
 */
export async function GET(request: Request, context: RouteContext) {
  const { product_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  // 이 product_unit이 실제 존재하고 내가 접근 가능한지 확인 (RLS로 소유한 것만 조회됨)
  const { data: unit } = await supabase
    .from("product_units")
    .select("id")
    .eq("id", product_id)
    .maybeSingle();
  if (!unit) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  // 이 product에 연결된 story_id 목록
  const { data: links, error: linkError } = await supabase
    .from("story_products")
    .select("story_id")
    .eq("product_unit_id", product_id);

  if (linkError) {
    console.error("[stories GET] link query error", linkError);
    return fail("QUERY_FAILED", linkError.message, 500);
  }

  const storyIds = (links ?? []).map((l) => l.story_id);
  if (storyIds.length === 0) {
    const groupBy = new URL(request.url).searchParams.get("group_by");
    if (groupBy === "month" || groupBy === "trip") {
      return ok({ group_by: groupBy, groups: {} });
    }
    return ok([]);
  }

  const { data: storyRows, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .in("id", storyIds)
    .order("created_at", { ascending: false });

  if (storyError) {
    console.error("[stories GET] story query error", storyError);
    return fail("QUERY_FAILED", storyError.message, 500);
  }

  const productIdsMap = await buildProductIdsMap(supabase, storyIds);
  const stories = (storyRows as StoryRow[]).map((row) =>
    toStoryDTO(row, productIdsMap[row.id] ?? [product_id]),
  );

  const groupBy = new URL(request.url).searchParams.get("group_by");

  if (groupBy === "month") {
    const groups: Record<string, typeof stories> = {};
    for (const s of stories) {
      const key = s.created_at.slice(0, 7);
      (groups[key] ??= []).push(s);
    }
    return ok({ group_by: "month", groups });
  }

  if (groupBy === "trip") {
    const groups: Record<string, typeof stories> = {};
    for (const s of stories) {
      const key = s.place || "미지정";
      (groups[key] ??= []).push(s);
    }
    return ok({ group_by: "trip", groups });
  }

  return ok(stories);
}

export async function POST(request: Request, context: RouteContext) {
  const { product_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const body = await readJson<CreateStoryBody>(request);
  if (!body) {
    return fail("INVALID_JSON", "Request body must be valid JSON");
  }
  if (!body.image_url?.trim()) {
    return fail("VALIDATION_ERROR", "image_url is required");
  }
  if (!body.tag?.trim()) {
    return fail("VALIDATION_ERROR", "tag is required (제품 태그/제목)");
  }

  const productIds = body.product_ids?.length ? body.product_ids : [product_id];

  // 1) story 본체 생성
  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    photo_url: body.image_url.trim(),
    tag: body.tag.trim(),
    location: body.place?.trim() ?? "",
    memo: body.memo?.trim() ?? "",
    story: body.story?.trim() ?? null,
  };
  if (body.date) {
    const iso = new Date(body.date).toISOString();
    insertPayload.created_at = iso;
    insertPayload.story_date = iso.slice(0, 10);
  }

  const { data: storyRow, error: insertError } = await supabase
    .from("stories")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    console.error("[stories POST] insert error", insertError);
    return fail("STORY_CREATE_FAILED", insertError.message, 400);
  }

  // 2) story_products 연결 (본인 소유 제품만 RLS가 허용)
  const { error: linkError } = await supabase
    .from("story_products")
    .insert(productIds.map((pid) => ({ story_id: storyRow.id, product_unit_id: pid })));

  if (linkError) {
    // 연결 실패 시 방금 만든 story도 롤백(정리)
    await supabase.from("stories").delete().eq("id", storyRow.id);
    console.error("[stories POST] link error", linkError);
    return fail(
      "STORY_CREATE_FAILED",
      "제품을 찾을 수 없거나 소유 제품이 아닙니다",
      400,
    );
  }

  return ok(toStoryDTO(storyRow as StoryRow, productIds), 201);
}
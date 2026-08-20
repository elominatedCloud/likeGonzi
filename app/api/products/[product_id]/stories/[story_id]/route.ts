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
import { normalizePlace } from "@/lib/place-normalize";
import { toSupabaseStoryDTOs } from "@/lib/supabase-story-mapper";
import {
  deleteStory,
  getStory,
  isKnownProduct,
  updateStory,
} from "@/lib/story-store";
import type { UpdateStoryBody } from "@/types/story-api";

type RouteContext = {
  params: Promise<{ product_id: string; story_id: string }>;
};

async function getStoryWithProducts(
  supabase: SupabaseClient,
  productId: string,
  storyId: string,
) {
  const productRef = await resolveOwnedProductRef(supabase, productId);
  if (!productRef) return null;

  const { data: links, error: linkError } = await supabase
    .from("story_products")
    .select("product_unit_id")
    .eq("story_id", storyId);
  if (linkError) return null;

  const unitIds = (links ?? []).map((link) => link.product_unit_id);
  if (!unitIds.includes(productRef.unitId)) return null;

  const { data: storyRow } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .maybeSingle();
  if (!storyRow) return null;

  return { storyRow: storyRow as StoryRow, unitIds };
}

export async function GET(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;

  if (!getBearerToken(request)) {
    const demoProductId = normalizeProductId(product_id);
    if (!isKnownProduct(demoProductId)) {
      return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
    }
    const story = getStory(demoProductId, story_id);
    return story
      ? ok(story)
      : fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;
  const result = await getStoryWithProducts(supabase, product_id, story_id);
  if (!result) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  const [story] = await toSupabaseStoryDTOs(
    supabase,
    [result.storyRow],
    { [story_id]: result.unitIds },
  );
  return ok(story);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  const body = await readJson<UpdateStoryBody>(request);
  if (!body) {
    return fail("INVALID_JSON", "Request body must be valid JSON");
  }

  if (!getBearerToken(request)) {
    const demoProductId = normalizeProductId(product_id);
    if (!isKnownProduct(demoProductId)) {
      return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
    }
    const updated = updateStory(demoProductId, story_id, {
      ...body,
      product_ids: body.product_ids?.map(normalizeProductId),
    });
    return updated
      ? ok(updated)
      : fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;
  const existing = await getStoryWithProducts(supabase, product_id, story_id);
  if (!existing) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  let nextUnitIds = existing.unitIds;
  if (body.product_ids !== undefined) {
    if (body.product_ids.length === 0) {
      return fail("VALIDATION_ERROR", "product_ids must not be empty");
    }
    const resolved = await resolveOwnedProductRefs(supabase, body.product_ids);
    if (resolved.missing.length > 0 || resolved.refs.length === 0) {
      return fail(
        "STORY_UPDATE_FAILED",
        "제품을 찾을 수 없거나 소유 제품이 아닙니다",
        400,
      );
    }
    nextUnitIds = resolved.refs.map((ref) => ref.unitId);
  }

  const updatePayload: Record<string, unknown> = {};
  if (body.image_url !== undefined) updatePayload.photo_url = body.image_url;
  if (body.photo_path !== undefined) updatePayload.photo_path = body.photo_path;
  if (body.tag !== undefined) updatePayload.tag = body.tag;
  if (body.place !== undefined) updatePayload.location = body.place;
  if (body.memo !== undefined) updatePayload.memo = body.memo;
  if (body.story !== undefined) updatePayload.story = body.story;
  if (body.occasion !== undefined) updatePayload.occasion = body.occasion;
  if (body.companion !== undefined) updatePayload.companion = body.companion || null;
  if (body.city !== undefined) updatePayload.city = body.city || null;
  if (body.country !== undefined) updatePayload.country = body.country || null;
  if (body.place !== undefined && body.city === undefined && body.country === undefined) {
    const normalized = normalizePlace(body.place);
    updatePayload.city = normalized.city;
    updatePayload.country = normalized.country;
  }

  let updatedRow = existing.storyRow;
  if (Object.keys(updatePayload).length > 0) {
    const { data, error: updateError } = await supabase
      .from("stories")
      .update(updatePayload)
      .eq("id", story_id)
      .select()
      .single();
    if (updateError || !data) {
      console.error("[story PATCH] update error", updateError);
      return fail("STORY_UPDATE_FAILED", "기록 수정에 실패했습니다", 400);
    }
    updatedRow = data as StoryRow;
  }

  if (body.product_ids !== undefined) {
    const { error: unlinkError } = await supabase
      .from("story_products")
      .delete()
      .eq("story_id", story_id);
    if (unlinkError) {
      console.error("[story PATCH] unlink error", unlinkError);
      return fail("STORY_UPDATE_FAILED", "제품 연결 수정에 실패했습니다", 400);
    }

    const { error: relinkError } = await supabase.from("story_products").insert(
      nextUnitIds.map((unitId) => ({
        story_id,
        product_unit_id: unitId,
      })),
    );
    if (relinkError) {
      console.error("[story PATCH] relink error", relinkError);
      return fail("STORY_UPDATE_FAILED", "제품 연결 수정에 실패했습니다", 400);
    }
  }

  const [story] = await toSupabaseStoryDTOs(
    supabase,
    [updatedRow],
    { [story_id]: nextUnitIds },
  );
  return ok(story);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;

  if (!getBearerToken(request)) {
    const demoProductId = normalizeProductId(product_id);
    if (!isKnownProduct(demoProductId)) {
      return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
    }
    return deleteStory(demoProductId, story_id)
      ? ok({ id: story_id, deleted: true })
      : fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;
  const existing = await getStoryWithProducts(supabase, product_id, story_id);
  if (!existing) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  const { error: deleteError } = await supabase
    .from("stories")
    .delete()
    .eq("id", story_id);
  if (deleteError) {
    console.error("[story DELETE] delete error", deleteError);
    return fail("STORY_DELETE_FAILED", "기록 삭제에 실패했습니다", 400);
  }
  return ok({ id: story_id, deleted: true });
}

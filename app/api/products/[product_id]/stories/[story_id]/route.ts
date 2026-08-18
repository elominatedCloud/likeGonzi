import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toStoryDTO, type StoryRow } from "@/lib/mappers";
import type { UpdateStoryBody } from "@/types/story-api";

type RouteContext = {
  params: Promise<{ product_id: string; story_id: string }>;
};

async function getStoryWithProducts(
  supabase: Awaited<ReturnType<typeof requireSupabaseUser>>["supabase"],
  productId: string,
  storyId: string,
) {
  const { data: links } = await supabase!
    .from("story_products")
    .select("product_unit_id")
    .eq("story_id", storyId);

  const productIds = (links ?? []).map((l) => l.product_unit_id);
  if (!productIds.includes(productId)) return null;

  const { data: storyRow } = await supabase!
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .maybeSingle();

  if (!storyRow) return null;
  return { storyRow: storyRow as StoryRow, productIds };
}

/**
 * 2.2 기록 상세 — Story 단건 조회
 * GET /api/products/{product_id}/stories/{story_id}
 *
 * 2.2 기록 상세 (수정)
 * PATCH /api/products/{product_id}/stories/{story_id}
 *
 * 2.2 기록 상세 (삭제)
 * DELETE /api/products/{product_id}/stories/{story_id}
 */
export async function GET(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const result = await getStoryWithProducts(supabase, product_id, story_id);
  if (!result) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }
  return ok(toStoryDTO(result.storyRow, result.productIds));
}

export async function PATCH(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const existing = await getStoryWithProducts(supabase, product_id, story_id);
  if (!existing) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  const body = await readJson<UpdateStoryBody>(request);
  if (!body) {
    return fail("INVALID_JSON", "Request body must be valid JSON");
  }

  const updatePayload: Record<string, unknown> = {};
  if (body.image_url !== undefined) updatePayload.photo_url = body.image_url;
  if (body.tag !== undefined) updatePayload.tag = body.tag;
  if (body.place !== undefined) updatePayload.location = body.place;
  if (body.memo !== undefined) updatePayload.memo = body.memo;
  if (body.story !== undefined) updatePayload.story = body.story;

  const { data: updatedRow, error: updateError } = await supabase
    .from("stories")
    .update(updatePayload)
    .eq("id", story_id)
    .select()
    .single();

  if (updateError) {
    console.error("[story PATCH] update error", updateError);
    return fail("STORY_UPDATE_FAILED", updateError.message, 400);
  }

  let productIds = existing.productIds;
  if (body.product_ids !== undefined) {
    // 기존 연결 다 지우고 새로 연결 (본인 소유 제품만 RLS가 허용)
    await supabase.from("story_products").delete().eq("story_id", story_id);
    const { error: relinkError } = await supabase
      .from("story_products")
      .insert(body.product_ids.map((pid) => ({ story_id, product_unit_id: pid })));
    if (relinkError) {
      console.error("[story PATCH] relink error", relinkError);
      return fail(
        "STORY_UPDATE_FAILED",
        "제품을 찾을 수 없거나 소유 제품이 아닙니다",
        400,
      );
    }
    productIds = body.product_ids;
  }

  return ok(toStoryDTO(updatedRow as StoryRow, productIds));
}

export async function DELETE(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const existing = await getStoryWithProducts(supabase, product_id, story_id);
  if (!existing) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }

  // story_products는 stories 삭제 시 on delete cascade로 같이 정리됨
  const { error: deleteError } = await supabase
    .from("stories")
    .delete()
    .eq("id", story_id);

  if (deleteError) {
    console.error("[story DELETE] delete error", deleteError);
    return fail("STORY_DELETE_FAILED", deleteError.message, 400);
  }

  return ok({ id: story_id, deleted: true });
}
import {
  deleteStory,
  getStory,
  isKnownProduct,
  updateStory,
} from "@/lib/story-store";
import { fail, ok, readJson } from "@/lib/api-response";
import type { UpdateStoryBody } from "@/types/story-api";

type RouteContext = {
  params: Promise<{ product_id: string; story_id: string }>;
};

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
export async function GET(_request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  if (!isKnownProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const story = getStory(product_id, story_id);
  if (!story) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }
  return ok(story);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  if (!isKnownProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const body = await readJson<UpdateStoryBody>(request);
  if (!body) {
    return fail("INVALID_JSON", "Request body must be valid JSON");
  }

  const updated = updateStory(product_id, story_id, body);
  if (!updated) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }
  return ok(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { product_id, story_id } = await context.params;
  if (!isKnownProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const removed = deleteStory(product_id, story_id);
  if (!removed) {
    return fail("STORY_NOT_FOUND", `story_id '${story_id}' not found`, 404);
  }
  return ok({ id: story_id, deleted: true });
}

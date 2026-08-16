import {
  createStory,
  isKnownProduct,
  listStories,
} from "@/lib/story-store";
import { fail, ok, readJson } from "@/lib/api-response";
import { normalizeProductId } from "@/lib/mock-db";
import type { CreateStoryBody } from "@/types/story-api";

type RouteContext = { params: Promise<{ product_id: string }> };

/**
 * 2.1 기록 작성 — Story 생성
 * POST /api/products/{product_id}/stories
 *
 * Story 목록 (+ optional group_by=month|trip for 2.3)
 * GET  /api/products/{product_id}/stories
 */
export async function GET(request: Request, context: RouteContext) {
  const { product_id } = await context.params;
  const id = normalizeProductId(product_id);
  if (!isKnownProduct(id) && !isKnownProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const stories = listStories(id);
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
  const id = normalizeProductId(product_id);
  if (!isKnownProduct(id) && !isKnownProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

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

  const created = createStory(id, {
    image_url: body.image_url.trim(),
    tag: body.tag.trim(),
    place: body.place?.trim() ?? "",
    memo: body.memo?.trim() ?? "",
    story: body.story?.trim(),
    product_ids: body.product_ids,
    date: body.date,
  });

  return ok(created, 201);
}

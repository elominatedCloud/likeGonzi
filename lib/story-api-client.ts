/**
 * 멋사/개발용 Story API 클라이언트 (남준 FE · 검수용)
 *
 * 명세 경로: /products/{product_id}/stories
 * 실제 Next 라우트: /api/products/{product_id}/stories
 */

import type {
  CreateStoryBody,
  StoryRecord,
  UpdateStoryBody,
} from "@/types/story-api";
import { apiFetch as request } from "@/lib/api-client";

export function storiesBase(productId: string) {
  return `/api/products/${productId}/stories`;
}

/** 2.1 Story 생성 */
export function createStory(productId: string, body: CreateStoryBody) {
  return request<StoryRecord>(storiesBase(productId), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** 목록 (검수용) */
export function listStories(productId: string) {
  return request<StoryRecord[]>(storiesBase(productId), { method: "GET" });
}

/** 2.2 Story 단건 조회 */
export function getStory(productId: string, storyId: string) {
  return request<StoryRecord>(`${storiesBase(productId)}/${storyId}`, {
    method: "GET",
  });
}

/** 2.2 Story 수정 */
export function updateStory(
  productId: string,
  storyId: string,
  body: UpdateStoryBody,
) {
  return request<StoryRecord>(`${storiesBase(productId)}/${storyId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** 2.2 Story 삭제 */
export function deleteStory(productId: string, storyId: string) {
  return request<{ id: string; deleted: boolean }>(
    `${storiesBase(productId)}/${storyId}`,
    { method: "DELETE" },
  );
}

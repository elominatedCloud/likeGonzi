const LEGACY_SHARED_STORY_IMAGE =
  "/FE-namjun/assets/로그_타임라인-1.png";

const DEMO_STORY_IMAGE_BY_PRODUCT: Record<string, string> = {
  ella: "/FE-namjun/assets/ella-jazz-memory.png",
  pina: "/FE-namjun/assets/pina-bookstore-memory.png",
  stark: LEGACY_SHARED_STORY_IMAGE,
};

/**
 * 초기 분석용 시드는 모든 제품 기록에 Stark Backpack 사진 한 장을 공통 저장했다.
 * 실제 업로드 사진은 그대로 두고, 그 정확한 시드 URL만 제품별 데모 사진으로 교정한다.
 */
export function normalizeDemoStoryImage(
  imageUrl: string | null,
  productSlug: string,
): string | null {
  if (imageUrl !== LEGACY_SHARED_STORY_IMAGE) return imageUrl;
  return DEMO_STORY_IMAGE_BY_PRODUCT[productSlug] ?? imageUrl;
}

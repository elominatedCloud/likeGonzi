export const PRODUCT_SLUG_TO_LOG_ID = {
  "stark-backpack": "stark",
  "ella-boston": "ella",
} as const;

export type ProductLogId =
  (typeof PRODUCT_SLUG_TO_LOG_ID)[keyof typeof PRODUCT_SLUG_TO_LOG_ID];

export function getLogProductId(productSlug: string): string {
  return (
    PRODUCT_SLUG_TO_LOG_ID[
      productSlug as keyof typeof PRODUCT_SLUG_TO_LOG_ID
    ] ?? productSlug
  );
}

export function getProductDetailPath(productId: string): string | null {
  const normalizedId = productId.trim();
  if (!normalizedId) return null;
  const slug = Object.entries(PRODUCT_SLUG_TO_LOG_ID).find(
    ([, logId]) => logId === normalizedId,
  )?.[0];
  return `/products/${encodeURIComponent(slug ?? normalizedId)}`;
}

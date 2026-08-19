import CameraExperience from './CameraExperience';

const productIds = ['stark', 'ella', 'pina'] as const;

/**
 * /camera            — 사진 기록용 카메라
 * /camera?mode=qr    — 제품 태그 QR 인식 (로그인 필요, 인식하면 바로 등록)
 */
export default async function CameraPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; mode?: string }>;
}) {
  const { product, mode } = await searchParams;
  const productId = productIds.includes(product as (typeof productIds)[number])
    ? (product as (typeof productIds)[number])
    : 'stark';

  return (
    <CameraExperience
      productId={productId}
      mode={mode === 'qr' ? 'qr' : 'photo'}
    />
  );
}

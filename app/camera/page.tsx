import CameraExperience from './CameraExperience';

const productIds = ['stark', 'ella', 'pina'] as const;

/**
 * /camera            — 사진 기록용 카메라
 * /camera?mode=qr    — 제품 태그 QR 인식 (로그인 필요, 인식하면 바로 등록)
 */
export default async function CameraPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; mode?: string; return?: string }>;
}) {
  const { product, mode, return: returnTo } = await searchParams;
  // 기본값을 고정하지 않는다. 지정이 없으면 화면이 내 소유 제품에서 고른다.
  const productId = productIds.includes(product as (typeof productIds)[number])
    ? (product as (typeof productIds)[number])
    : undefined;

  return (
    <CameraExperience
      productId={productId}
      mode={mode === 'qr' ? 'qr' : mode === 'repair' ? 'repair' : 'photo'}
      // 외부 주소로 튕기지 않도록 앱 내부 경로만 받는다.
      returnTo={
        returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : undefined
      }
    />
  );
}

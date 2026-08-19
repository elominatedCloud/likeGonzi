import Unboxing from '@/Components/Unboxing/Unboxing';

const scanStates = ['mine', 'unregistered', 'owned', 'error'] as const;

/**
 * QR/NFC 진입: /start?tag={tag_code}
 * - tag가 있으면 Unboxing이 /api/products/scan/{tag}로 실제 소유 상태를 판별한다.
 * - tag가 없으면 ?status= 로 상태를 강제 지정하는 디자인 QA 모드.
 * - claim=1 은 로그인 후 되돌아온 경우로, 등록까지 자동으로 이어간다.
 */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tag?: string; claim?: string }>;
}) {
  const { status, tag, claim } = await searchParams;
  const scanState = scanStates.includes(status as (typeof scanStates)[number])
    ? (status as (typeof scanStates)[number])
    : 'unregistered';

  return (
    <Unboxing
      initialScanState={scanState}
      tagCode={tag?.trim() || undefined}
      autoClaim={claim === '1'}
    />
  );
}

/**
 * QR에서 읽은 문자열에서 제품 태그 코드를 뽑는다.
 *
 * 실물 태그 QR은 보통 전체 URL(https://앱/start?tag=UNIT-STARK-0001)을 담지만,
 * 코드만 인쇄된 태그나 수동 입력도 받아준다.
 * 태그 코드는 DB와 정확히 일치해야 하므로 대소문자는 바꾸지 않는다.
 */
export function tagCodeFromScan(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  const queryStart = text.indexOf("?");
  if (queryStart >= 0) {
    const tag = new URLSearchParams(text.slice(queryStart + 1)).get("tag")?.trim();
    return tag ? tag : null;
  }

  // 코드만 들어온 경우 — 태그 코드로 볼 수 있는 형태만 통과시킨다.
  return /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(text) ? text : null;
}

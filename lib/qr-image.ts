import QRCode from "qrcode";

export interface TagQrOptions {
  /** 가운데 MCM 로고 삽입 여부 */
  logo?: boolean;
  /** QR 모듈 색 */
  dark?: string;
}

/** 로고가 가리는 면적 비율. 오류 정정 H(30% 복구) 안에서 안전한 값. */
const LOGO_RATIO = 0.24;
const LOGO_PAD_RATIO = 0.03;

async function fetchLogoDataUrl(): Promise<string> {
  const response = await fetch("/icon/MCM_Logo.svg");
  if (!response.ok) throw new Error("로고를 불러오지 못했습니다");
  const svg = await response.text();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * 태그 URL을 담은 QR SVG 문자열을 만든다.
 *
 * 로고를 넣으면 가운데 모듈이 가려지므로 오류 정정 레벨을 H로 올린다.
 * (H는 30%까지 복구 — 로고가 덮는 24% + 여백을 감당한다.)
 */
export async function buildTagQrSvg(
  url: string,
  { logo = true, dark = "#2b211c" }: TagQrOptions = {},
): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: logo ? "H" : "M",
    margin: 2,
    color: { dark, light: "#ffffff" },
  });
  if (!logo) return svg;

  // qrcode가 만든 SVG의 viewBox 크기를 그대로 좌표계로 쓴다.
  const size = Number(svg.match(/viewBox="0 0 (\d+(?:\.\d+)?)/)?.[1]);
  if (!Number.isFinite(size)) return svg;

  const logoSize = size * LOGO_RATIO;
  const plateSize = logoSize + size * LOGO_PAD_RATIO * 2;
  const logoOffset = (size - logoSize) / 2;
  const plateOffset = (size - plateSize) / 2;
  const logoHref = await fetchLogoDataUrl();

  const overlay =
    `<rect x="${plateOffset}" y="${plateOffset}" width="${plateSize}" height="${plateSize}"` +
    ` rx="${plateSize * 0.18}" fill="#ffffff"/>` +
    `<image href="${logoHref}" x="${logoOffset}" y="${logoOffset}"` +
    ` width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;

  return svg.replace("</svg>", `${overlay}</svg>`);
}

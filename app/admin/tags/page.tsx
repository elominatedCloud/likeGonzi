"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { buildTagQrSvg } from "@/lib/qr-image";
import { tagCodeFromScan } from "@/lib/qr-tag";

/** 시드에 들어 있는 데모 태그들 */
const PRESET_TAGS = [
  { code: "UNIT-STARK-0001", label: "Stark Backpack" },
  { code: "UNIT-ELLA-0002", label: "Ella Boston Bag" },
  { code: "UNIT-PINA-0003", label: "Pina Studded Wallet" },
];

const COLORS = [
  { value: "#2b211c", label: "잉크" },
  { value: "#6e432c", label: "코냑" },
  { value: "#000000", label: "블랙" },
];

export default function AdminTagsPage() {
  // 로컬에서 만든 QR을 폰으로 찍으면 localhost라 안 열린다.
  // 기본값은 현재 주소, 배포 주소로 바꿔서 뽑을 수 있게 열어둔다.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [baseUrlInput, setBaseUrlInput] = useState<string | null>(null);
  const baseUrl = baseUrlInput ?? origin;

  const [tagCode, setTagCode] = useState(PRESET_TAGS[0].code);
  const [logo, setLogo] = useState(true);
  const [dark, setDark] = useState(COLORS[0].value);
  const [svg, setSvg] = useState("");
  const [qrError, setQrError] = useState("");

  const normalizedTag = tagCodeFromScan(tagCode) ?? "";
  const targetUrl = useMemo(() => {
    if (!baseUrl || !normalizedTag) return "";
    return `${baseUrl.replace(/\/+$/, "")}/start?tag=${encodeURIComponent(normalizedTag)}`;
  }, [baseUrl, normalizedTag]);

  useEffect(() => {
    if (!targetUrl) return;
    let cancelled = false;
    buildTagQrSvg(targetUrl, { logo, dark })
      .then((generated) => {
        if (cancelled) return;
        setSvg(generated);
        setQrError("");
      })
      .catch(() => {
        if (!cancelled) setQrError("QR을 만들지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, [targetUrl, logo, dark]);

  const error = normalizedTag ? qrError : "태그 코드를 확인해주세요.";

  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${normalizedTag}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_320px]">
      <section className="rounded-2xl bg-paper p-5 print:hidden">
        <h2 className="text-[15px] font-semibold text-ink">제품 태그 QR 만들기</h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          여기서 만든 QR을 폰 기본 카메라로 찍으면 제품 등록 화면이 열립니다.
          앱 안에서는 카메라 탭의 제품 등록(QR 인식)으로도 같은 태그를 읽습니다.
        </p>

        <label className="mt-5 block">
          <span className="text-[12px] font-semibold text-ink">주소</span>
          <input
            value={baseUrl}
            onChange={(event) => setBaseUrlInput(event.target.value)}
            placeholder="https://storybook.example.com"
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px] outline-none focus:border-cognac"
          />
          <span className="mt-1 block text-[11px] leading-4 text-muted">
            배포 주소로 바꿔서 뽑으세요. localhost로 만든 QR은 다른 기기에서 열리지 않습니다.
          </span>
        </label>

        <label className="mt-4 block">
          <span className="text-[12px] font-semibold text-ink">태그 코드</span>
          <input
            value={tagCode}
            onChange={(event) => setTagCode(event.target.value)}
            placeholder="UNIT-STARK-0001"
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px] outline-none focus:border-cognac"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_TAGS.map((preset) => (
            <button
              key={preset.code}
              type="button"
              onClick={() => setTagCode(preset.code)}
              className="rounded-full border border-cognac/25 px-3 py-1.5 text-[12px] text-cognac-deep"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-black/5 pt-4">
          <p className="text-[12px] font-semibold text-ink">디자인</p>
          <label className="mt-2 flex items-center gap-2 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={logo}
              onChange={(event) => setLogo(event.target.checked)}
            />
            가운데 MCM 로고 넣기
            <span className="text-[11px] text-muted">(오류 정정 H로 자동 상향)</span>
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setDark(color.value)}
                aria-pressed={dark === color.value}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] ${
                  dark === color.value
                    ? "border-cognac bg-cream-deep text-ink"
                    : "border-black/10 text-muted"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color.value }}
                  aria-hidden
                />
                {color.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-paper p-5 text-center">
        {error && (
          <p className="text-[13px] text-[#8a3a3a]" role="alert">
            {error}
          </p>
        )}

        {targetUrl && svg && !error && (
          <>
            <div
              className="mx-auto w-[240px] [&>svg]:h-auto [&>svg]:w-full"
              // qrcode가 만든 SVG — 외부 입력이 아니라 위에서 조립한 URL만 들어간다.
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-4 text-[14px] font-semibold text-ink">{normalizedTag}</p>
            <p className="mt-1 break-all text-[11px] leading-4 text-muted">{targetUrl}</p>
            <div className="mt-5 flex justify-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-cognac-deep px-4 py-2.5 text-[13px] font-semibold text-white"
              >
                인쇄 / PDF
              </button>
              <button
                type="button"
                onClick={downloadSvg}
                className="rounded-full border border-cognac/25 px-4 py-2.5 text-[13px] font-semibold text-cognac-deep"
              >
                SVG 저장
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { apiFetch } from "@/lib/api-client";
import { buildTagQrSvg } from "@/lib/qr-image";

interface AdminProduct {
  id: string;
  slug: string;
  product_name: string;
  model_no: string | null;
}

interface AdminUnit {
  id: string;
  tag_code: string;
  serial_no: string;
  store: string | null;
  color: string | null;
  year: number | null;
  created_at: string;
  product_slug: string | null;
  product_name: string | null;
  is_registered: boolean;
}

interface AdminUnitsData {
  products: AdminProduct[];
  units: AdminUnit[];
}

export default function AdminUnitsPage() {
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [baseUrlInput, setBaseUrlInput] = useState<string | null>(null);
  const baseUrl = baseUrlInput ?? origin;

  const [data, setData] = useState<AdminUnitsData | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [slug, setSlug] = useState("");
  const [store, setStore] = useState("MCM Seoul");
  const [year, setYear] = useState(new Date().getFullYear());
  const [quantity, setQuantity] = useState(5);
  const [issuing, setIssuing] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [sheet, setSheet] = useState<{ tagCode: string; svg: string }[]>([]);
  const [buildingSheet, setBuildingSheet] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<AdminUnitsData>("/api/admin/units")
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setData(json.data);
          setError("");
        } else {
          setError(json.error.message);
        }
      })
      .catch(() => {
        if (!cancelled) setError("목록을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const products = data?.products ?? [];
  const units = useMemo(() => data?.units ?? [], [data]);
  const activeSlug = slug || products[0]?.slug || "";

  const tagUrl = useCallback(
    (tagCode: string) =>
      `${baseUrl.replace(/\/+$/, "")}/start?tag=${encodeURIComponent(tagCode)}`,
    [baseUrl],
  );

  async function issue() {
    if (!activeSlug) return;
    setIssuing(true);
    setError("");
    try {
      const json = await apiFetch<AdminUnit[]>("/api/admin/units", {
        method: "POST",
        body: JSON.stringify({
          product_slug: activeSlug,
          store,
          year,
          quantity,
        }),
      });
      if (!json.ok) {
        setError(json.error.message);
        return;
      }
      setReloadKey((value) => value + 1);
    } catch {
      setError("발급에 실패했습니다.");
    } finally {
      setIssuing(false);
    }
  }

  async function buildSheet() {
    const targets = units.filter((unit) => selected.includes(unit.id));
    if (targets.length === 0) return;
    setBuildingSheet(true);
    try {
      const built = await Promise.all(
        targets.map(async (unit) => ({
          tagCode: unit.tag_code,
          svg: await buildTagQrSvg(tagUrl(unit.tag_code), { logo: true }),
        })),
      );
      setSheet(built);
    } catch {
      setError("QR 시트를 만들지 못했습니다.");
    } finally {
      setBuildingSheet(false);
    }
  }

  const unregisteredCount = useMemo(
    () => units.filter((unit) => !unit.is_registered).length,
    [units],
  );

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-xl bg-[#f8ecec] px-4 py-3 text-[13px] text-[#8a3a3a] print:hidden" role="alert">
          {error}
        </p>
      )}

      <section className="rounded-2xl bg-paper p-5 print:hidden">
        <h2 className="text-[15px] font-semibold text-ink">개체 발급</h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          제품 하나를 여러 개 찍어냅니다. 태그 코드와 시리얼은 자동으로 채번됩니다.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="block">
            <span className="text-[12px] font-semibold text-ink">제품</span>
            <select
              value={activeSlug}
              onChange={(event) => setSlug(event.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px]"
            >
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink">매장</span>
            <input
              value={store}
              onChange={(event) => setStore(event.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink">연도</span>
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink">수량 (최대 200)</span>
            <input
              type="number"
              min={1}
              max={200}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={issue}
          disabled={issuing || !activeSlug}
          className="mt-4 rounded-full bg-cognac-deep px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {issuing ? "발급 중…" : "발급"}
        </button>
      </section>

      <section className="rounded-2xl bg-paper p-5 print:hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-ink">
            발급된 개체 {units.length}개
          </h2>
          <p className="text-[12px] text-muted">미등록 {unregisteredCount}개</p>
        </div>

        <label className="mt-3 block">
          <span className="text-[12px] font-semibold text-ink">QR 주소</span>
          <input
            value={baseUrl}
            onChange={(event) => setBaseUrlInput(event.target.value)}
            placeholder="https://storybook.example.com"
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-[13px]"
          />
          <span className="mt-1 block text-[11px] leading-4 text-muted">
            배포 주소로 바꿔서 뽑으세요. localhost로 만든 QR은 다른 기기에서 열리지 않습니다.
          </span>
        </label>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[12px]">
            <thead className="text-muted">
              <tr className="border-b border-black/10">
                <th className="w-8 py-2">
                  <input
                    type="checkbox"
                    aria-label="전체 선택"
                    checked={units.length > 0 && selected.length === units.length}
                    onChange={(event) =>
                      setSelected(event.target.checked ? units.map((unit) => unit.id) : [])
                    }
                  />
                </th>
                <th className="py-2">태그 코드</th>
                <th className="py-2">제품</th>
                <th className="py-2">시리얼</th>
                <th className="py-2">매장</th>
                <th className="py-2">연도</th>
                <th className="py-2">등록</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="border-b border-black/5">
                  <td className="py-2">
                    <input
                      type="checkbox"
                      aria-label={`${unit.tag_code} 선택`}
                      checked={selected.includes(unit.id)}
                      onChange={(event) =>
                        setSelected((prev) =>
                          event.target.checked
                            ? [...prev, unit.id]
                            : prev.filter((id) => id !== unit.id),
                        )
                      }
                    />
                  </td>
                  <td className="py-2 font-medium text-ink">{unit.tag_code}</td>
                  <td className="py-2 text-ink-soft">{unit.product_name}</td>
                  <td className="py-2 text-muted">{unit.serial_no}</td>
                  <td className="py-2 text-muted">{unit.store ?? "-"}</td>
                  <td className="py-2 text-muted">{unit.year ?? "-"}</td>
                  <td className="py-2">
                    {unit.is_registered ? (
                      <span className="rounded-full bg-[#eef6ea] px-2 py-0.5 text-[11px] text-[#3d6b3a]">
                        등록됨
                      </span>
                    ) : (
                      <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[11px] text-muted">
                        미등록
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted">
                    발급된 개체가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={buildSheet}
          disabled={selected.length === 0 || buildingSheet}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {buildingSheet ? "만드는 중…" : `선택한 ${selected.length}개 QR 시트 만들기`}
        </button>
      </section>

      {sheet.length > 0 && (
        <section className="rounded-2xl bg-paper p-5">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-[15px] font-semibold text-ink">QR 시트 {sheet.length}장</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-cognac-deep px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              인쇄 / PDF
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {sheet.map((item) => (
              <figure
                key={item.tagCode}
                className="break-inside-avoid rounded-xl border border-black/10 bg-white p-3 text-center"
              >
                <div
                  className="[&>svg]:h-auto [&>svg]:w-full"
                  // buildTagQrSvg가 만든 SVG — 위에서 조립한 URL만 들어간다.
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />
                <figcaption className="mt-2 text-[11px] font-medium text-ink">
                  {item.tagCode}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

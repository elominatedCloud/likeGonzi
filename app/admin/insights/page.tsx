"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { OCCASIONS } from "@/types/story-api";

interface OccasionRow { product_slug: string; product_name: string; occasion: string; story_count: number }
interface CityRow { product_slug: string; product_name: string; country: string; city: string; story_count: number }
interface RepairRow { product_slug: string; product_name: string; condition_tag: string; repair_count: number }

interface Insights {
  occasion: OccasionRow[];
  city: CityRow[];
  repair: RepairRow[];
  consent: { total: number; opted_in: number };
  k_anonymity_threshold: number;
}

const OCCASION_LABEL = Object.fromEntries(OCCASIONS.map((o) => [o.id, o.label]));

/** 가로 막대. 최댓값 기준 상대 길이만 쓰므로 차트 라이브러리가 필요 없다. */
function Bar({ label, sub, value, max }: { label: string; sub?: string; value: number; max: number }) {
  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[12px]">
        <span className="min-w-0 truncate text-ink">
          {label}
          {sub && <span className="ml-1 text-muted">{sub}</span>}
        </span>
        <span className="shrink-0 font-semibold text-ink">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-cognac-deep"
          style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}

function Panel({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-paper p-5">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-[11px] leading-4 text-muted">{note}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function AdminInsightsPage() {
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch<Insights>("/api/admin/insights")
      .then((json) => {
        if (cancelled) return;
        if (json.ok) setData(json.data);
        else setError(json.error.message);
      })
      .catch(() => {
        if (!cancelled) setError("집계를 불러오지 못했습니다.");
      });
    return () => { cancelled = true };
  }, []);

  if (error) return <p className="py-16 text-center text-[13px] text-[#8a3a3a]" role="alert">{error}</p>;
  if (!data) return <p className="py-16 text-center text-[13px] text-muted" role="status">집계를 불러오는 중…</p>;

  const maxOccasion = Math.max(1, ...data.occasion.map((r) => r.story_count));
  const maxCity = Math.max(1, ...data.city.map((r) => r.story_count));
  const maxRepair = Math.max(1, ...data.repair.map((r) => r.repair_count));
  const empty = data.occasion.length === 0 && data.city.length === 0 && data.repair.length === 0;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-paper p-5">
        <h1 className="text-[17px] font-bold text-ink">브랜드 인사이트</h1>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          어떤 제품이 어떤 상황에서, 어디에서 쓰이는지를 집계한 결과입니다.
          개인 식별자는 포함되지 않으며, <b>{data.k_anonymity_threshold}건 미만 그룹은 제외</b>됩니다.
        </p>
        <p className="mt-2 inline-block rounded-full bg-cream-deep px-3 py-1 text-[11px] text-cognac-deep">
          통계 참여 {data.consent.opted_in} / 전체 {data.consent.total}명 · 동의한 사용자만 집계
        </p>
      </section>

      {empty && (
        <section className="rounded-2xl bg-paper p-8 text-center">
          <p className="text-[13px] text-ink">표시할 집계가 없습니다.</p>
          <p className="mt-2 text-[11px] leading-4 text-muted">
            동의한 사용자의 기록이 그룹당 {data.k_anonymity_threshold}건을 넘어야 표시됩니다.
            표본이 적은 구간을 감추는 것은 의도된 동작입니다.
          </p>
        </section>
      )}

      <Panel
        title="상황별 사용"
        note="제품 모델 × 상황. 기록 작성 시 선택한 값이라 자유 텍스트 제목과 달리 집계가 됩니다."
      >
        {data.occasion.map((r) => (
          <Bar
            key={`${r.product_slug}-${r.occasion}`}
            label={r.product_name}
            sub={`· ${OCCASION_LABEL[r.occasion] ?? r.occasion}`}
            value={r.story_count}
            max={maxOccasion}
          />
        ))}
      </Panel>

      <Panel title="지역별 사용" note="제품 모델 × 국가/도시. 장소 원문을 정규화한 값입니다.">
        {data.city.map((r) => (
          <Bar
            key={`${r.product_slug}-${r.country}-${r.city}`}
            label={r.product_name}
            sub={`· ${r.city} (${r.country})`}
            value={r.story_count}
            max={maxCity}
          />
        ))}
      </Panel>

      <Panel
        title="수선 다발 부위"
        note="제품 모델 × 수선 접수 시 선택한 부위·증상. 제품 개선에 바로 쓸 수 있는 신호입니다."
      >
        {data.repair.length === 0 ? (
          <p className="py-3 text-[12px] text-muted">
            아직 {data.k_anonymity_threshold}건을 넘긴 부위가 없습니다.
          </p>
        ) : (
          data.repair.map((r) => (
            <Bar
              key={`${r.product_slug}-${r.condition_tag}`}
              label={r.product_name}
              sub={`· ${r.condition_tag}`}
              value={r.repair_count}
              max={maxRepair}
            />
          ))
        )}
      </Panel>
    </div>
  );
}

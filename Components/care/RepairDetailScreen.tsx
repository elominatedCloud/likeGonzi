"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, MapPin, MessageCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { ProductMiniCard } from "@/Components/care/ProductMiniCard";
import { apiFetch } from "@/lib/api-client";
import type { DbRepair } from "@/lib/mock-db";
import {
  STATUS_STEPS,
  areaFromTags,
  areaLabel,
  currentStep,
  formatDate,
} from "@/lib/repair";
import { cn } from "@/lib/cn";
import { showFeatureNotice } from "@/lib/feature-notice";

interface RepairDetailScreenProps {
  productId: string;
  productName: string;
  productColor: string;
  productImage: string;
  repairId: string;
}

export function RepairDetailScreen({
  productId,
  productName,
  productColor,
  productImage,
  repairId,
}: RepairDetailScreenProps) {
  const [repair, setRepair] = useState<DbRepair | null>(null);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    apiFetch<DbRepair>(`/api/products/${productId}/repairs/${repairId}`)
      .then((json) => {
        if (json.ok) setRepair(json.data);
        else setError(json.error?.message ?? "내역을 찾을 수 없습니다.");
      })
      .catch(() => setError("내역을 불러오지 못했습니다."));
  }, [productId, repairId, retryKey]);

  const active = repair ? currentStep(repair.status) : 1;
  const areas = repair ? areaFromTags(repair.condition_tags) : [];
  const expectedDate = repair
    ? new Date(new Date(repair.created_at).getTime() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", ".")
    : "";

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="수선 접수 내역" backHref={`/products/${productId}/repairs`} />
      <ProductMiniCard name={productName} color={productColor} image={productImage} />

      {!repair && !error && (
        <div className="mx-4 mt-5 space-y-3" aria-busy="true" aria-label="수선 내역 불러오는 중">
          <div className="h-28 animate-pulse rounded-2xl bg-black/5"/>
          <div className="h-52 animate-pulse rounded-2xl bg-black/5"/>
          <p className="text-center text-[12px] text-muted">수선 진행 정보를 불러오고 있어요.</p>
        </div>
      )}
      {error && (
        <div className="mx-4 mt-6 rounded-2xl bg-paper px-5 py-8 text-center" role="alert">
          <p className="text-[13px] text-[#8a3a3a]">{error}</p>
          <button type="button" onClick={() => {setError("");setRetryKey((value) => value + 1)}} className="mt-4 inline-flex items-center gap-2 rounded-full border border-cognac/25 px-4 py-2.5 text-[12px] font-semibold text-cognac-deep"><RefreshCw size={14}/> 다시 시도</button>
        </div>
      )}

      {repair && (
        <>
          <section className="mx-5 mt-8">
            <p className="mb-5 text-[11px] tracking-[0.16em] text-muted">REPAIR STATUS</p>
            <ol className="relative ml-3 border-l border-black/10 pl-6">
              {STATUS_STEPS.map((step, index) => {
                const done = index < active;
                const current = index === active;
                return (
                  <li key={step.key} className="relative pb-8 last:pb-0">
                    <span
                      className={cn(
                        "absolute -left-[31px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 bg-cream",
                        done || current
                          ? "border-ink bg-ink text-white"
                          : "border-black/20",
                      )}
                    >
                      {done ? <Check size={10} strokeWidth={3} /> : null}
                    </span>
                    <p
                      className={cn(
                        "text-[15px]",
                        done || current ? "font-semibold text-ink" : "text-muted",
                      )}
                    >
                      {step.label}
                    </p>
                    {index === 0 && (
                      <p className="mt-1 text-[12px] text-muted">
                        {formatDate(repair.created_at)}
                      </p>
                    )}
                    {current && index === 1 && (
                      <p className="mt-1 text-[12px] leading-relaxed text-muted">
                        제품 상태를 확인하고 있습니다.
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <p className="mx-5 mt-2 rounded-xl bg-cream-deep px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
            정확한 수선 방법과 비용은 제품 확인 후 안내됩니다.
          </p>

          <section className="soft-card mx-5 mt-5 grid grid-cols-2 gap-3 px-4 py-4">
            <div className="flex gap-2"><Clock3 size={17} className="mt-0.5 shrink-0 text-cognac"/><div><span className="block text-[10px] text-muted">예상 완료일</span><b className="mt-1 block text-[13px] text-ink">{expectedDate}</b></div></div>
            <div className="flex gap-2"><MapPin size={17} className="mt-0.5 shrink-0 text-cognac"/><div><span className="block text-[10px] text-muted">담당 매장</span><b className="mt-1 block text-[13px] text-ink">{repair.location || "배정 대기"}</b></div></div>
          </section>

          <section className="mx-5 mt-6 space-y-3 border-t border-black/5 pt-4 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted">수선 부위</span>
              <span className="font-medium text-ink">
                {areas.map(areaLabel).join(" · ") || repair.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">신청일</span>
              <span className="font-medium text-ink">{formatDate(repair.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">최근 업데이트</span>
              <span className="font-medium text-ink">{formatDate(repair.updated_at)}</span>
            </div>
          </section>

          <button type="button" onClick={() => showFeatureNotice("repairContact")} className="mx-5 mt-6 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-2xl border border-cognac/25 bg-paper py-3.5 text-[13px] font-semibold text-cognac-deep"><MessageCircle size={17}/> 담당 매장에 문의하기</button>
        </>
      )}

      <BottomNav />
    </main>
  );
}

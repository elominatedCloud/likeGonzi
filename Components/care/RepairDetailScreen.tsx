"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { ProductMiniCard } from "@/Components/care/ProductMiniCard";
import type { DbRepair } from "@/lib/mock-db";
import {
  STATUS_STEPS,
  areaFromTags,
  areaLabel,
  currentStep,
  formatDate,
} from "@/lib/repair";
import { cn } from "@/lib/cn";

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

  useEffect(() => {
    fetch(`/api/products/${productId}/repairs/${repairId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setRepair(json.data);
        else setError(json.error?.message ?? "내역을 찾을 수 없습니다.");
      })
      .catch(() => setError("내역을 불러오지 못했습니다."));
  }, [productId, repairId]);

  const active = repair ? currentStep(repair.status) : 1;
  const areas = repair ? areaFromTags(repair.condition_tags) : [];

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="수선 접수 내역" backHref={`/products/${productId}/repairs`} />
      <ProductMiniCard name={productName} color={productColor} image={productImage} />

      {!repair && !error && (
        <p className="px-4 py-10 text-center text-[13px] text-muted">불러오는 중…</p>
      )}
      {error && (
        <p className="px-4 py-10 text-center text-[13px] text-[#8a3a3a]">{error}</p>
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
          </section>
        </>
      )}

      <BottomNav />
    </main>
  );
}

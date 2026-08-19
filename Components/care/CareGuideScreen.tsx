"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/Components/ui/SafeImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Droplets,
  Info,
  Shirt,
  Sparkles,
  SunMedium,
  ThumbsUp,
} from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { clinicTips } from "@/lib/data";
import type { Product, RepairRecord } from "@/types";
import { cn } from "@/lib/cn";

interface CareGuideScreenProps {
  product: Product;
  repairs: RepairRecord[];
}

const tipIcons = {
  cloth: Shirt,
  detergent: Sparkles,
  sun: SunMedium,
  moisture: Droplets,
};

export function CareGuideScreen({ product, repairs }: CareGuideScreenProps) {
  const searchParams = useSearchParams();
  const initial =
    searchParams.get("tab") === "repairs" ? "repairs" : "tips";
  const [tab, setTab] = useState<"tips" | "repairs">(initial);
  const [scoreOpen, setScoreOpen] = useState(false);

  const sortedRepairs = useMemo(
    () =>
      [...repairs].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [repairs],
  );
  const repairBonus = Math.min(8, repairs.length * 2);
  const recentCheckBonus = Math.max(0, product.careScore - 80 - repairBonus);

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <AmbientPattern variant="product" />
      <PageHeader title="MATERIAL CARE" backHref={`/products/${product.id}`} />

      <section className="soft-card mx-4 mt-2 overflow-hidden">
        <button type="button" onClick={() => setScoreOpen((value) => !value)} className="flex w-full items-center gap-4 px-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cognac" aria-expanded={scoreOpen}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f0e4d2] to-[#e4d2b8] text-cognac">
            <ThumbsUp size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[12px] text-muted">케어 점수 <Info size={12}/></p>
            <p className="font-serif text-[28px] leading-none text-ink">
              {product.careScore}{" "}
              <span className="text-[16px] text-muted">/ 100점</span>
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">최근 관리 기록을 반영한 프로토타입 점수</p>
          </div>
          <ChevronDown size={17} className={`shrink-0 text-muted transition ${scoreOpen ? "rotate-180" : ""}`}/>
        </button>
        {scoreOpen && (
          <div className="border-t border-black/5 bg-cream/65 px-4 py-4">
            <p className="text-[11px] leading-[17px] text-muted">현재는 실제 센서나 진단 결과가 아닌 등록된 관리·수선 기록을 기준으로 계산한 데모 산정입니다.</p>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between"><dt className="text-ink-soft">제품 등록 기본 점수</dt><dd className="font-semibold text-ink">80점</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">관리·수선 기록 반영</dt><dd className="font-semibold text-ink">+{repairBonus}점</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">최근 상태 점검 반영</dt><dd className="font-semibold text-ink">+{recentCheckBonus}점</dd></div>
            </dl>
            <p className="mt-3 text-[10px] text-muted">최근 갱신 · 2026.08.19</p>
          </div>
        )}
      </section>

      <div className="mx-4 mt-5 flex border-b border-black/8">
        {(
          [
            { key: "tips", label: "클리닉 tip" },
            { key: "repairs", label: "수선 기록" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "flex-1 pb-3 text-[14px]",
              tab === item.key
                ? "border-b-2 border-ink font-semibold text-ink"
                : "text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "tips" ? (
        <section className="mx-4 mt-4 space-y-3">
          {clinicTips.map((tip) => {
            const Icon = tipIcons[tip.icon];
            return (
              <article
                key={tip.id}
                className="soft-card flex items-start gap-3 px-4 py-4"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-cream-deep text-cognac">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink">
                    {tip.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {tip.description}
                  </p>
                </div>
              </article>
            );
          })}
          <article className="soft-card px-4 py-5 text-center">
            <p className="font-serif text-[13px] tracking-[0.12em] text-muted">
              Recommended Clinic Cycle
            </p>
            <p className="mt-2 text-[16px] font-semibold text-ink">
              추천 클리닉 주기 · 3~6개월에 한 번
            </p>
          </article>
        </section>
      ) : (
        <section className="mx-4 mt-4 space-y-3">
          {sortedRepairs.length === 0 ? (
            <div className="soft-card px-6 py-10 text-center">
              <p className="text-[14px] font-semibold text-ink">아직 등록된 수선 기록이 없어요</p>
              <p className="mt-2 text-[12px] leading-5 text-muted">제품 상태가 달라졌다면 사진과 메모를 남겨<br/>첫 수선 접수를 시작할 수 있어요.</p>
              <Link href={`/products/${product.id}/repairs/new`} className="mt-5 inline-flex rounded-full bg-cognac-deep px-5 py-3 text-[13px] font-semibold text-white">첫 수선 접수하기</Link>
            </div>
          ) : sortedRepairs.map((repair) => (
            <Link
              key={repair.id}
              href={`/products/${product.id}/repairs`}
              className="soft-card flex items-center gap-3 px-3 py-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                <SafeImage
                  src={repair.thumbnail}
                  alt={repair.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted">{repair.date}</p>
                <p className="mt-0.5 text-[14px] font-semibold text-ink">
                  {repair.title}
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {repair.location}
                  {repair.source === "ai_custom" ? " · 직접 등록" : ""}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}

      {tab === "repairs" && (
        <div
          className="pointer-events-none fixed bottom-[88px] left-1/2 z-30 w-full -translate-x-1/2"
          style={{ maxWidth: "var(--app-frame)" }}
        >
          <Link
            href={`/products/${product.id}/repairs/new`}
            className="pointer-events-auto ml-auto mr-5 flex w-fit items-center gap-1.5 rounded-full bg-cognac-deep px-4 py-3 text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(110,67,44,0.35)]"
          >
            <span className="text-[18px] leading-none">+</span>
            수선 접수
          </Link>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

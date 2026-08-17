"use client";

import Link from "next/link";
import { SafeImage } from "@/Components/ui/SafeImage";
import { Bell, Star } from "lucide-react";
import { BottomNav } from "@/Components/ui/BottomNav";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { showFeatureNotice } from "@/lib/feature-notice";
import {
  benefitCard,
  careReminder,
  currentUser,
  products,
} from "@/lib/data";

export function HomeScreen() {
  const chips = currentUser.lifestyleChips.filter((c) =>
    ["도시 여행", "아트 워크", "주말 산책", "출장"].includes(c),
  );

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <AmbientPattern variant="home" />
      <div className="px-5 pt-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-[0.14em] text-ink">
              MCM
            </div>
            <p className="type-eyebrow text-gold">
              MCM · STORYBOOK
            </p>
            <h1 className="mt-1 text-[24px] font-bold leading-8 tracking-[-0.02em] text-ink">
              {currentUser.name}님의 아카이브
            </h1>
          </div>
          <button
            type="button"
            className="relative mt-1 rounded-full p-2 text-ink"
            aria-label="알림"
            onClick={() => showFeatureNotice("notifications")}
          >
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cognac" />
          </button>
        </div>

        <section className="rise-in mb-3 rounded-[20px] bg-[#fffdfa] px-3 pb-3 pt-4 shadow-[0_10px_28px_rgba(43,33,28,0.08)]">
          <h2 className="mb-4 px-1 text-[13px] font-bold leading-5 tracking-[-0.01em] text-ink">내 제품</h2>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {products.map((product,index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="relative h-[435px] w-[271px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-[#d0aa84]"
              >
                <div className="relative h-[316px] bg-[#d0aa84]">
                  <SafeImage
                    src={product.cutoutImage}
                    alt={product.name}
                    fill
                    className="object-contain px-5 pb-3 pt-9"
                    sizes="271px"
                    priority={index===0}
                  />
                  <span className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-cognac shadow-sm">
                    <Star
                      size={16}
                      className={product.isFavorite ? "fill-cognac text-cognac" : ""}
                    />
                  </span>
                </div>
                <div className="h-[119px] bg-[#2d1b0f] px-4 py-5 text-white">
                  <p className="font-serif text-[16px] font-medium leading-6">
                    {product.name}
                  </p>
                  <p className="mt-5 text-[10px] leading-4 tracking-[0.02em] text-white/72">
                    {product.color.toUpperCase()} · {product.year}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rise-in mb-3" style={{ animationDelay: "60ms" }}>
          <Link
            href={`/products/${products[0].id}/care`}
            className="soft-card flex items-center gap-3 px-4 py-4"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-gold">
              <div
                className="absolute inset-1 rounded-full border-2 border-gold/40"
                style={{
                  background: `conic-gradient(var(--gold) ${careReminder.ventilation * 3.6}deg, transparent 0)`,
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                  WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                }}
              />
              <span className="type-meta font-semibold text-gold">
                {careReminder.ventilation}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="type-kicker text-gold">
                장마철 케어
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-[22px] text-ink">
                {careReminder.title}
              </p>
              <p className="type-meta mt-1 text-muted">
                {careReminder.detail} →
              </p>
            </div>
          </Link>
        </section>

        <section className="rise-in mb-3" style={{ animationDelay: "100ms" }}>
          <div className="relative overflow-hidden rounded-[18px] bg-[#fff4d8] px-4 py-4 shadow-[0_10px_30px_rgba(43,33,28,0.06)]">
            <p className="type-kicker text-gold">
              멤버십 혜택
            </p>
            <p className="mt-1 pr-16 text-[16px] font-semibold leading-6 text-ink">
              {benefitCard.title}
            </p>
            <p className="type-meta mt-1 text-ink-soft">
              {benefitCard.detail}
            </p>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
              <p className="font-serif text-[34px] leading-none text-cognac-deep">
                D-{benefitCard.dDay}
              </p>
            </div>
          </div>
        </section>

        <section className="soft-card rise-in px-4 py-4" style={{ animationDelay: "140ms" }}>
          <h2 className="mb-3 text-[15px] font-semibold leading-[22px] text-ink">
            다음 이야기를 위한 제안
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {chips.slice(0, 3).map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[13px] leading-5 text-ink-soft"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-[16px] bg-ink px-4 py-4 text-white">
            <div>
              <p className="type-kicker text-gold-soft">
                이번 달 기록
              </p>
              <p className="mt-1 text-[14px] font-medium leading-5">
                서울의 7월, 영상으로 다시 만나기
              </p>
            </div>
            <button type="button" className="text-[12px] tracking-wide text-gold-soft">
              PLAY →
            </button>
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}

"use client";

import Link from "next/link";
import { SafeImage } from "@/Components/ui/SafeImage";
import { Bell, Leaf, Star } from "lucide-react";
import { BottomNav } from "@/Components/ui/BottomNav";
import {
  benefitCard,
  careReminder,
  currentUser,
  esgHighlights,
  products,
} from "@/lib/data";

export function HomeScreen() {
  const chips = currentUser.lifestyleChips.filter((c) =>
    ["도시 여행", "아트 워크", "주말 산책", "출장"].includes(c),
  );

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <div className="px-5 pt-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-[0.18em] text-ink">
              MCM
            </div>
            <p className="font-serif text-[11px] tracking-[0.18em] text-gold">
              MCM · STORYBOOK
            </p>
            <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink">
              {currentUser.name}님의 아카이브
            </h1>
          </div>
          <button
            type="button"
            className="relative mt-1 rounded-full p-2 text-ink"
            aria-label="알림"
          >
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cognac" />
          </button>
        </div>

        <section className="rise-in mb-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">내 제품</h2>
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="soft-card relative w-[168px] shrink-0 overflow-hidden"
              >
                <div className="relative h-[150px] bg-gradient-to-b from-[#ebe4da] to-white">
                  <SafeImage
                    src={product.cutoutImage}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="168px"
                  />
                  <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-ink">
                    <Star
                      size={14}
                      className={product.isFavorite ? "fill-cognac text-cognac" : ""}
                    />
                  </span>
                </div>
                <div className="bg-cognac-deep px-3 py-2.5 text-white">
                  <p className="text-[13px] font-medium leading-tight">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[10px] tracking-wide text-white/70">
                    {product.color.toUpperCase()} · {product.year}
                  </p>
                </div>
              </Link>
            ))}
            <Link
              href="/camera"
              className="flex w-[120px] shrink-0 flex-col items-center justify-center rounded-[18px] border border-dashed border-cognac/30 bg-white/50 text-muted"
            >
              <span className="text-2xl text-cognac">+</span>
              <span className="mt-1 text-[12px]">제품 추가</span>
            </Link>
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
              <span className="text-[10px] font-semibold text-gold">
                {careReminder.ventilation}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.12em] text-gold">
                CARE REMINDER · {careReminder.season}
              </p>
              <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">
                {careReminder.title}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                {careReminder.detail} →
              </p>
            </div>
          </Link>
        </section>

        <section className="rise-in mb-3" style={{ animationDelay: "100ms" }}>
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#f7ecd8] to-[#f3e2c4] px-4 py-4 shadow-[0_10px_30px_rgba(43,33,28,0.06)]">
            <p className="text-[10px] tracking-[0.12em] text-gold">
              GOLD MEMBER BENEFIT
            </p>
            <p className="mt-1 pr-16 text-[15px] font-semibold text-ink">
              {benefitCard.title}
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">
              {benefitCard.detail}
            </p>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
              <p className="font-serif text-[34px] leading-none text-cognac-deep">
                D-{benefitCard.dDay}
              </p>
            </div>
          </div>
        </section>

        <section className="rise-in mb-3" style={{ animationDelay: "140ms" }}>
          <div className="soft-card overflow-hidden px-4 py-4">
            <div className="mb-2 flex items-center gap-2">
              <Leaf size={14} className="text-gold" />
              <p className="text-[10px] tracking-[0.12em] text-gold">
                {esgHighlights[0].label}
              </p>
            </div>
            <p className="text-[14px] font-semibold text-ink">
              {esgHighlights[0].title}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              {esgHighlights[0].description}
            </p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-cream-deep px-2.5 py-1 text-[10px] text-ink-soft">
                SBTi Net-Zero
              </span>
              <span className="rounded-full bg-cream-deep px-2.5 py-1 text-[10px] text-ink-soft">
                Butterfly Mark
              </span>
              <span className="rounded-full bg-cream-deep px-2.5 py-1 text-[10px] text-ink-soft">
                Circular Care
              </span>
            </div>
          </div>
        </section>

        <section className="rise-in" style={{ animationDelay: "180ms" }}>
          <h2 className="mb-3 text-[15px] font-semibold text-ink">
            다음 이야기를 위한 제안
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {chips.slice(0, 3).map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[12px] text-ink-soft"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-[16px] bg-ink px-4 py-4 text-white">
            <div>
              <p className="text-[10px] tracking-[0.14em] text-gold-soft">
                AI STORYBOOK
              </p>
              <p className="mt-1 text-[13px] font-medium">
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

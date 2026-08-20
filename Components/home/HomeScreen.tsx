"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeImage } from "@/Components/ui/SafeImage";
import { Bell, PackagePlus, RefreshCw, Star } from "lucide-react";
import { BottomNav } from "@/Components/ui/BottomNav";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { showFeatureNotice } from "@/lib/feature-notice";
import { apiFetch } from "@/lib/api-client";
import { RecapCard } from "@/Components/product/RecapCard";
import { toProductView, type HomeData } from "@/lib/api-view";

type HomeViewState = "ready" | "loading" | "empty" | "error";

export function HomeScreen({ viewState }: { viewState?: HomeViewState }) {
  const benefitCarouselRef = useRef<HTMLDivElement>(null);
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const [activeBenefitIndex, setActiveBenefitIndex] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [home, setHome] = useState<HomeData | null>(null);
  const [fetchedState, setFetchedState] = useState<HomeViewState>("loading");

  // viewState prop은 /home?state=... 디자인 QA용 강제 지정. 없으면 실제 API 상태를 쓴다.
  const state = viewState ?? fetchedState;

  useEffect(() => {
    if (viewState) return;
    let cancelled = false;
    apiFetch<HomeData>("/api/home")
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) {
          setFetchedState("error");
          return;
        }
        setHome(json.data);
        setFetchedState(json.data.products.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) setFetchedState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [viewState]);

  const products = (home?.products ?? []).map(toProductView);
  const careReminder = home?.care_reminder ?? null;
  const benefitCard = home?.benefit ?? null;
  const chips = home?.lifestyle_suggestions.chips ?? [];
  const hasProducts = products.length > 0;
  const slideCount = careReminder ? 2 : 1;

  // 마지막 뒤에 첫 카드의 복제본을 한 장 더 둔다.
  // 오른쪽 끝에서 되돌아가는 대신 복제본까지 계속 밀고, 애니메이션이 끝난 뒤
  // 티 안 나게 맨 앞으로 되돌려서 한 방향으로만 무한히 도는 것처럼 보이게 한다.
  const productSlides = products.length > 1 ? [...products, products[0]] : products;

  // 두 캐러셀이 나란히 넘어가면 기계적으로 보인다.
  // 배수 관계가 아닌 값으로 두어 겹치는 주기를 길게 벌린다(9000/6500 → 약 2분).
  const PRODUCT_ROTATE_MS = 9000;
  const BENEFIT_ROTATE_MS = 6500;

  const moveBenefitCarousel = useCallback((index: number) => {
    const carousel = benefitCarouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
    setActiveBenefitIndex(index);
  }, []);

  const moveProductCarousel = useCallback((index: number) => {
    const carousel = productCarouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
    setActiveProductIndex(index);
  }, []);

  // 제품이 2개 이상일 때만 오른쪽에서 왼쪽으로 계속 넘어간다.
  useEffect(() => {
    if (products.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let jumpTimer = 0;
    const timer = window.setInterval(() => {
      const carousel = productCarouselRef.current;
      if (!carousel) return;

      // 복제본(마지막 장)에 서 있으면 내용이 같은 원본 첫 장으로 순간 이동한 뒤
      // 다음 장으로 넘긴다. 화면상으로는 끊김 없이 한 방향으로만 계속 흐른다.
      if (activeProductIndex >= products.length) {
        // 순간 이동과 부드러운 스크롤을 같은 tick에 붙이면 한 프레임 안에서 두 위치가
        // 섞여 카드 위/아래가 어긋나 보인다. 태스크를 나눠 페인트를 분리한다.
        // (requestAnimationFrame은 배경 탭에서 실행되지 않아 setTimeout을 쓴다)
        carousel.scrollTo({ left: 0, behavior: "auto" });
        jumpTimer = window.setTimeout(() => moveProductCarousel(1), 0);
        return;
      }

      moveProductCarousel(activeProductIndex + 1);
    }, PRODUCT_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(jumpTimer);
    };
  }, [activeProductIndex, moveProductCarousel, products.length]);

  useEffect(() => {
    if (slideCount < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      moveBenefitCarousel(activeBenefitIndex === 0 ? 1 : 0);
    }, BENEFIT_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [activeBenefitIndex, moveBenefitCarousel, slideCount]);

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
            {/* 이름이 오기 전에 "나님"으로 단정하지 않는다. 화면의 다른 요소와
                같이 스켈레톤으로 기다리고, 못 불러오면 이름 없이 적는다. */}
            <h1 className="mt-1 text-[24px] font-bold leading-8 tracking-[-0.02em] text-ink">
              {state === "loading" ? (
                <span
                  className="inline-block h-7 w-40 animate-pulse rounded bg-ink/10 align-middle"
                  aria-label="이름 불러오는 중"
                />
              ) : home?.user.display_name ? (
                `${home.user.display_name}님의 아카이브`
              ) : (
                "내 아카이브"
              )}
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

        {state === "loading" && (
          <section className="soft-card overflow-hidden px-4 py-5" aria-label="내 제품 불러오는 중" aria-busy="true">
            <div className="h-4 w-16 animate-pulse rounded bg-black/8" />
            <div className="mt-4 h-[410px] animate-pulse rounded-[20px] bg-[#e7ded4]" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/8" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-black/5" />
            </div>
            <p className="mt-5 text-center text-[12px] text-muted" role="status">내 제품과 기록을 불러오고 있어요.</p>
          </section>
        )}

        {state === "error" && (
          <section className="soft-card flex min-h-[390px] flex-col items-center justify-center px-7 py-10 text-center" role="alert">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f4e8e4] text-[#8a3a3a]">
              <RefreshCw size={25} strokeWidth={1.5}/>
            </span>
            <h2 className="mt-5 text-[19px] font-semibold text-ink">제품 정보를 불러오지 못했어요</h2>
            <p className="mt-2 text-[13px] leading-5 text-muted">네트워크 연결을 확인한 뒤 다시 시도해주세요.</p>
            <Link href="/home" className="mt-6 inline-flex items-center gap-2 rounded-full border border-cognac/25 bg-white px-5 py-3 text-[13px] font-semibold text-cognac-deep"><RefreshCw size={15}/> 다시 시도</Link>
          </section>
        )}

        {(state === "ready" || state === "empty") && <>
        <section className="rise-in mb-3 rounded-[20px] bg-[#fffdfa] px-3 pb-3 pt-4 shadow-[0_10px_28px_rgba(43,33,28,0.08)]">
          <h2 className="mb-4 px-1 text-[13px] font-bold leading-5 tracking-[-0.01em] text-ink">내 제품</h2>

          {!hasProducts && (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[20px] bg-cream px-7 py-10 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-deep text-cognac-deep">
                <PackagePlus size={27} strokeWidth={1.5}/>
              </span>
              <h3 className="mt-5 text-[19px] font-semibold text-ink">아직 등록된 제품이 없어요</h3>
              <p className="mt-2 text-[13px] leading-5 text-muted">제품 태그의 QR 또는 NFC를 스캔하면<br/>나만의 Storybook을 시작할 수 있어요.</p>
              <Link href="/camera?mode=qr" className="mt-6 w-full rounded-2xl bg-cognac-deep py-3.5 text-[14px] font-semibold text-white">첫 제품 등록하기</Link>
            </div>
          )}

          <div
            ref={productCarouselRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto pb-1"
            onScroll={(event) => {
              const { clientWidth, scrollLeft } = event.currentTarget;
              if (clientWidth > 0) setActiveProductIndex(Math.round(scrollLeft / clientWidth));
            }}
          >
            {productSlides.map((product,index) => (
              <Link
                key={`${product.id}-${index}`}
                href={`/products/${product.id}`}
                className={`relative h-[435px] w-full shrink-0 snap-start overflow-hidden rounded-[20px] bg-[#d0aa84] transition-opacity duration-500 ${
                  activeProductIndex === index ? "opacity-100" : "opacity-80"
                }`}
              >
                <div className="relative h-[316px] bg-[#d0aa84]">
                  <SafeImage
                    src={product.cutoutImage}
                    alt={product.name}
                    fill
                    className="object-contain px-5 pb-3 pt-9"
                    sizes="(max-width: 430px) 100vw, 430px"
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

          {products.length > 1 && (
            <div
              className="mt-3 flex items-center justify-center gap-1.5"
              aria-label={`${(activeProductIndex % products.length) + 1} / ${products.length}`}
            >
              {products.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  className={`h-1.5 rounded-full transition-all ${
                    activeProductIndex % products.length === index
                      ? "w-4 bg-cognac"
                      : "w-1.5 bg-black/15"
                  }`}
                  onClick={() => moveProductCarousel(index)}
                  aria-label={`${product.name} 보기`}
                  aria-current={activeProductIndex === index ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </section>

        <section
          className="rise-in relative mb-3 overflow-hidden rounded-[18px]"
          style={{ animationDelay: "60ms" }}
          aria-roledescription="carousel"
          aria-label="케어 및 멤버십 안내"
        >
          <div
            ref={benefitCarouselRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
            onScroll={(event) => {
              const { clientWidth, scrollLeft } = event.currentTarget;
              if (clientWidth > 0) setActiveBenefitIndex(Math.round(scrollLeft / clientWidth));
            }}
          >
            {careReminder && (
            <Link
              href={`/products/${careReminder.product_id}/care`}
              className="soft-card flex min-h-[126px] w-full shrink-0 snap-center items-center gap-3 px-4 py-4 pr-12"
              aria-label="장마철 케어 안내, 첫 번째 배너"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-gold">
                <div
                  className="absolute inset-1 rounded-full border-2 border-gold/40"
                  style={{
                    background: `conic-gradient(var(--gold) ${(careReminder?.ventilation ?? 0) * 3.6}deg, transparent 0)`,
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                    WebkitMask:
                      "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                  }}
                />
                <span className="type-meta font-semibold text-gold">
                  {careReminder?.ventilation ?? 0}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="type-kicker text-gold">장마철 케어</p>
                <p className="mt-1 text-[15px] font-semibold leading-[22px] text-ink">
                  {careReminder?.title}
                </p>
                <p className="type-meta mt-1 text-muted">
                  {careReminder?.detail} →
                </p>
              </div>
            </Link>
            )}

            <div
              className={`relative min-h-[126px] w-full shrink-0 snap-center overflow-hidden bg-[#fff4d8] px-4 py-4 shadow-[0_10px_30px_rgba(43,33,28,0.06)] ${benefitCard?.d_day != null ? "pr-24" : ""}`}
              aria-label="멤버십 혜택 안내, 두 번째 배너"
            >
              <p className="type-kicker text-gold">멤버십 혜택</p>
              <p className="mt-1 text-[16px] font-semibold leading-6 text-ink">
                {benefitCard?.title}
              </p>
              <p className="type-meta mt-1 text-ink-soft">
                {benefitCard?.detail}
              </p>
              {benefitCard?.d_day != null && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                  <p className="font-serif text-[34px] leading-none text-cognac-deep">
                    D-{benefitCard.d_day}
                  </p>
                </div>
              )}
            </div>
          </div>

          {slideCount > 1 && (
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5" aria-label={`${activeBenefitIndex + 1} / ${slideCount}`}>
            {Array.from({ length: slideCount }, (_, index) => index).map((index) => (
              <button
                key={index}
                type="button"
                className={`h-1.5 rounded-full border border-white/50 backdrop-blur-sm transition-all ${
                  activeBenefitIndex === index
                    ? "w-4 bg-[#3a2518]/70"
                    : "w-1.5 bg-[#3a2518]/20"
                }`}
                onClick={() => moveBenefitCarousel(index)}
                aria-label={`${index + 1}번째 안내 보기`}
                aria-current={activeBenefitIndex === index ? "true" : undefined}
              />
            ))}
          </div>
          )}
        </section>

        {hasProducts && (
        <section className="soft-card rise-in px-4 py-4" style={{ animationDelay: "100ms" }}>
          <h2 className="mb-3 text-[15px] font-semibold leading-[22px] text-ink">
            다음 이야기를 위한 제안
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {chips.slice(0, 3).map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[13px] leading-5 text-ink-soft"
              >
                {chip}
              </span>
            ))}
          </div>
          <RecapCard productId={products[0].id} />
        </section>
        )}
        </>}
      </div>
      <BottomNav />
    </main>
  );
}

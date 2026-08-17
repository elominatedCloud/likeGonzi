"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/Components/ui/SafeImage";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  ChevronDown,
  FileText,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import type { Product, RepairRecord, Story } from "@/types";

interface ProductDetailScreenProps {
  product: Product;
  stories: Story[];
  repairs: RepairRecord[];
}

function shortMaterial(material: string) {
  if (material.toLowerCase().includes("visetos")) return "Visetos";
  return material.split(/[/,]/)[0]?.trim() || material;
}

export function ProductDetailScreen({
  product,
  stories,
  repairs,
}: ProductDetailScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [editingName, setEditingName] = useState(false);
  const [slide, setSlide] = useState(0);
  const [showSerial, setShowSerial] = useState(false);
  const [leatherPreview, setLeatherPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const heroImages = useMemo(
    () => [product.cutoutImage, ...product.lifestyleImages],
    [product],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % heroImages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const latestAiRepair =
    repairs.find((r) => r.source === "ai_custom") ?? repairs[0];

  function onLeatherUpload(file?: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLeatherPreview(url);
  }

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader
        title={name}
        backHref="/home"
        onMore={() => setMenuOpen(true)}
        rightSlot={
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center text-ink"
            aria-label="제품 메뉴"
          >
            <Star size={18} strokeWidth={1.5} />
          </button>
        }
      />

      <section className="relative mx-auto h-[280px] w-full max-w-[360px]">
        {heroImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slide === index ? "hero-fade opacity-100" : "opacity-0"
            }`}
          >
            <SafeImage
              src={src}
              alt={`${name} image ${index + 1}`}
              fill
              className={`object-contain ${index === 0 ? "p-8" : "object-cover rounded-2xl mx-4"}`}
              sizes="360px"
              priority={index === 0}
            />
          </div>
        ))}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {heroImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                slide === i ? "w-4 bg-cognac" : "w-1.5 bg-black/20"
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="soft-card mx-4 mt-2 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-[28px] leading-none text-ink">{name}</h2>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eef6ea] px-2.5 py-1 text-[11px] font-medium text-[#3d6b3a]">
            <BadgeCheck size={12} /> 정품 인증 완료
          </span>
        </div>

        <p className="mt-3 text-[13px] text-ink-soft">
          {product.color} · {shortMaterial(product.material)}
        </p>
        <p className="mt-1 text-[12px] text-muted">{product.registeredAt}</p>

        <button
          type="button"
          onClick={() => setShowSerial((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted"
        >
          인증 정보
          <ChevronDown
            size={12}
            className={`transition ${showSerial ? "rotate-180" : ""}`}
          />
        </button>
        {showSerial && (
          <p className="mt-1 text-[11px] tracking-wide text-muted/80">
            {product.serial} · {product.store}
          </p>
        )}
      </section>

      <section className="mx-4 mt-5">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="font-serif text-[12px] tracking-[0.16em] text-muted">
              MATERIAL CARE
            </p>
            <h3 className="mt-1 text-[16px] font-semibold text-ink">
              비세토스 습도 · 오염 관리
            </h3>
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-md bg-cream-deep px-2 py-1 text-[11px] text-ink-soft">
              수선권 {product.repairVouchers}
            </span>
            <span className="rounded-md bg-cream-deep px-2 py-1 text-[11px] text-ink-soft">
              클리닝권 {product.cleaningVouchers}
            </span>
          </div>
        </div>
        <Link
          href={`/products/${product.id}/care`}
          className="text-[12px] text-cognac"
        >
          케어 가이드 보기 →
        </Link>
      </section>

      <section className="soft-card mx-4 mt-4 p-3">
        <div className="flex gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
            <SafeImage
              src={latestAiRepair.thumbnail}
              alt={latestAiRepair.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-[0.12em] text-muted">
              REPAIR HISTORY · {repairs.length}
            </p>
            <p className="mt-1 text-[14px] font-semibold text-ink">
              {latestAiRepair.title}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {latestAiRepair.foundAt ?? latestAiRepair.date} 발견 / AI 커스텀
            </p>
            <div className="mt-2 flex items-center justify-between">
              <Link
                href={`/products/${product.id}/care?tab=repairs`}
                className="text-[12px] text-cognac"
              >
                자세히 →
              </Link>
              <Link
                href={`/products/${product.id}/repairs/new`}
                className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] text-white"
              >
                <Sparkles size={12} />
                AI로 수선 부위 찾기
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
          제품을 촬영하면 AI가 마모·오염 구간을 표시하고, 원하는 이미지로
          커스텀 진단 카드를 만들 수 있어요.
        </p>
      </section>

      <section className="soft-card mx-4 mt-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="font-serif text-[13px] tracking-[0.14em] text-ink">
            MY STORYS
          </h3>
          <Link
            href={`/products/${product.id}/stories`}
            className="text-[12px] text-muted"
          >
            전체보기 →
          </Link>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-4">
          {stories.map((story) => (
            <article
              key={story.id}
              className="relative h-[210px] w-[148px] shrink-0 overflow-hidden rounded-2xl"
            >
              <SafeImage
                src={story.image}
                alt={story.tag}
                fill
                className="object-cover"
                sizes="148px"
              />
              <span className="ribbon-tag">
                {story.tag} ({story.count})
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="soft-card mx-4 mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-serif text-[12px] tracking-[0.14em] text-muted">
              LEATHER CHECK
            </p>
            <h3 className="mt-1 text-[15px] font-semibold text-ink">
              가죽 · 하드웨어 직접 점검
            </h3>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-full bg-cognac px-3 py-1.5 text-[12px] text-white"
          >
            <Camera size={14} />
            사진 촬영
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onLeatherUpload(e.target.files?.[0])}
          />
        </div>
        <div className="relative h-36 overflow-hidden rounded-xl bg-cream-deep">
          {leatherPreview ? (
            <SafeImage
              src={leatherPreview}
              alt="가죽 점검 사진"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
              <div className="rounded-full border border-dashed border-cognac/40 px-4 py-3 text-center">
                <p className="font-serif text-[18px] tracking-[0.2em] text-cognac/50">
                  MCM
                </p>
                <p className="mt-1 text-[11px]">
                  로고만이 아닌, 내 제품 사진을 올려 점검하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Link
        href={`/products/${product.id}?action=transfer`}
        className="soft-card mx-4 mt-4 mb-2 flex items-center gap-3 px-4 py-4"
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep text-cognac">
          <FileText size={18} />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink">제품 소유권 이전</p>
          <p className="text-[12px] text-muted">소유권 이전 및 양도 신청</p>
        </div>
        <span className="text-muted">›</span>
      </Link>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="닫기"
            onClick={() => {
              setMenuOpen(false);
              setEditingName(false);
            }}
          />
          <div className="relative w-full max-w-[430px] rounded-t-3xl bg-paper px-5 pb-8 pt-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10" />
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-serif text-[18px] text-ink">제품 관리</h4>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {editingName ? (
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-cream px-3 py-3 text-[14px] outline-none focus:border-cognac"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setMenuOpen(false);
                  }}
                  className="w-full rounded-xl bg-ink py-3 text-[14px] text-white"
                >
                  제품명 저장
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="flex w-full items-center gap-3 rounded-xl bg-cream px-3 py-3 text-left text-[14px]"
                  >
                    <Pencil size={16} className="text-cognac" />
                    제품명 수정
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl bg-cream px-3 py-3 text-left text-[14px]"
                  >
                    <FileText size={16} className="text-cognac" />
                    제품 소유권 이전
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl bg-[#f8ecec] px-3 py-3 text-left text-[14px] text-[#8a3a3a]"
                  >
                    <Trash2 size={16} />
                    제품 삭제
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

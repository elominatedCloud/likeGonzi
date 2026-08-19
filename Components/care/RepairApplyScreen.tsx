"use client";

import { useRef, useState } from "react";
import { SafeImage } from "@/Components/ui/SafeImage";
import Link from "next/link";
import { Camera, Check, MapPin, PackageCheck } from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { ProductMiniCard } from "@/Components/care/ProductMiniCard";
import { apiFetch } from "@/lib/api-client";
import { persistStoryPhoto } from "@/lib/story-photo-storage";
import { cn } from "@/lib/cn";
import { AREA_TAGS, CONDITION_TYPES, areaLabel, formatDate } from "@/lib/repair";
import type { DbRepair } from "@/lib/mock-db";

interface RepairApplyScreenProps {
  productId: string;
  productName: string;
  productColor: string;
  productImage: string;
}

export function RepairApplyScreen({
  productId,
  productName,
  productColor,
  productImage,
}: RepairApplyScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [area, setArea] = useState("strap");
  const [condition, setCondition] = useState("wear");
  const [memo, setMemo] = useState("");
  const [receiveMethod, setReceiveMethod] = useState<"visit" | "delivery">("visit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<DbRepair | null>(null);

  function onFile(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!photo) {
      setError("수선 부위를 확인할 수 있는 사진을 먼저 등록해주세요.");
      fileRef.current?.click();
      return;
    }
    setSubmitting(true);
    setError("");
    const title = `${areaLabel(area)} 수선`;
    try {
      // 사진은 private Storage(story-photos)에 먼저 올리고 경로만 보낸다.
      // Supabase 세션이 없는 데모 환경에서는 data URL 그대로 폴백.
      const persisted = await persistStoryPhoto(photo, `repairs-${productId}`);
      const json = await apiFetch<DbRepair>(`/api/products/${productId}/repairs`, {
        method: "POST",
        body: JSON.stringify({
          title,
          condition_tags: [area, condition],
          location: "접수 대기",
          source: "user",
          ...(persisted.mode === "cloud"
            ? { thumbnail_path: persisted.photoPath }
            : { thumbnail_url: photo }),
          memo,
        }),
      });
      if (!json.ok) {
        setError(json.error?.message ?? "접수에 실패했습니다.");
        return;
      }
      setDone(json.data);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "네트워크 연결을 확인한 뒤 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="visetos-bg relative flex min-h-dvh flex-col pb-10">
        <PageHeader title="수선 신청" backHref={`/products/${productId}/care?tab=repairs`} />
        <div className="flex flex-1 flex-col items-center px-8 pt-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-ink text-ink">
            <Check size={36} strokeWidth={2.2} />
          </div>
          <h2 className="mt-6 text-[22px] font-semibold text-ink">
            수선 신청이 접수됐어요
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            영업일 기준 1일 이내에 제품 확인 방법을 안내드릴 예정입니다.
          </p>

          <div className="mt-5 w-full rounded-2xl bg-cream-deep px-4 py-3 text-left text-[12px] leading-5 text-ink-soft">
            <p className="font-semibold text-ink">다음 안내 · 접수 후 영업일 1일 이내</p>
            <p className="mt-1">제품 전달 전에는 접수를 취소할 수 있어요. 제품 확인 후 최종 비용과 완료 예정일이 확정됩니다.</p>
          </div>

          <dl className="mt-8 w-full space-y-3 text-left text-[13px]">
            <div className="flex justify-between border-b border-black/5 pb-2">
              <dt className="text-muted">접수번호</dt>
              <dd className="font-medium text-ink">{done.receipt_no}</dd>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <dt className="text-muted">제품</dt>
              <dd className="font-medium text-ink">{productName}</dd>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <dt className="text-muted">수선 부위</dt>
              <dd className="font-medium text-ink">{areaLabel(area)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">신청일</dt>
              <dd className="font-medium text-ink">{formatDate(done.created_at)}</dd>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-3">
              <dt className="text-muted">제품 전달</dt>
              <dd className="font-medium text-ink">{receiveMethod === "visit" ? "매장 방문" : "택배 배송"}</dd>
            </div>
          </dl>
        </div>

        <div className="px-5 pb-6">
          <Link
            href={`/products/${productId}/repairs/${done.id}`}
            className="block rounded-2xl bg-cognac-deep py-3.5 text-center text-[15px] font-medium text-white"
          >
            진행 상황 보기
          </Link>
          <Link
            href={`/products/${productId}`}
            className="mt-3 block py-2 text-center text-[14px] text-muted"
          >
            제품 상세로 이동
          </Link>
          <Link
            href="/my/repairs"
            className="block py-2 text-center text-[13px] text-muted"
          >
            나의 수선 내역 보기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="수선 신청" backHref={`/products/${productId}/care?tab=repairs`} />
      <ProductMiniCard name={productName} color={productColor} image={productImage} />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="soft-card mx-4 mt-4 flex h-44 w-[calc(100%-2rem)] flex-col items-center justify-center overflow-hidden"
      >
        {photo ? (
          <div className="relative h-full w-full">
            <SafeImage src={photo} alt="수선 사진" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <>
            <Camera size={28} strokeWidth={1.4} className="text-ink" />
            <p className="mt-3 px-8 text-center text-[12px] leading-relaxed text-muted">
              가방 전체와 수선 부위가
              <br />
              보이게 촬영해 주세요
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </button>

      <section className="mx-4 mt-6">
        <p className="text-[11px] tracking-[0.16em] text-muted">REPAIR AREA</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AREA_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setArea(tag.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px]",
                area === tag.id
                  ? "border-ink bg-ink text-white"
                  : "border-black/15 bg-white/70 text-ink-soft",
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-5">
        <p className="text-[11px] tracking-[0.16em] text-muted">CONDITION</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONDITION_TYPES.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setCondition(tag.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px]",
                condition === tag.id
                  ? "border-ink bg-ink text-white"
                  : "border-black/15 bg-white/70 text-ink-soft",
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-5">
        <p className="text-[11px] tracking-[0.16em] text-muted">PRODUCT DELIVERY</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setReceiveMethod("visit")} className={cn("rounded-2xl border px-3 py-4 text-left", receiveMethod === "visit" ? "border-ink bg-ink text-white" : "border-black/10 bg-paper text-ink")}>
            <MapPin size={18}/><b className="mt-2 block text-[13px]">매장 방문</b><span className={`mt-1 block text-[10px] leading-4 ${receiveMethod === "visit" ? "text-white/65" : "text-muted"}`}>가까운 매장에서 제품 전달</span>
          </button>
          <button type="button" onClick={() => setReceiveMethod("delivery")} className={cn("rounded-2xl border px-3 py-4 text-left", receiveMethod === "delivery" ? "border-ink bg-ink text-white" : "border-black/10 bg-paper text-ink")}>
            <PackageCheck size={18}/><b className="mt-2 block text-[13px]">택배 배송</b><span className={`mt-1 block text-[10px] leading-4 ${receiveMethod === "delivery" ? "text-white/65" : "text-muted"}`}>접수 후 포장·배송 안내</span>
          </button>
        </div>
      </section>

      <section className="soft-card mx-4 mt-5 px-4 py-4">
        <p className="text-[11px] tracking-[0.12em] text-muted">예상 안내</p>
        <div className="mt-2 grid grid-cols-2 gap-4 text-[13px]">
          <div><span className="block text-[11px] text-muted">예상 비용</span><b className="mt-1 block text-ink">40,000~80,000원</b></div>
          <div><span className="block text-[11px] text-muted">예상 기간</span><b className="mt-1 block text-ink">7~14일</b></div>
        </div>
        <p className="mt-3 border-t border-black/5 pt-3 text-[10px] leading-4 text-muted">프로토타입 예시 범위이며, 실제 비용과 기간은 제품 실물 확인 후 확정됩니다.</p>
      </section>

      <section className="mx-4 mt-5">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder="상태를 자세히 적어주세요. (선택)"
          className="w-full rounded-xl border border-black/10 bg-paper px-3 py-3 text-[13px] outline-none placeholder:text-muted focus:border-cognac"
        />
      </section>

      {error && <p className="mx-4 mt-3 text-[12px] text-[#8a3a3a]">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="mx-4 mt-6 mb-4 w-[calc(100%-2rem)] rounded-2xl bg-cognac-deep py-3.5 text-[15px] font-medium text-white disabled:opacity-50"
      >
        {submitting ? "접수 중…" : "수선 신청하기"}
      </button>

      <BottomNav />
    </main>
  );
}

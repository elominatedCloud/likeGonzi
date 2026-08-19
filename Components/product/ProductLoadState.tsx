"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";

/** 제품 정보를 불러오는 중 / 실패했을 때 공용 화면 */
export function ProductLoading({ title = "제품" }: { title?: string }) {
  return (
    <main className="visetos-bg relative min-h-dvh pb-28" aria-busy="true">
      <PageHeader title={title} backHref="/home" />
      <div className="mx-4 mt-4 space-y-3">
        <div className="h-[240px] animate-pulse rounded-2xl bg-black/5" />
        <div className="h-32 animate-pulse rounded-2xl bg-black/5" />
        <p className="text-center text-[12px] text-muted">제품 정보를 불러오고 있어요.</p>
      </div>
    </main>
  );
}

export function ProductLoadError({
  message,
  onRetry,
  title = "제품",
}: {
  message: string;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title={title} backHref="/home" />
      <div className="mx-4 mt-6 rounded-2xl bg-paper px-5 py-10 text-center" role="alert">
        <p className="text-[13px] text-[#8a3a3a]">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-cognac/25 px-4 py-2.5 text-[12px] font-semibold text-cognac-deep"
        >
          <RefreshCw size={14} /> 다시 시도
        </button>
        <Link href="/home" className="mt-3 block text-[12px] text-muted">
          내 제품으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

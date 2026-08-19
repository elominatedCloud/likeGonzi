"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface RecapData {
  content: string;
  is_ai: boolean;
  story_count: number;
  repair_count: number;
  cached: boolean;
}

/**
 * 제품에 쌓인 기록·수선을 요약한 AI Recap.
 * 서버가 캐시를 들고 있어서 기록이 늘었을 때만 새로 생성된다.
 */
export function RecapCard({ productId }: { productId: string }) {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const path = `/api/products/${encodeURIComponent(productId)}/recap${
      refreshKey > 0 ? "?refresh=1" : ""
    }`;
    apiFetch<RecapData>(path)
      .then((json) => {
        if (cancelled) return;
        if (json.ok) setRecap(json.data);
        else setError(json.error.message);
      })
      .catch(() => {
        if (!cancelled) setError("Recap을 불러오지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, [productId, refreshKey]);

  return (
    <div className="rounded-[16px] bg-ink px-4 py-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <p className="type-kicker text-gold-soft">STORY RECAP</p>
        {recap && (
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-1 text-[11px] text-gold-soft/70"
            aria-label="Recap 다시 만들기"
          >
            <RefreshCw size={11} /> 다시 만들기
          </button>
        )}
      </div>

      {!recap && !error && (
        <div className="mt-3 space-y-2" aria-busy="true">
          <div className="h-3 w-full animate-pulse rounded bg-white/15" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
          <p className="pt-1 text-[11px] text-gold-soft/60">기록을 모아 이야기를 만들고 있어요.</p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-[12px] leading-5 text-white/70" role="alert">
          {error}
        </p>
      )}

      {recap && (
        <>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-6">{recap.content}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-[10px] tracking-wide text-gold-soft/70">
            <Sparkles size={11} />
            {recap.is_ai
              ? `기록 ${recap.story_count}건 · 수선 ${recap.repair_count}건 기반 AI 생성`
              : "AI 연결 전 기본 문구"}
          </p>
        </>
      )}
    </div>
  );
}

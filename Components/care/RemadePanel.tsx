"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { SafeImage } from "@/Components/ui/SafeImage";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/cn";

interface RemadePanelProps {
  productId: string;
  repairId: string;
  /** 이미 채택된 시안이 있으면 그것만 보여준다. */
  initialImage?: string | null;
  initialSource?: string | null;
}

type GenerateResult = { configured: boolean; images: string[] };

/**
 * REMADE — 손상 부위에 얹을 리폼 시안을 AI로 만든다.
 *
 * 수선을 원상복구가 아니라 재창조로 다룬다.
 * AI는 시안까지고, 실물은 매장 장인이 만든다는 선을 문구로 분명히 한다.
 */
export function RemadePanel({
  productId,
  repairId,
  initialImage,
  initialSource,
}: RemadePanelProps) {
  const [picked, setPicked] = useState<string | null>(
    initialSource === "remade" ? (initialImage ?? null) : null,
  );
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  // 복원과 REMADE는 같은 접수에서 갈린다. 고르기 전에는 어느 쪽도 진행하지 않는다.
  const [mode, setMode] = useState<"restore" | "remade" | null>(
    initialSource === "remade" ? "remade" : null,
  );

  const base = `/api/products/${productId}/repairs/${repairId}/remade`;

  async function generate() {
    setLoading(true);
    setNotice("");
    const res = await apiFetch<GenerateResult>(base, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      setNotice("시안을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!res.data.configured) {
      setNotice("이 환경에는 AI 키가 설정되어 있지 않아 시안 생성이 비활성화됩니다.");
      return;
    }
    setOptions(res.data.images);
  }

  async function choose(image: string) {
    setSaving(image);
    const res = await apiFetch(base, {
      method: "PATCH",
      body: JSON.stringify({ image_url: image }),
    });
    setSaving(null);

    if (!res.ok) {
      setNotice("시안을 저장하지 못했습니다.");
      return;
    }
    setPicked(image);
    setOptions([]);
  }

  return (
    <section className="mx-5 mt-6 border-t border-black/5 pt-5">
      <p className="text-[11px] tracking-[0.16em] text-muted">REPAIR OPTION</p>
      <h2 className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">
        어떻게 고칠까요?
      </h2>

      {mode === null && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("restore")}
            className="rounded-2xl border border-black/12 bg-paper px-4 py-4 text-left"
          >
            <b className="block text-[14px] text-ink">복원</b>
            <span className="mt-1 block text-[11px] leading-4 text-muted">
              원래 상태로.
              <br />
              세척 · 보강 · 부품 교체
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("remade")}
            className="rounded-2xl border border-cognac/40 bg-cognac/[0.07] px-4 py-4 text-left"
          >
            <b className="block text-[14px] text-cognac-deep">REMADE</b>
            <span className="mt-1 block text-[11px] leading-4 text-muted">
              흠 위에 무늬를.
              <br />
              AI 시안 · MCM 제작
            </span>
          </button>
        </div>
      )}

      {mode === "restore" && (
        <div className="mt-3 rounded-2xl bg-cream-deep px-4 py-4">
          <p className="text-[13px] font-semibold text-ink">복원으로 진행합니다</p>
          <p className="mt-1 text-[11px] leading-4 text-muted">
            원래 상태에 가깝게 되돌립니다. 매장에서 상태를 확인한 뒤 방법을 안내합니다.
          </p>
          <button
            type="button"
            onClick={() => setMode(null)}
            className="mt-3 text-[11px] font-semibold text-cognac-deep underline underline-offset-2"
          >
            REMADE도 볼게요
          </button>
        </div>
      )}

      {mode === "remade" && picked && (
        <figure className="mt-4">
          <div className="soft-card relative aspect-square w-full overflow-hidden">
            <SafeImage src={picked} alt="채택된 리폼 시안" fill className="object-cover" unoptimized />
          </div>
          <figcaption className="mt-2 flex items-center gap-1.5 text-[12px] text-cognac-deep">
            <Check size={15} /> 채택된 시안 · 매장 확인 후 제작됩니다
          </figcaption>
        </figure>
      )}

      {mode === "remade" && !picked && options.length === 0 && (
        <>
        <p className="mt-3 text-[12px] leading-relaxed text-muted">
          손상 부위에 어울리는 시안을 만듭니다. 시안까지가 AI이고, 실물은 MCM 매장이 제작합니다.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5",
            "text-[13px] font-semibold",
            loading ? "bg-black/5 text-muted" : "bg-ink text-white",
          )}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 시안을 만드는 중…
            </>
          ) : (
            <>
              <Sparkles size={16} /> 리폼 시안 만들기
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMode(null)}
          className="mt-2 w-full text-[11px] text-muted underline underline-offset-2"
        >
          복원으로 바꾸기
        </button>
        </>
      )}

      {mode === "remade" && !picked && options.length > 0 && (
        <>
          <p className="mt-4 text-[12px] text-muted">마음에 드는 시안을 고르세요.</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {options.map((image, index) => (
              <button
                key={image.slice(-24) + index}
                type="button"
                onClick={() => choose(image)}
                disabled={Boolean(saving)}
                aria-label={`리폼 시안 ${index + 1} 선택`}
                className="soft-card relative aspect-square overflow-hidden disabled:opacity-50"
              >
                <SafeImage src={image} alt="" fill className="object-cover" unoptimized />
                {saving === image && (
                  <span className="absolute inset-0 grid place-items-center bg-black/35">
                    <Loader2 size={18} className="animate-spin text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={generate}
            className="mt-3 w-full rounded-2xl border border-cognac/25 bg-paper py-3 text-[13px] font-semibold text-cognac-deep"
          >
            다시 만들기
          </button>
        </>
      )}

      {notice && (
        <p className="mt-3 rounded-xl bg-cream-deep px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
          {notice}
        </p>
      )}
    </section>
  );
}

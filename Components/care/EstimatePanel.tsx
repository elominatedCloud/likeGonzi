"use client";

import { useState } from "react";
import { Check, LoaderCircle, ReceiptText } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export interface EstimateState {
  status: string;
  estimate_min: number | null;
  estimate_max: number | null;
  estimate_days: number | null;
  estimate_note: string | null;
  paid_at: string | null;
  is_demo_payment: boolean;
}

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

/**
 * 견적 확인 → 진행 확정.
 *
 * ⚠️ 결제는 데모다. 카드 정보를 받지 않고 실제로 돈이 오가지 않는다.
 * 화면에 그대로 표기한다 — 시연에서 실결제처럼 보이면 안 된다.
 */
export function EstimatePanel({
  productId,
  repairId,
  initial,
  onChange,
}: {
  productId: string;
  repairId: string;
  initial: EstimateState;
  onChange?: (next: EstimateState) => void;
}) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState<"estimate" | "pay" | null>(null);
  const [error, setError] = useState("");

  async function call(kind: "estimate" | "pay") {
    if (busy) return;
    setBusy(kind);
    setError("");
    try {
      const json = await apiFetch<EstimateState>(
        `/api/products/${encodeURIComponent(productId)}/repairs/${repairId}/${kind}`,
        { method: "POST" },
      );
      if (!json.ok) {
        setError(json.error.message);
        return;
      }
      setState(json.data);
      onChange?.(json.data);
    } catch {
      setError("요청을 처리하지 못했어요.");
    } finally {
      setBusy(null);
    }
  }

  const hasEstimate = state.estimate_min != null && state.estimate_max != null;
  const paid = Boolean(state.paid_at);

  return (
    <section className="soft-card mx-4 mt-4 px-4 py-4">
      <div className="flex items-center gap-2">
        <ReceiptText size={16} className="text-cognac" />
        <h3 className="text-[14px] font-semibold text-ink">수선 견적</h3>
      </div>

      {!hasEstimate && (
        <>
          <p className="mt-2 text-[12px] leading-5 text-muted">
            등록하신 부위와 증상을 기준으로 예상 비용과 기간을 확인할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => call("estimate")}
            disabled={busy !== null}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink py-3 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {busy === "estimate" && <LoaderCircle size={14} className="animate-spin" />}
            {busy === "estimate" ? "계산 중…" : "견적 확인하기"}
          </button>
        </>
      )}

      {hasEstimate && (
        <>
          <p className="mt-3 font-serif text-[24px] leading-none text-ink">
            {won(state.estimate_min!)}
            <span className="text-[15px] text-muted"> ~ </span>
            {won(state.estimate_max!)}
          </p>
          <p className="mt-1.5 text-[12px] text-muted">
            예상 소요 약 {state.estimate_days}일
          </p>
          {state.estimate_note && (
            <p className="mt-3 rounded-xl bg-cream px-3 py-2.5 text-[12px] leading-5 text-ink-soft">
              {state.estimate_note}
            </p>
          )}

          {paid ? (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#eef6ea] px-3 py-2.5 text-[12px] font-medium text-[#3d6b3a]">
              <Check size={14} /> 진행이 확정됐어요. 매장에서 제품 확인 후 시작합니다.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => call("pay")}
              disabled={busy !== null}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-cognac-deep py-3 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {busy === "pay" && <LoaderCircle size={14} className="animate-spin" />}
              {busy === "pay" ? "처리 중…" : "견적 수락하고 진행하기"}
            </button>
          )}

          {state.is_demo_payment && (
            <p className="mt-2 text-[11px] leading-4 text-muted">
              데모 화면입니다. 실제 결제가 이뤄지지 않으며 카드 정보도 받지 않습니다.
              최종 금액은 매장에서 실물 확인 후 확정됩니다.
            </p>
          )}
        </>
      )}

      {error && (
        <p className="mt-2 text-[12px] text-[#8a3a3a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

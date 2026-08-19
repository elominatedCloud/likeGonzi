"use client";

import { useEffect, useState } from "react";
import { BarChart3, LoaderCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface MeResponse {
  analytics_consent: boolean;
}

/**
 * 브랜드 집계 통계 참여 동의.
 *
 * 끄면 brand_* 집계 뷰에서 즉시 빠진다(다음 조회부터).
 * 동의 여부와 무관하게 앱의 개인 기능은 전부 그대로 동작한다.
 */
export function AnalyticsConsentCard() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch<MeResponse>("/api/me")
      .then((json) => {
        if (cancelled) return;
        if (json.ok) setConsent(json.data.analytics_consent);
        else setError(json.error.message);
      })
      .catch(() => {
        if (!cancelled) setError("설정을 불러오지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    if (consent === null || saving) return;
    const next = !consent;
    setSaving(true);
    setError("");
    try {
      const json = await apiFetch<MeResponse>("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ analytics_consent: next }),
      });
      if (json.ok) setConsent(json.data.analytics_consent);
      else setError(json.error.message);
    } catch {
      setError("설정을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5 rounded-[20px] border border-black/5 bg-paper px-4 py-4 shadow-[0_8px_28px_rgba(43,33,28,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-deep text-cognac-deep">
          <BarChart3 size={19} strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink">브랜드 통계 참여</p>
          <p className="mt-1 text-[11px] leading-4 text-muted">
            내 기록을 개인 정보 없이 집계 수치로만 사용합니다. 언제든 끌 수 있고,
            끄면 통계에서 바로 빠집니다. 참여하지 않아도 모든 기능은 그대로 쓸 수 있어요.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={consent === true}
          aria-label="브랜드 통계 참여"
          onClick={toggle}
          disabled={consent === null || saving}
          className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            consent ? "bg-cognac-deep" : "bg-black/15"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              consent ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {saving && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted" role="status">
          <LoaderCircle size={12} className="animate-spin" aria-hidden /> 저장 중…
        </p>
      )}
      {error && (
        <p className="mt-2 text-[11px] text-[#8a3a3a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

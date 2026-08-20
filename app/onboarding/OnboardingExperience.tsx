"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cake, LoaderCircle, QrCode } from "lucide-react";
import { apiFetch, hasSupabaseSession } from "@/lib/api-client";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";

type Step = "birthday" | "tag";

interface MeResponse {
  birthday: string | null;
  onboarding_completed: boolean;
}

/**
 * 가입 직후 한 번만 지나가는 화면.
 *
 * 두 단계 모두 건너뛸 수 있다. 생일은 혜택 알림에만 쓰고, 제품 등록은
 * 나중에 마이·카메라에서도 할 수 있어서 여기서 막을 이유가 없다.
 *
 * 생일을 소셜 로그인에서 못 받아오기 때문에 이 화면이 필요하다.
 * Google의 기본 스코프(email profile)에는 생일이 없고, 받으려면 민감 스코프
 * 승인과 People API 호출이 따로 필요하다.
 */
export function OnboardingExperience() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("birthday");
  const [birthday, setBirthday] = useState("");
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);

  // 프로필에 쓰는 화면이라 로그인이 전제다. 세션이 없으면 폼을 보여주지 않고
  // 로그인으로 보내고, 끝나면 여기로 돌아오게 한다.
  useEffect(() => {
    let cancelled = false;
    hasSupabaseSession().then((loggedIn) => {
      if (cancelled) return;
      if (loggedIn) setChecked(true);
      else router.replace(`/login?returnTo=${encodeURIComponent("/onboarding")}`);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  /**
   * 온보딩을 끝냈다고 표시하고 다음 화면으로 넘긴다.
   *
   * 저장에 실패해도 사용자를 여기 가둬두지 않는다. 생일은 마이 화면에서
   * 언제든 다시 넣을 수 있고, 못 넘어가는 쪽이 더 나쁘다.
   */
  async function finish(destination: string) {
    if (saving) return;
    setSaving(true);
    try {
      await apiFetch<MeResponse>("/api/me", {
        method: "PATCH",
        body: JSON.stringify({
          onboarding_completed: true,
          ...(birthday ? { birthday } : {}),
        }),
      });
    } catch {
      // 저장 실패는 삼키고 넘어간다(위 주석).
    }
    router.replace(destination);
  }

  // 세션 확인 전에는 화면을 그리지 않는다. 비로그인 사용자에게 폼이 깜빡이면
  // 채울 수 있는 것처럼 보인다.
  if (!checked) {
    return <main className="visetos-bg min-h-dvh" aria-busy="true" />;
  }

  return (
    <main className="visetos-bg relative min-h-dvh px-6 pb-12 pt-14">
      <AmbientPattern />

      <p className="type-eyebrow text-gold">MCM · STORYBOOK</p>

      {step === "birthday" ? (
        <>
          <h1 className="mt-2 text-[24px] font-bold leading-8 tracking-[-0.02em] text-ink">
            생일을 알려주시겠어요?
            <span className="ml-2 align-middle text-[15px] font-medium text-muted">
              (선택)
            </span>
          </h1>
          <p className="type-body mt-3 text-ink-soft">
            생일 주간에 케어 혜택을 미리 챙겨드려요. 지금 넣지 않아도 마이
            화면에서 언제든 추가할 수 있어요.
          </p>

          <label className="mt-8 block">
            <span className="type-meta flex items-center gap-1.5 font-semibold text-cognac-deep">
              <Cake size={14} aria-hidden />
              생일 <span className="font-normal text-muted">(선택)</span>
            </span>
            <input
              type="date"
              value={birthday}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setBirthday(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-paper px-4 text-[15px] text-ink outline-none focus:border-gold"
            />
          </label>

          <button
            type="button"
            onClick={() => setStep("tag")}
            className="mt-8 w-full rounded-xl bg-cognac-deep py-3.5 text-[15px] font-bold text-white"
          >
            다음
          </button>
          <button
            type="button"
            onClick={() => {
              setBirthday("");
              setStep("tag");
            }}
            className="mt-3 w-full py-2 text-[13px] font-semibold text-muted underline"
          >
            건너뛰기
          </button>
        </>
      ) : (
        <>
          <h1 className="mt-2 text-[24px] font-bold leading-8 tracking-[-0.02em] text-ink">
            제품 QR 태그를 스캔해 주세요
            <span className="ml-2 align-middle text-[15px] font-medium text-muted">
              (선택)
            </span>
          </h1>
          <p className="type-body mt-3 text-ink-soft">
            제품에 달린 태그를 인식하면 내 아카이브에 등록되고, 그때부터 기록과
            케어 이력이 그 제품에 쌓여요.
          </p>

          <div className="soft-card mt-7 flex flex-col items-center px-5 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-deep text-cognac-deep">
              <QrCode size={30} aria-hidden />
            </span>
            <p className="type-meta mt-4 text-muted">
              카메라가 열리면 태그를 화면 안에 두세요.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void finish("/camera?mode=qr")}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-cognac-deep py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
          >
            {saving && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
            QR 태그 스캔하기
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void finish("/home")}
            className="mt-3 w-full py-2 text-[13px] font-semibold text-muted underline disabled:opacity-60"
          >
            나중에 하기
          </button>
        </>
      )}
    </main>
  );
}

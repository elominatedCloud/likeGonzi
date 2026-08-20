"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  ChevronRight,
  ClipboardList,
  LoaderCircle,
  LogOut,
  Wrench,
} from "lucide-react";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { BottomNav } from "@/Components/ui/BottomNav";
import { PageHeader } from "@/Components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api-client";
import { AnalyticsConsentCard } from "@/Components/my/AnalyticsConsentCard";
import { ProfileCard } from "@/Components/my/ProfileCard";

const DEMO_AUTH_KEYS = [
  "likegonzi-demo-login",
  "likegonzi-demo-signup",
] as const;

/**
 * 제품에 딸린 메뉴는 사용자가 실제로 가진 제품을 가리켜야 한다.
 * 예전에는 stark-backpack으로 하드코딩돼 있어서, Stark를 소유하지 않은 계정은
 * "내 제품"과 "케어 & 리페어"가 404였다.
 */
function buildMenuItems(productId: string | null) {
  return [
    {
      href: "/log/timeline",
      label: "나의 스토리북",
      description: "제품과 함께한 기록 모아보기",
      icon: BookOpenText,
    },
    {
      href: productId ? `/products/${productId}/care` : "/camera?mode=qr",
      label: "케어 & 리페어",
      description: productId
        ? "관리 가이드와 수선 여정"
        : "아직 등록된 제품이 없어요 · 등록하기",
      icon: Wrench,
    },
    {
      href: "/my/repairs",
      label: "수선 접수 내역",
      description: "접수 상태와 진행 단계 확인",
      icon: ClipboardList,
    },
  ];
}

export function MyScreen() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [firstProductId, setFirstProductId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ id: string }[]>("/api/products/my")
      .then((json) => {
        if (cancelled || !json.ok) return;
        setFirstProductId(json.data[0]?.id ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true };
  }, []);

  const menuItems = buildMenuItems(firstProductId);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setError("");

    try {
      if (supabase) {
        const { error: signOutError } = await supabase.auth.signOut({
          scope: "local",
        });
        if (signOutError) throw signOutError;
      }

      DEMO_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
      router.replace("/login");
      router.refresh();
    } catch {
      setError("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsSigningOut(false);
    }
  };

  return (
    <main className="visetos-bg min-h-dvh w-full overflow-hidden pb-28">
      <AmbientPattern />
      <PageHeader title="마이" backHref="/home" serif={false} />

      <div className="px-5 pb-8 pt-4">
        <ProfileCard />

        <section className="mt-5 overflow-hidden rounded-[20px] border border-black/5 bg-paper shadow-[0_8px_28px_rgba(43,33,28,0.06)]">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-4 ${index ? "border-t border-black/5" : ""}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-deep text-cognac-deep">
                  <Icon size={19} strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted">
                    {item.description}
                  </span>
                </span>
                <ChevronRight size={18} className="text-muted" strokeWidth={1.5} />
              </Link>
            );
          })}
        </section>

        <AnalyticsConsentCard />

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-[16px] border border-cognac/25 bg-paper text-[14px] font-semibold text-cognac-deep shadow-[0_6px_20px_rgba(43,33,28,0.05)] disabled:cursor-wait disabled:opacity-60"
        >
          {isSigningOut ? (
            <LoaderCircle size={18} className="animate-spin" aria-hidden />
          ) : (
            <LogOut size={18} strokeWidth={1.7} aria-hidden />
          )}
          {isSigningOut ? "로그아웃 중..." : "로그아웃"}
        </button>
        {error ? (
          <p className="mt-3 text-center text-[12px] text-[#9d3c36]" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <BottomNav />
    </main>
  );
}

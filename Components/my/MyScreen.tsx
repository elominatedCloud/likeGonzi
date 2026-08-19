"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpenText,
  ChevronRight,
  ClipboardList,
  LoaderCircle,
  LogOut,
  Package,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { BottomNav } from "@/Components/ui/BottomNav";
import { PageHeader } from "@/Components/ui/PageHeader";
import { supabase } from "@/lib/supabase";

const DEMO_AUTH_KEYS = [
  "likegonzi-demo-login",
  "likegonzi-demo-signup",
] as const;

const menuItems = [
  {
    href: "/products/stark-backpack",
    label: "내 제품",
    description: "등록된 제품과 디지털 여권",
    icon: Package,
  },
  {
    href: "/log/storybook",
    label: "나의 스토리북",
    description: "제품과 함께한 기록 모아보기",
    icon: BookOpenText,
  },
  {
    href: "/products/stark-backpack/care",
    label: "케어 & 리페어",
    description: "관리 가이드와 수선 여정",
    icon: Wrench,
  },
  {
    href: "/my/repairs",
    label: "수선 접수 내역",
    description: "접수 상태와 진행 단계 확인",
    icon: ClipboardList,
  },
] as const;

export function MyScreen() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

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
        <section className="soft-card overflow-hidden border border-white/70">
          <div className="bg-[linear-gradient(135deg,#2d1f11_0%,#6e432c_100%)] px-5 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12">
                <UserRound size={26} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#d9c2a2]">
                  MCM STORYBOOK
                </p>
                <h2 className="mt-1 text-[20px] font-semibold">Storybook Member</h2>
                <p className="mt-1 text-[12px] text-white/65">
                  제품의 순간과 관리 이력을 이어가세요.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 text-[12px] text-ink-soft">
            <ShieldCheck size={16} className="text-cognac" strokeWidth={1.7} />
            현재 기기의 계정 세션을 안전하게 관리합니다.
          </div>
        </section>

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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

type GateState = "checking" | "allowed";

/**
 * 운영 도구 진입 가드.
 *
 * 실제 차단은 API의 requireAdmin과 DB의 RLS가 한다. 여기서 한 번 더 막는 건
 * 권한 없는 사람이 빈 관리 화면을 보고 헤매지 않게 하려는 것.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let cancelled = false;
    apiFetch<unknown>("/api/admin/me")
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setState("allowed");
          return;
        }
        // 401은 apiFetch가 이미 로그인 화면으로 보낸다. 403이면 앱으로 돌려보낸다.
        if (json.error.code === "FORBIDDEN") router.replace("/home");
      })
      .catch(() => {
        if (!cancelled) router.replace("/home");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "checking") {
    return (
      <p className="py-16 text-center text-[13px] text-muted" role="status">
        권한을 확인하고 있어요.
      </p>
    );
  }

  return <>{children}</>;
}

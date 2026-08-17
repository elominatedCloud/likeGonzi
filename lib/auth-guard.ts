import type { SupabaseClient, User } from "@supabase/supabase-js";
import { fail } from "@/lib/api-response";
import { getUserById, userFromAuthHeader } from "@/lib/mock-db";
import { createSupabaseServerClient, getBearerToken } from "@/lib/supabase-server";

/** @deprecated mock-db 기반 — Supabase로 옮긴 라우트에서는 requireSupabaseUser 사용 */
export function requireUser(request: Request) {
  const user = userFromAuthHeader(request.headers.get("authorization"));
  if (!user) {
    return {
      user: null as null,
      error: fail("UNAUTHORIZED", "Bearer token required", 401),
    };
  }
  return { user, error: null };
}

/** @deprecated mock-db 기반. 데모용: 토큰 없으면 기본 유저(곤지) — 명세 curl 검수 편의 */
export function requireUserOrDemo(request: Request) {
  const user = userFromAuthHeader(request.headers.get("authorization"));
  if (user) return { user, demo: false };
  return { user: getUserById("user-gonji")!, demo: true };
}

// ------------------------------------------------------------
// Supabase 세션 기반 (실제 DB 연동 라우트용)
// ------------------------------------------------------------

type RequireSupabaseUserResult =
  | { user: User; supabase: SupabaseClient; error: null }
  | { user: null; supabase: null; error: ReturnType<typeof fail> };

/** 로그인 필수 라우트: Bearer 토큰 검증 + Supabase 유저 확인 */
export async function requireSupabaseUser(
  request: Request,
): Promise<RequireSupabaseUserResult> {
  const token = getBearerToken(request);
  if (!token) {
    return {
      user: null,
      supabase: null,
      error: fail("UNAUTHORIZED", "Bearer token required", 401),
    };
  }

  const supabase = createSupabaseServerClient(request);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return {
      user: null,
      supabase: null,
      error: fail("UNAUTHORIZED", "Invalid or expired token", 401),
    };
  }
  return { user: data.user, supabase, error: null };
}

/** 로그인 없이도 접근 가능한 라우트용(예: scan). 토큰 있으면 검증, 없으면 anon으로 진행 */
export async function optionalSupabaseUser(request: Request) {
  const token = getBearerToken(request);
  const supabase = createSupabaseServerClient(request);
  if (!token) return { user: null as User | null, supabase };
  const { data } = await supabase.auth.getUser();
  return { user: data.user ?? null, supabase };
}

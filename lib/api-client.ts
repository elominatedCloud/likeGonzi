/**
 * 공통 API 클라이언트.
 *
 * 브라우저에서 /api/* 를 호출할 때 Supabase 세션의 access_token을
 * Authorization: Bearer 로 항상 실어 보낸다. (없으면 그냥 비로그인 요청)
 */

import type { ApiError, ApiSuccess } from "@/types/story-api";
import { supabase } from "@/lib/supabase";

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const { data } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const accessToken = data.session?.access_token;

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) redirectToLogin();
  return (await res.json()) as ApiResult<T>;
}

/**
 * 로그인이 필요한 API가 401을 주면 로그인 화면으로 보낸다.
 * 다녀온 뒤 원래 화면으로 돌아오도록 returnTo를 붙인다.
 * (기록 API처럼 비로그인도 허용하는 라우트는 401을 주지 않으므로 여기 안 걸린다.)
 */
function redirectToLogin() {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname.startsWith("/login")) return;
  const returnTo = encodeURIComponent(`${pathname}${search}`);
  window.location.replace(`/login?returnTo=${returnTo}`);
}

export async function hasSupabaseSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

/**
 * 화면에서 발생하는 이벤트를 남긴다.
 * 실패해도 무시한다 — 로깅 때문에 사용자 흐름이 끊기면 안 된다.
 */
export function trackEvent(
  type: "unbox_complete" | "share" | "recap_view",
  productUnitId?: string | null,
  meta: Record<string, unknown> = {},
) {
  void apiFetch("/api/events", {
    method: "POST",
    body: JSON.stringify({ type, product_unit_id: productUnitId ?? null, meta }),
  }).catch(() => {});
}

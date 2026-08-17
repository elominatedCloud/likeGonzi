import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * 요청(Request) 스코프의 Supabase 클라이언트.
 *
 * - Authorization: Bearer <supabase_access_token> 이 있으면 해당 유저 권한으로 동작
 *   (RLS의 auth.uid()가 이 유저로 채워짐 — service role key는 쓰지 않음)
 * - 토큰이 없으면 anon 권한으로 동작 (auth.uid() = null → 비로그인 취급, RLS가 자동 차단)
 *
 * ⚠️ 매 요청마다 새로 만들어야 함(모듈 스코프에서 싱글턴으로 만들면 유저 간 토큰이 섞임).
 */
export function createSupabaseServerClient(request: Request): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 없습니다 (.env.local 확인)",
    );
  }

  const token = getBearerToken(request);

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

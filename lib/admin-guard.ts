import { fail } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";

/**
 * 운영자 전용 라우트 가드.
 *
 * 실제 권한 판정은 DB의 is_admin()과 RLS가 한다. 여기서 한 번 더 막는 이유는
 * 권한 없는 요청에 404/403을 바로 돌려주기 위해서지, 이게 유일한 방어선은 아니다.
 */
export async function requireAdmin(request: Request) {
  const auth = await requireSupabaseUser(request);
  if (auth.error) return auth;

  const { data, error } = await auth.supabase.rpc("is_admin");
  if (error || data !== true) {
    return {
      user: null,
      supabase: null,
      error: fail("FORBIDDEN", "운영자 권한이 필요합니다", 403),
    } as const;
  }
  return auth;
}

import { fail } from "@/lib/api-response";
import { getUserById, userFromAuthHeader } from "@/lib/mock-db";

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

/** 데모용: 토큰 없으면 기본 유저(곤지) — 명세 curl 검수 편의 */
export function requireUserOrDemo(request: Request) {
  const user = userFromAuthHeader(request.headers.get("authorization"));
  if (user) return { user, demo: false };
  return { user: getUserById("user-gonji")!, demo: true };
}

import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-guard";

/** GET /api/admin/me — 운영자 여부 확인용 (화면 진입 가드가 사용) */
export async function GET(request: Request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  return ok({ id: user.id, is_admin: true });
}

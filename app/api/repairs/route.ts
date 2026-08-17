import { ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { listMyRepairs } from "@/lib/mock-db";

/** GET /api/repairs — 내 제품 수선 접수 내역 */
export async function GET(request: Request) {
  const { user } = requireUserOrDemo(request);
  return ok(listMyRepairs(user.id));
}

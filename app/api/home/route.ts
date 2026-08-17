import { ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { buildHome } from "@/lib/mock-db";

/** GET /api/home — 제품 그리드 + 케어 + 혜택 + 라이프스타일 통합 */
export async function GET(request: Request) {
  const { user } = requireUserOrDemo(request);
  return ok(buildHome(user.id));
}

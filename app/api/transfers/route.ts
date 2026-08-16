import { fail, ok, readJson } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { createTransfer, listTransfers } from "@/lib/mock-db";

/** GET /api/transfers — 보낸/받은 소유권 이전 목록 */
export async function GET(request: Request) {
  const { user } = requireUserOrDemo(request);
  return ok(listTransfers(user.id));
}

/** POST /api/transfers — 소유권 이전 신청 */
export async function POST(request: Request) {
  const { user } = requireUserOrDemo(request);
  const body = await readJson<{ product_id?: string; to_email?: string }>(
    request,
  );
  if (!body?.product_id || !body?.to_email) {
    return fail("VALIDATION_ERROR", "product_id and to_email are required");
  }

  const transfer = createTransfer({
    userId: user.id,
    product_id: body.product_id,
    to_email: body.to_email,
  });
  if (!transfer) {
    return fail(
      "TRANSFER_FAILED",
      "제품을 찾을 수 없거나 소유 제품이 아닙니다",
      400,
    );
  }
  return ok(transfer, 201);
}

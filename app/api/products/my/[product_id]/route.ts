import { fail, ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { registerProduct, unregisterProduct } from "@/lib/mock-db";

type Ctx = { params: Promise<{ product_id: string }> };

/** POST /api/products/my/{product_id} — 제품 등록 */
export async function POST(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { user } = requireUserOrDemo(request);
  const result = registerProduct(user.id, product_id);
  if ("error" in result) {
    const code = result.error ?? "REGISTER_FAILED";
    const status = code === "PRODUCT_NOT_FOUND" ? 404 : 409;
    return fail(code, code, status);
  }
  return ok(result, 201);
}

/** DELETE /api/products/my/{product_id} — 등록 해제 */
export async function DELETE(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { user } = requireUserOrDemo(request);
  const removed = unregisterProduct(user.id, product_id);
  if (!removed) {
    return fail("NOT_REGISTERED", "등록되지 않은 제품입니다", 404);
  }
  return ok({ product_id, deleted: true });
}

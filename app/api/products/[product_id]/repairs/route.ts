import { fail, ok, readJson } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { createRepair, getProduct, listRepairs } from "@/lib/mock-db";

type Ctx = { params: Promise<{ product_id: string }> };

/** GET /api/products/{product_id}/repairs — 수선 이력 조회 */
export async function GET(_request: Request, context: Ctx) {
  const { product_id } = await context.params;
  if (!getProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }
  return ok(listRepairs(product_id));
}

/** POST /api/products/{product_id}/repairs — 수선 신청 */
export async function POST(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  if (!getProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }
  requireUserOrDemo(request);

  const body = await readJson<{
    title?: string;
    condition_tags?: string[];
    location?: string;
  }>(request);

  const repair = createRepair(product_id, body ?? {});
  return ok(repair, 201);
}

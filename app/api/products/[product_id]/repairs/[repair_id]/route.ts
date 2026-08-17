import { fail, ok } from "@/lib/api-response";
import { getProduct, getRepair } from "@/lib/mock-db";

type Ctx = { params: Promise<{ product_id: string; repair_id: string }> };

/** GET /api/products/{product_id}/repairs/{repair_id} */
export async function GET(_request: Request, context: Ctx) {
  const { product_id, repair_id } = await context.params;
  if (!getProduct(product_id)) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }
  const repair = getRepair(product_id, repair_id);
  if (!repair) {
    return fail("REPAIR_NOT_FOUND", `repair_id '${repair_id}' not found`, 404);
  }
  return ok(repair);
}

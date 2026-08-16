import { ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { listMyProducts } from "@/lib/mock-db";

/** GET /api/products/my */
export async function GET(request: Request) {
  const { user } = requireUserOrDemo(request);
  return ok(listMyProducts(user.id));
}

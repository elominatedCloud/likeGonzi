import { fail, ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import {
  getProductByTag,
  isOwnedBy,
} from "@/lib/mock-db";

type Ctx = { params: Promise<{ tag_code: string }> };

/** GET /api/products/scan/{tag_code} — QR/NFC 통합 */
export async function GET(request: Request, context: Ctx) {
  const { tag_code } = await context.params;
  const product = getProductByTag(tag_code);
  if (!product) {
    return fail("TAG_NOT_FOUND", `tag_code '${tag_code}' not found`, 404);
  }

  const { user } = requireUserOrDemo(request);
  const is_registered_to_user = isOwnedBy(user.id, product.id);

  return ok({
    tag_code,
    product_id: product.id,
    product_name: product.name,
    model_no: product.model_no,
    serial: product.serial,
    color: product.color,
    material: product.material,
    cutout_image: product.cutout_image,
    is_registered_to_user,
    is_campaign: tag_code.startsWith("CAMP-"),
    route: is_registered_to_user ? "product_detail" : "register_confirm",
  });
}

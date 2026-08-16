import { fail, ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { getOwnershipStatus, getProductByTag } from "@/lib/mock-db";

type Ctx = { params: Promise<{ tag_code: string }> };

/** GET /api/products/scan/{tag_code} — QR/NFC 통합 */
export async function GET(request: Request, context: Ctx) {
  const { tag_code } = await context.params;
  const product = getProductByTag(tag_code);
  if (!product) {
    return fail("TAG_NOT_FOUND", `tag_code '${tag_code}' not found`, 404);
  }

  const { user } = requireUserOrDemo(request);
  const ownership_status = getOwnershipStatus(user.id, product.id);

  const route =
    ownership_status === "owned_by_me"
      ? "product_detail"
      : ownership_status === "unregistered"
        ? "register_confirm"
        : "owned_by_other";

  return ok({
    tag_code,
    product_id: product.id,
    product_name: product.name,
    model_no: product.model_no,
    serial: product.serial,
    serial_no: product.serial,
    color: product.color,
    material: product.material,
    cutout_image: product.cutout_image,
    ownership_status,
    is_registered_to_user: ownership_status === "owned_by_me",
    is_campaign: tag_code.startsWith("CAMP-"),
    route,
  });
}

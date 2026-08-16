import { fail, ok } from "@/lib/api-response";
import { requireUserOrDemo } from "@/lib/auth-guard";
import { getProduct, isOwnedBy, listRepairs } from "@/lib/mock-db";
import { listStories } from "@/lib/story-store";

type Ctx = { params: Promise<{ product_id: string }> };

/**
 * GET /api/products/{product_id}
 * 제품 정보 + recent_activity
 */
export async function GET(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const product = getProduct(product_id);
  if (!product) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const { user } = requireUserOrDemo(request);
  const stories = listStories(product.id).slice(0, 3);
  const repairs = listRepairs(product.id).slice(0, 2);

  return ok({
    ...product,
    is_registered_to_user: isOwnedBy(user.id, product.id),
    authenticity: "verified",
    recent_activity: {
      stories,
      repairs,
    },
    care: {
      score: product.care_score,
      repair_vouchers: product.repair_vouchers,
      cleaning_vouchers: product.cleaning_vouchers,
      guide: {
        material: product.material,
        tips: [
          "부드러운 천으로 먼지 제거",
          "오염 시 중성 세제 사용",
          "직사광선 피하기",
          "습기 주의",
        ],
        clinic_cycle: "3~6개월에 한 번",
      },
    },
  });
}

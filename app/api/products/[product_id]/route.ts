import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toProductDTO, toRepairDTO, type MyProductRow, type RepairRow } from "@/lib/mappers";

type Ctx = { params: Promise<{ product_id: string }> };

/**
 * GET /api/products/{product_id} — 제품 상세 + recent_activity
 * product_id = product_units.id (uuid). RLS(product_units_select_owned)상
 * 본인이 등록한 제품만 조회 가능 — 미등록/타인 제품은 scan_product RPC로 확인.
 *
 * TODO(story 연동): stories는 story_products 다대다 조인이 필요해서
 * 이번 배치에서는 비워뒀습니다. 다음 작업으로 story_products 붙이면 됩니다.
 */
export async function GET(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data: productRow, error: qError } = await supabase
    .from("my_products_view")
    .select("*")
    .eq("id", product_id)
    .maybeSingle();

  if (qError) {
    console.error("[products/:id] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  if (!productRow) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const product = toProductDTO(productRow as MyProductRow);

  const { data: repairRows, error: repairError } = await supabase
    .from("repairs")
    .select("*")
    .eq("product_unit_id", product_id)
    .order("created_at", { ascending: false })
    .limit(2);

  if (repairError) {
    console.error("[products/:id] repairs query error", repairError);
  }

  return ok({
    ...product,
    is_registered_to_user: true,
    authenticity: "verified",
    recent_activity: {
      stories: [], // TODO: story_products 연동 후 채우기
      repairs: ((repairRows as RepairRow[] | null) ?? []).map(toRepairDTO),
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

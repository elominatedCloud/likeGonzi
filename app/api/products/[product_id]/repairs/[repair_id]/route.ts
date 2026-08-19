import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { type RepairRow } from "@/lib/mappers";
import { toSupabaseRepairDTOs } from "@/lib/supabase-repair-mapper";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";

type Ctx = { params: Promise<{ product_id: string; repair_id: string }> };

/** GET /api/products/{product_id}/repairs/{repair_id} — 수선 접수 상세 */
export async function GET(request: Request, context: Ctx) {
  const { product_id, repair_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  // repairs RLS가 본인 접수만 내려주므로 타인 것은 자연히 404가 된다.
  const { data, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .eq("id", repair_id)
    .eq("product_unit_id", productRef.unitId)
    .maybeSingle();

  if (qError) {
    // 22P02: repair_id가 UUID 형식이 아님 → 조회 실패가 아니라 없는 접수로 취급
    if (qError.code === "22P02") {
      return fail("REPAIR_NOT_FOUND", `repair_id '${repair_id}' not found`, 404);
    }
    console.error("[repairs detail] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  if (!data) {
    return fail("REPAIR_NOT_FOUND", `repair_id '${repair_id}' not found`, 404);
  }
  const [dto] = await toSupabaseRepairDTOs(supabase, [data as RepairRow], {
    [productRef.unitId]: productRef.slug,
  });
  return ok(dto);
}

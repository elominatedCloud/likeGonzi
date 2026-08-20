import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { type RepairRow } from "@/lib/mappers";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";
import { toSupabaseRepairDTOs } from "@/lib/supabase-repair-mapper";

type Ctx = { params: Promise<{ product_id: string; repair_id: string }> };

/**
 * POST — 견적 수락(데모 결제).
 *
 * ⚠️ 실제 결제가 아니다. 카드 정보를 받지 않고 돈이 오가지 않는다.
 * 상태만 quoted → paid 로 넘긴다. is_demo_payment는 항상 true다.
 *
 * 실결제를 붙이려면 PG 계약, 결제창, 웹훅 검증, 환불 처리가 별도로 필요하며
 * 그 전까지 이 응답을 실제 결제로 표기하면 안 된다.
 */
export async function POST(request: Request, context: Ctx) {
  const { product_id, repair_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const { data: repair, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .eq("id", repair_id)
    .eq("product_unit_id", productRef.unitId)
    .maybeSingle();

  if (qError && qError.code !== "22P02") {
    console.error("[pay] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  if (!repair) {
    return fail("REPAIR_NOT_FOUND", `repair_id '${repair_id}' not found`, 404);
  }

  const row = repair as RepairRow;
  if (row.status !== "quoted") {
    return fail("INVALID_STATE", "견적이 확정된 접수만 진행할 수 있습니다", 409);
  }

  const { data: updated, error: upError } = await supabase
    .from("repairs")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      is_demo_payment: true,
    })
    .eq("id", row.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (upError) {
    console.error("[pay] update error", upError);
    return fail("PAYMENT_FAILED", upError.message, 400);
  }

  const [dto] = await toSupabaseRepairDTOs(supabase, [updated as RepairRow], {
    [productRef.unitId]: productRef.slug,
  });
  return ok({ ...dto, is_demo_payment: true });
}

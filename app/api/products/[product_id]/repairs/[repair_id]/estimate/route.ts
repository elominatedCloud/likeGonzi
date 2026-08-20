import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { generateEstimateNote } from "@/lib/ai-prompts";
import { estimateRepair } from "@/lib/repair-estimate";
import { type RepairRow } from "@/lib/mappers";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";
import { toSupabaseRepairDTOs } from "@/lib/supabase-repair-mapper";

type Ctx = { params: Promise<{ product_id: string; repair_id: string }> };

/**
 * POST — 견적 산출.
 *
 * 금액과 기간은 기준표(lib/repair-estimate.ts)에서 계산한다. AI가 만들지 않는다 —
 * 고객에게 보여주는 금액은 근거가 있어야 하고, 모델은 그럴듯한 숫자를 지어낸다.
 * AI는 "왜 이 범위인지" 설명문만 쓰고, 키가 없으면 기본 문구로 폴백한다.
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
    console.error("[estimate] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  if (!repair) {
    return fail("REPAIR_NOT_FOUND", `repair_id '${repair_id}' not found`, 404);
  }

  const row = repair as RepairRow;
  if (row.status !== "submitted" && row.status !== "quoted") {
    return fail("INVALID_STATE", "이미 진행 중인 접수입니다", 409);
  }

  const estimate = estimateRepair(row.condition_tags);

  const { data: unit } = await supabase
    .from("my_products_view")
    .select("product_name")
    .eq("id", productRef.unitId)
    .maybeSingle();

  const note =
    (await generateEstimateNote({
      productName: (unit?.product_name as string | undefined) ?? "제품",
      areaLabel: estimate.areaLabel,
      conditionLabel: estimate.conditionLabel,
      min: estimate.min,
      max: estimate.max,
      days: estimate.days,
    })) ??
    `${estimate.areaLabel} ${estimate.conditionLabel} 기준 예상 비용입니다. ` +
      `실물 확인 후 최종 금액과 완료일이 확정됩니다.`;

  const { data: updated, error: upError } = await supabase
    .from("repairs")
    .update({
      estimate_min: estimate.min,
      estimate_max: estimate.max,
      estimate_days: estimate.days,
      estimate_note: note,
      estimated_at: new Date().toISOString(),
      status: "quoted",
    })
    .eq("id", row.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (upError) {
    console.error("[estimate] update error", upError);
    return fail("ESTIMATE_FAILED", upError.message, 400);
  }

  const [dto] = await toSupabaseRepairDTOs(supabase, [updated as RepairRow], {
    [productRef.unitId]: productRef.slug,
  });
  return ok(dto);
}

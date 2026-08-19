import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toRepairDTO, type RepairRow } from "@/lib/mappers";

type Ctx = { params: Promise<{ product_id: string; repair_id: string }> };

/**
 * GET /api/products/{product_id}/repairs/{repair_id} — 수선 단건 상세 조회
 * repairs_select_own RLS로 본인 것만 조회되고, 다른 사람 것이거나 없으면
 * data가 null로 와서 자동으로 404 처리됨.
 */
export async function GET(request: Request, context: Ctx) {
  const { product_id, repair_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .eq("id", repair_id)
    .eq("product_unit_id", product_id)
    .maybeSingle();

  if (qError) {
    console.error("[repairs/{id}] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  if (!data) {
    return fail("REPAIR_NOT_FOUND", `repair_id '${repair_id}' not found`, 404);
  }
  return ok(toRepairDTO(data as RepairRow));
}
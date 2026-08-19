import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toRepairDTO, type RepairRow } from "@/lib/mappers";

/**
 * GET /api/repairs — 내 제품 전체 수선 접수 내역 (제품 무관, 마이 화면용)
 * repairs_select_own RLS가 user_id = auth.uid()로 이미 본인 것만 걸러줌.
 */
export async function GET(request: Request) {
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .order("created_at", { ascending: false });

  if (qError) {
    console.error("[repairs] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  return ok(((data as RepairRow[] | null) ?? []).map(toRepairDTO));
}
import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { type RepairRow } from "@/lib/mappers";
import { productSlugsForUnitIds } from "@/lib/supabase-product-refs";
import { toSupabaseRepairDTOs } from "@/lib/supabase-repair-mapper";

/**
 * GET /api/repairs — 내 제품 전체 수선 접수 내역 (제품 무관, 마이 화면용)
 *
 * repairs_select_own RLS가 user_id = auth.uid()로 이미 본인 것만 걸러주지만,
 * 의도를 드러내기 위해 쿼리에서도 한 번 더 명시한다.
 */
export async function GET(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (qError) {
    console.error("[repairs] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }

  const rows = (data as RepairRow[] | null) ?? [];
  // FE 링크(/products/{slug}/repairs/{id})가 동작하도록 unit UUID → slug로 변환
  const slugByUnitId = await productSlugsForUnitIds(
    supabase,
    rows.map((row) => row.product_unit_id),
  );
  return ok(await toSupabaseRepairDTOs(supabase, rows, slugByUnitId));
}

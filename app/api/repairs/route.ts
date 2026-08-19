import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { type RepairRow } from "@/lib/mappers";
import { toSupabaseRepairDTOs } from "@/lib/supabase-repair-mapper";
import { productSlugsForUnitIds } from "@/lib/supabase-product-refs";

/** GET /api/repairs — 내 제품 수선 접수 내역 (RLS로 본인 것만) */
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

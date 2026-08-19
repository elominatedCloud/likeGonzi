import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toProductDTO, type MyProductRow } from "@/lib/mappers";
import { productSlugsForUnitIds } from "@/lib/supabase-product-refs";

/** GET /api/products/my — 내 제품 목록 (my_products_view, RLS로 본인 것만 조회됨) */
export async function GET(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("my_products_view")
    .select("*")
    .eq("user_id", user.id) // RLS로도 걸리지만 명시적으로 한 번 더
    .order("registered_at", { ascending: false });

  if (qError) {
    console.error("[products/my] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }

  const rows = data as MyProductRow[];
  // FE가 /log/{slug}, /products/{slug} 경로를 만들 수 있도록 slug를 같이 내린다.
  const slugByUnitId = await productSlugsForUnitIds(
    supabase,
    rows.map((row) => row.id),
  );
  return ok(
    rows.map((row) => ({ ...toProductDTO(row), slug: slugByUnitId[row.id] ?? row.id })),
  );
}

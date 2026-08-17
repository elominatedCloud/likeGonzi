import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toProductDTO, type MyProductRow } from "@/lib/mappers";

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

  return ok((data as MyProductRow[]).map(toProductDTO));
}

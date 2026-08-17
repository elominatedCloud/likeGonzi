import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toRepairDTO, type RepairRow } from "@/lib/mappers";

type Ctx = { params: Promise<{ product_id: string }> };

/** GET /api/products/{product_id}/repairs — 수선 이력 조회 */
export async function GET(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .eq("product_unit_id", product_id)
    .order("created_at", { ascending: false });

  if (qError) {
    console.error("[repairs] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  return ok(((data as RepairRow[] | null) ?? []).map(toRepairDTO));
}

/**
 * POST /api/products/{product_id}/repairs — 수선 신청
 * repairs_insert_own RLS가 "내가 실제로 소유한 product_unit인지"까지 체크해줍니다.
 */
export async function POST(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const body = await readJson<{
    title?: string;
    condition_tags?: string[];
    location?: string;
  }>(request);

  const { data, error: insError } = await supabase
    .from("repairs")
    .insert({
      product_unit_id: product_id,
      user_id: user.id,
      title: body?.title ?? "수선 접수",
      location: body?.location ?? "접수 대기",
      condition_tags: body?.condition_tags ?? [],
      source: "user",
    })
    .select("*")
    .single();

  if (insError) {
    // RLS 위반(본인 소유 아님)이면 42501, product_unit_id 잘못이면 FK 위반
    const status = insError.code === "42501" ? 403 : 400;
    console.error("[repairs] insert error", insError);
    return fail("REPAIR_CREATE_FAILED", insError.message, status);
  }
  return ok(toRepairDTO(data as RepairRow), 201);
}

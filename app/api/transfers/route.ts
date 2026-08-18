import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toTransferDTO, type TransferRow } from "@/lib/mappers";

/** GET /api/transfers — 보낸/받은 소유권 이전 목록 (RLS로 본인 관련 것만 조회됨) */
export async function GET(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("ownership_transfers")
    .select("*")
    .order("created_at", { ascending: false });

  if (qError) {
    console.error("[transfers] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }

  return ok((data as TransferRow[]).map((row) => toTransferDTO(row, user.id)));
}

/** POST /api/transfers — 소유권 이전 신청 (본인 소유 제품만 가능, RLS가 검증) */
export async function POST(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const body = await readJson<{ product_id?: string; to_email?: string }>(request);
  if (!body?.product_id || !body?.to_email) {
    return fail("VALIDATION_ERROR", "product_id and to_email are required", 400);
  }

  const { data, error: insertError } = await supabase
    .from("ownership_transfers")
    .insert({
      product_unit_id: body.product_id,
      from_user_id: user.id,
      to_email: body.to_email,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[transfers] insert error", insertError);
    return fail(
      "TRANSFER_FAILED",
      "제품을 찾을 수 없거나 소유 제품이 아닙니다",
      400,
    );
  }

  return ok(toTransferDTO(data as TransferRow, user.id), 201);
}
import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { logProductEvent } from "@/lib/product-events";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";

type Ctx = { params: Promise<{ product_id: string }> };

/**
 * POST /api/products/my/{product_id} — 제품 등록 (claim_product RPC)
 *
 * ⚠️ 주의: DB의 claim_product(p_tag_code)는 "tag_code" 기준으로 동작합니다.
 * 스캔 화면(register_confirm)에서 넘어온 tag_code를 그대로 이 경로의
 * {product_id} 자리에 넣어 호출하세요. (예: POST /api/products/my/UNIT-STARK-0001)
 * FE에서 "product_id"라는 이름으로 쓰고 있다면 실제로는 tag_code를 담아 보내야 합니다.
 */
export async function POST(request: Request, context: Ctx) {
  const { product_id: tagCode } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: rpcError } = await supabase.rpc("claim_product", {
    p_tag_code: tagCode,
  });

  if (rpcError) {
    if (rpcError.message.includes("invalid tag code")) {
      return fail("PRODUCT_NOT_FOUND", `tag_code '${tagCode}' not found`, 404);
    }
    if (rpcError.message.includes("already registered")) {
      return fail("ALREADY_REGISTERED", "이미 등록된 제품입니다", 409);
    }
    if (rpcError.message.includes("login required")) {
      return fail("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }
    console.error("[claim_product] rpc error", rpcError, "user:", user.id);
    return fail("REGISTER_FAILED", rpcError.message, 500);
  }

  const productUnitId = (data as { product_unit_id: string }[] | null)?.[0]
    ?.product_unit_id;

  await logProductEvent(supabase, {
    type: "register",
    userId: user.id,
    productUnitId: productUnitId ?? null,
    meta: { tag_code: tagCode },
  });

  return ok({ product_id: productUnitId, tag_code: tagCode, registered: true }, 201);
}

/**
 * DELETE /api/products/my/{product_id} — 내 계정에서 제품 연동 해제
 *
 * slug(stark)와 product_units.id(uuid)를 모두 받습니다.
 * 해제하면 태그가 다시 미등록 상태가 되어, 다음 소유자가 스캔해서 등록할 수 있습니다.
 * user_products RLS(user_products_delete_own)가 본인 소유 row만 지우도록 이미 보장합니다.
 */
export async function DELETE(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("NOT_REGISTERED", "등록되지 않은 제품입니다", 404);
  }
  const productUnitId = productRef.unitId;

  const { error: delError, count } = await supabase
    .from("user_products")
    .delete({ count: "exact" })
    .eq("product_unit_id", productUnitId)
    .eq("user_id", user.id);

  if (delError) {
    console.error("[unregister] delete error", delError);
    return fail("UNREGISTER_FAILED", delError.message, 500);
  }
  if (!count) {
    return fail("NOT_REGISTERED", "등록되지 않은 제품입니다", 404);
  }
  return ok({ product_id: productUnitId, deleted: true });
}

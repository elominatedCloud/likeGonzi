import { fail, ok } from "@/lib/api-response";
import { logProductEvent } from "@/lib/product-events";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Ctx = { params: Promise<{ tag_code: string }> };

type ScanRpcRow = {
  status: "unregistered" | "owned_by_me" | "owned_by_other";
  product_unit_id: string;
  product_name: string;
  model_no: string | null;
  material: string | null;
  manufacturer: string | null;
  serial_no: string;
};

/**
 * GET /api/products/scan/{tag_code} — QR/NFC 통합
 * public.scan_product(p_tag_code) RPC 호출 (security definer, RLS 우회, auth.uid() 기준 상태 판별)
 * 로그인 없이도 호출 가능 (Authorization 헤더 없으면 anon으로 동작 → owned_by_me는 안 나옴)
 */
export async function GET(request: Request, context: Ctx) {
  const { tag_code } = await context.params;

  const supabase = createSupabaseServerClient(request);
  const { data, error } = await supabase.rpc("scan_product", {
    p_tag_code: tag_code,
  });

  if (error) {
    if (error.message.includes("invalid tag code")) {
      return fail("TAG_NOT_FOUND", `tag_code '${tag_code}' not found`, 404);
    }
    console.error("[scan_product] rpc error", error);
    return fail("SCAN_FAILED", error.message, 500);
  }

  const row = (data as ScanRpcRow[] | null)?.[0];
  if (!row) {
    return fail("TAG_NOT_FOUND", `tag_code '${tag_code}' not found`, 404);
  }

  const ownership_status = row.status;
  const route =
    ownership_status === "owned_by_me"
      ? "product_detail"
      : ownership_status === "unregistered"
        ? "register_confirm"
        : "owned_by_other";

  // 비로그인 스캔도 기록한다(user_id는 null).
  const { data: authData } = await supabase.auth.getUser();
  await logProductEvent(supabase, {
    type: "scan",
    userId: authData.user?.id ?? null,
    productUnitId: row.product_unit_id,
    meta: { tag_code, ownership_status },
  });

  return ok({
    tag_code,
    product_id: row.product_unit_id,
    product_name: row.product_name,
    model_no: row.model_no,
    material: row.material,
    manufacturer: row.manufacturer,
    serial: row.serial_no,
    serial_no: row.serial_no,
    ownership_status,
    is_registered_to_user: ownership_status === "owned_by_me",
    is_campaign: tag_code.startsWith("CAMP-"),
    route,
  });
}

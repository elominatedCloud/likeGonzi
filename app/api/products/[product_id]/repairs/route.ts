import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { type RepairRow } from "@/lib/mappers";
import { toSupabaseRepairDTOs } from "@/lib/supabase-repair-mapper";
import { logProductEvent } from "@/lib/product-events";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";

type Ctx = { params: Promise<{ product_id: string }> };

/** GET /api/products/{product_id}/repairs — 수선 이력 조회 */
export async function GET(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  // FE는 slug(stark-backpack)를, DB는 product_units UUID를 쓰므로 여기서 변환한다.
  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const { data, error: qError } = await supabase
    .from("repairs")
    .select("*")
    .eq("product_unit_id", productRef.unitId)
    .order("created_at", { ascending: false });

  if (qError) {
    console.error("[repairs] query error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  const rows = (data as RepairRow[] | null) ?? [];
  return ok(
    await toSupabaseRepairDTOs(supabase, rows, {
      [productRef.unitId]: productRef.slug,
    }),
  );
}

/**
 * POST /api/products/{product_id}/repairs — 수선 신청
 * repairs_insert_own RLS가 "내가 실제로 소유한 product_unit인지"까지 체크해줍니다.
 */
export async function POST(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const body = await readJson<{
    title?: string;
    condition_tags?: string[];
    location?: string;
    thumbnail_url?: string;
    thumbnail_path?: string;
    source?: "store" | "ai_custom" | "user";
    memo?: string;
  }>(request);

  const { data, error: insError } = await supabase
    .from("repairs")
    .insert({
      product_unit_id: productRef.unitId,
      user_id: user.id,
      title: body?.title ?? "수선 접수",
      location: body?.location ?? "접수 대기",
      condition_tags: body?.condition_tags ?? [],
      // 사진은 Storage에 올린 뒤 path만 저장한다(thumbnail_path).
      // thumbnail_url은 Supabase 세션이 없는 데모 폴백(data URL)용.
      thumbnail_path: body?.thumbnail_path ?? null,
      thumbnail_url: body?.thumbnail_path ? null : (body?.thumbnail_url ?? null),
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
  await logProductEvent(supabase, {
    type: "repair_submit",
    userId: user.id,
    productUnitId: productRef.unitId,
    meta: { condition_tags: body?.condition_tags ?? [] },
  });

  const [dto] = await toSupabaseRepairDTOs(supabase, [data as RepairRow], {
    [productRef.unitId]: productRef.slug,
  });
  return ok(dto, 201);
}

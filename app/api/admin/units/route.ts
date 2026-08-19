import { fail, ok, readJson } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-guard";

interface UnitRow {
  id: string;
  product_id: string;
  tag_code: string;
  serial_no: string;
  store: string | null;
  color: string | null;
  year: number | null;
  created_at: string;
}

/** GET /api/admin/units — 발급된 개체 목록 (+ 등록 여부) */
export async function GET(request: Request) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const slug = new URL(request.url).searchParams.get("product")?.trim();

  let productId: string | null = null;
  if (slug) {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!product) return fail("PRODUCT_NOT_FOUND", `slug '${slug}' not found`, 404);
    productId = product.id as string;
  }

  const query = supabase
    .from("product_units")
    .select("id, product_id, tag_code, serial_no, store, color, year, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (productId) query.eq("product_id", productId);

  const [unitsResult, productsResult, registeredResult] = await Promise.all([
    query,
    supabase.from("products").select("id, slug, product_name, model_no"),
    supabase.from("user_products").select("product_unit_id"),
  ]);

  if (unitsResult.error || productsResult.error || registeredResult.error) {
    console.error(
      "[admin/units] query error",
      unitsResult.error ?? productsResult.error ?? registeredResult.error,
    );
    return fail("QUERY_FAILED", "개체 목록을 불러오지 못했습니다", 500);
  }

  const productById = Object.fromEntries(
    (productsResult.data ?? []).map((product) => [product.id, product]),
  );
  const registered = new Set(
    (registeredResult.data ?? []).map((row) => row.product_unit_id as string),
  );

  const units = ((unitsResult.data as UnitRow[] | null) ?? []).map((unit) => ({
      id: unit.id,
      tag_code: unit.tag_code,
      serial_no: unit.serial_no,
      store: unit.store,
      color: unit.color,
      year: unit.year,
      created_at: unit.created_at,
      product_slug: productById[unit.product_id]?.slug ?? null,
      product_name: productById[unit.product_id]?.product_name ?? null,
      is_registered: registered.has(unit.id),
  }));

  // 발급 폼의 제품 선택지도 같이 내려서 요청 한 번으로 끝낸다.
  return ok({ products: productsResult.data ?? [], units });
}

/**
 * POST /api/admin/units — 개체 대량 발급
 * tag_code/serial_no 채번은 issue_product_units RPC가 원자적으로 처리한다.
 */
export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body = await readJson<{
    product_slug?: string;
    store?: string;
    year?: number;
    quantity?: number;
  }>(request);

  if (!body?.product_slug?.trim()) {
    return fail("VALIDATION_ERROR", "product_slug is required", 400);
  }
  const quantity = Number(body.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 200) {
    return fail("VALIDATION_ERROR", "quantity는 1~200 사이여야 합니다", 400);
  }

  const { data, error: rpcError } = await supabase.rpc("issue_product_units", {
    p_product_slug: body.product_slug.trim(),
    p_store: body.store?.trim() || null,
    p_year: body.year ?? null,
    p_quantity: quantity,
  });

  if (rpcError) {
    if (rpcError.message.includes("invalid product slug")) {
      return fail("PRODUCT_NOT_FOUND", "제품을 찾을 수 없습니다", 404);
    }
    if (rpcError.message.includes("admin only")) {
      return fail("FORBIDDEN", "운영자 권한이 필요합니다", 403);
    }
    console.error("[admin/units] issue error", rpcError);
    return fail("ISSUE_FAILED", rpcError.message, 400);
  }

  return ok(data, 201);
}

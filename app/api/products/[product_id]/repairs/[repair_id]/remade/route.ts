import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { generateImages, isAiConfigured } from "@/lib/ai";
import { remadePrompt } from "@/lib/ai-prompts";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";
import { AREA_TAGS, CONDITION_TYPES } from "@/lib/repair";

type Ctx = { params: Promise<{ product_id: string; repair_id: string }> };

const AREA_LABEL = new Map<string, string>(AREA_TAGS.map((t) => [t.id, t.label]));
const CONDITION_LABEL = new Map<string, string>(
  CONDITION_TYPES.map((t) => [t.id, t.label]),
);

/** condition_tags는 [부위, 증상] 순서로 저장된다. 순서를 믿지 않고 각각 조회한다. */
function splitTags(tags: string[] | null) {
  const list = tags ?? [];
  return {
    area: list.find((t) => AREA_LABEL.has(t)),
    condition: list.find((t) => CONDITION_LABEL.has(t)),
  };
}

async function loadRepair(
  supabase: Awaited<ReturnType<typeof requireSupabaseUser>>["supabase"],
  productId: string,
  repairId: string,
) {
  if (!supabase) return { repair: null, unitId: null, error: null };

  const productRef = await resolveOwnedProductRef(supabase, productId);
  if (!productRef) {
    return {
      repair: null,
      unitId: null,
      error: fail("PRODUCT_NOT_FOUND", `product_id '${productId}' not found`, 404),
    };
  }

  const { data, error } = await supabase
    .from("repairs")
    .select("id, title, condition_tags, ai_image_url, source, memo")
    .eq("id", repairId)
    .eq("product_unit_id", productRef.unitId)
    .maybeSingle();

  // 22P02: repair_id가 UUID 형식이 아님 → 없는 접수로 취급
  if (error && error.code !== "22P02") {
    return { repair: null, unitId: null, error: fail("QUERY_FAILED", error.message, 500) };
  }
  if (!data) {
    return {
      repair: null,
      unitId: null,
      error: fail("REPAIR_NOT_FOUND", `repair_id '${repairId}' not found`, 404),
    };
  }
  return { repair: data, unitId: productRef.unitId, error: null };
}

/**
 * POST — REMADE 시안 생성.
 *
 * 손상을 지우는 게 아니라 그 자리에 얹을 장식 시안을 만든다.
 * 생성만 하고 저장하지 않는다. 사용자가 고른 것만 PATCH로 남긴다.
 */
export async function POST(request: Request, context: Ctx) {
  const { product_id, repair_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { repair, unitId, error: loadError } = await loadRepair(supabase, product_id, repair_id);
  if (loadError) return loadError;
  if (!repair) return fail("REPAIR_NOT_FOUND", "repair not found", 404);

  if (!isAiConfigured()) {
    // 키 없이도 앱이 굴러가야 한다. 실패가 아니라 "미설정"으로 알린다.
    return ok({ configured: false, images: [] as string[] });
  }

  const { area, condition } = splitTags(repair.condition_tags as string[] | null);

  // 색·소재를 상수로 박아두면 어떤 가방을 접수해도 같은 그림이 나온다.
  // 실제 개체 값을 읽고, 없을 때만 무난한 기본값으로 떨어진다.
  const { data: unit } = await supabase!
    .from("my_products_view")
    .select("product_name, color, material")
    .eq("id", unitId)
    .maybeSingle();

  const images = await generateImages(
    remadePrompt({
      productName: (unit?.product_name as string | null) ?? repair.title ?? "MCM bag",
      material: (unit?.material as string | null) ?? "coated canvas",
      color: (unit?.color as string | null) ?? "cognac",
      areaLabel: AREA_LABEL.get(area ?? "") ?? "표면",
      conditionLabel: CONDITION_LABEL.get(condition ?? "") ?? "마모",
      memo: repair.memo as string | null,
    }),
    3,
  );

  if (!images) return fail("GENERATION_FAILED", "시안 생성에 실패했습니다.", 502);

  return ok({ configured: true, images });
}

/**
 * PATCH — 이 접수를 어느 방향으로 고칠지 남긴다.
 *
 * 두 방향이 같은 접수에서 갈린다.
 * - { image_url } → REMADE. 고른 시안을 저장하고 source를 'remade'로.
 * - { option: "restore" } → 복원. source를 'restore'로 하고 시안을 지운다.
 *
 * 복원은 원래 화면 상태로만 존재해서 새로고침하면 사라졌고, DB에는 접수만 하고
 * 방향을 안 고른 것과 똑같이 남아 매장도 구분할 수 없었다.
 */
export async function PATCH(request: Request, context: Ctx) {
  const { product_id, repair_id } = await context.params;
  const { supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const body = await readJson<{ image_url?: string; option?: string }>(request);
  const imageUrl = body?.image_url?.trim();
  const restoring = body?.option === "restore";
  if (!imageUrl && !restoring) {
    return fail("INVALID_BODY", "image_url or option:'restore' is required", 400);
  }

  const { repair, error: loadError } = await loadRepair(supabase, product_id, repair_id);
  if (loadError) return loadError;
  if (!repair) return fail("REPAIR_NOT_FOUND", "repair not found", 404);

  const patch = restoring
    ? { ai_image_url: null, source: "restore" }
    : { ai_image_url: imageUrl, source: "remade" };

  const { data, error: updateError } = await supabase!
    .from("repairs")
    .update(patch)
    .eq("id", repair.id)
    .select("id, ai_image_url, source")
    .maybeSingle();

  if (updateError) {
    console.error("[remade] update error", updateError);
    return fail("UPDATE_FAILED", updateError.message, 500);
  }
  if (!data) return fail("REPAIR_NOT_FOUND", "repair not found", 404);

  return ok(data);
}

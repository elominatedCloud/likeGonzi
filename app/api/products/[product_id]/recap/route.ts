import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { generateRecap } from "@/lib/ai-prompts";
import { logProductEvent } from "@/lib/product-events";
import type { RepairRow, StoryRow } from "@/lib/mappers";
import { resolveOwnedProductRef } from "@/lib/supabase-product-refs";

type Ctx = { params: Promise<{ product_id: string }> };

/** 키가 없거나 호출이 실패했을 때 쓰는 규칙 기반 문장. 데모가 멈추지 않게 한다. */
function fallbackRecap(
  productName: string,
  storyCount: number,
  repairCount: number,
) {
  if (storyCount === 0 && repairCount === 0) {
    return `${productName}의 Storybook이 막 시작됐어요. 첫 기록을 남기면 이곳에 이야기가 쌓입니다.`;
  }
  const parts = [`${productName}와 함께한 기록이 ${storyCount}건 쌓였어요.`];
  if (repairCount > 0) {
    parts.push(`관리·수선 기록도 ${repairCount}건 남아 있습니다.`);
  }
  parts.push("기록이 늘어나면 Recap도 함께 자세해집니다.");
  return parts.join(" ");
}

/**
 * GET /api/products/{product_id}/recap — 제품 Recap
 *
 * 기록 수가 바뀌었을 때만 새로 생성하고, 나머지는 캐시(product_recaps)를 돌려준다.
 * ?refresh=1 이면 강제로 다시 만든다.
 */
export async function GET(request: Request, context: Ctx) {
  const { product_id } = await context.params;
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productRef = await resolveOwnedProductRef(supabase, product_id);
  if (!productRef) {
    return fail("PRODUCT_NOT_FOUND", `product_id '${product_id}' not found`, 404);
  }

  const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1";

  const [unitResult, linkResult, repairResult, cachedResult] = await Promise.all([
    supabase
      .from("my_products_view")
      .select("product_name, store, year")
      .eq("id", productRef.unitId)
      .maybeSingle(),
    supabase
      .from("story_products")
      .select("story_id")
      .eq("product_unit_id", productRef.unitId),
    supabase
      .from("repairs")
      .select("*")
      .eq("product_unit_id", productRef.unitId)
      .order("created_at", { ascending: false }),
    supabase
      .from("product_recaps")
      .select("*")
      .eq("product_unit_id", productRef.unitId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const productName =
    (unitResult.data?.product_name as string | undefined) ?? "제품";
  const storyIds = (linkResult.data ?? []).map((row) => row.story_id as string);
  const repairs = ((repairResult.data as RepairRow[] | null) ?? []).map((row) => ({
    title: row.title ?? "수선 접수",
    date: row.created_at.slice(0, 10),
  }));

  const cached = cachedResult.data as
    | { content: string; story_count: number; repair_count: number; is_ai: boolean; updated_at: string }
    | null;

  const isFresh =
    cached &&
    cached.story_count === storyIds.length &&
    cached.repair_count === repairs.length;

  if (cached && isFresh && !forceRefresh) {
    await logProductEvent(supabase, {
      type: "recap_view",
      userId: user.id,
      productUnitId: productRef.unitId,
      meta: { cached: true },
    });
    return ok({
      content: cached.content,
      is_ai: cached.is_ai,
      story_count: cached.story_count,
      repair_count: cached.repair_count,
      updated_at: cached.updated_at,
      cached: true,
    });
  }

  let stories: { tag: string; place?: string | null; memo?: string | null; date: string }[] = [];
  if (storyIds.length > 0) {
    const { data: storyRows } = await supabase
      .from("stories")
      .select("*")
      .in("id", storyIds)
      .order("story_date", { ascending: true });
    stories = ((storyRows as StoryRow[] | null) ?? []).map((row) => ({
      tag: row.tag ?? "",
      place: row.location,
      memo: row.memo,
      date: row.story_date,
    }));
  }

  const generated = await generateRecap({
    productName,
    store: unitResult.data?.store as string | null,
    year: unitResult.data?.year as number | null,
    stories,
    repairs,
  });

  const content =
    generated ?? fallbackRecap(productName, stories.length, repairs.length);

  const { error: upsertError } = await supabase.from("product_recaps").upsert(
    {
      product_unit_id: productRef.unitId,
      user_id: user.id,
      content,
      story_count: stories.length,
      repair_count: repairs.length,
      is_ai: generated !== null,
    },
    { onConflict: "product_unit_id,user_id" },
  );
  if (upsertError) {
    // 저장 실패해도 본문은 돌려준다 — 다음 요청에서 다시 만들면 된다.
    console.error("[recap] cache upsert error", upsertError);
  }

  await logProductEvent(supabase, {
    type: "recap_view",
    userId: user.id,
    productUnitId: productRef.unitId,
    meta: { cached: false, is_ai: generated !== null },
  });

  return ok({
    content,
    is_ai: generated !== null,
    story_count: stories.length,
    repair_count: repairs.length,
    updated_at: new Date().toISOString(),
    cached: false,
  });
}

import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import type { RepairRow, StoryRow } from "@/lib/mappers";
import { resolveOwnedProductRef, productSlugsForUnitIds } from "@/lib/supabase-product-refs";
import { signPhotoPath } from "@/lib/supabase-photo-url";
import { normalizeDemoStoryImage } from "@/lib/story-image";

/** 타임라인 한 줄. 종류가 달라도 화면에서 같은 카드로 그린다. */
export interface TimelineEntry {
  id: string;
  kind: "register" | "story" | "repair";
  /** YYYY-MM-DD */
  date: string;
  title: string;
  place: string | null;
  note: string | null;
  image: string | null;
  product_slug: string;
  product_name: string;
}

/**
 * GET /api/timeline — 내 제품 전체의 통합 이력
 *
 * 등록 · 사진 기록 · 수선을 한 줄기로 합친다.
 * 지금까지 로그 화면은 기록만 API에서 읽고 제품 이력은 하드코딩,
 * 케어 기록은 localStorage였다. 그래서 수선을 접수해도 타임라인에 안 나타나고
 * 기기를 바꾸면 기록이 사라졌다.
 *
 * ?product={slug|uuid} 를 주면 그 제품만 반환한다.
 */
export async function GET(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const productParam = new URL(request.url).searchParams.get("product")?.trim();
  let unitFilter: string | null = null;
  if (productParam) {
    const ref = await resolveOwnedProductRef(supabase, productParam);
    if (!ref) return fail("PRODUCT_NOT_FOUND", `product '${productParam}' not found`, 404);
    unitFilter = ref.unitId;
  }

  const ownedQuery = supabase
    .from("my_products_view")
    .select("id, product_name, registered_at, cutout_image")
    .eq("user_id", user.id);
  if (unitFilter) ownedQuery.eq("id", unitFilter);

  const { data: owned, error: ownedError } = await ownedQuery;
  if (ownedError) {
    console.error("[timeline] owned query error", ownedError);
    return fail("QUERY_FAILED", "타임라인을 불러오지 못했습니다", 500);
  }

  const units = (owned ?? []) as {
    id: string;
    product_name: string;
    registered_at: string;
    cutout_image: string | null;
  }[];
  if (units.length === 0) return ok([]);

  const unitIds = units.map((unit) => unit.id);
  const unitById = Object.fromEntries(units.map((unit) => [unit.id, unit]));
  const slugByUnitId = await productSlugsForUnitIds(supabase, unitIds);

  const [linkResult, repairResult] = await Promise.all([
    supabase.from("story_products").select("story_id, product_unit_id").in("product_unit_id", unitIds),
    supabase.from("repairs").select("*").in("product_unit_id", unitIds).eq("user_id", user.id),
  ]);

  const links = (linkResult.data ?? []) as { story_id: string; product_unit_id: string }[];
  const storyIds = [...new Set(links.map((link) => link.story_id))];

  let storyRows: StoryRow[] = [];
  if (storyIds.length > 0) {
    const { data } = await supabase.from("stories").select("*").in("id", storyIds);
    storyRows = (data ?? []) as StoryRow[];
  }
  const unitByStoryId = Object.fromEntries(links.map((link) => [link.story_id, link.product_unit_id]));

  const describe = (unitId: string) => ({
    product_slug: slugByUnitId[unitId] ?? unitId,
    product_name: unitById[unitId]?.product_name ?? "제품",
  });

  const entries: TimelineEntry[] = [];

  for (const unit of units) {
    entries.push({
      id: `register-${unit.id}`,
      kind: "register",
      date: unit.registered_at.slice(0, 10),
      title: "구매 · 정품 등록",
      place: null,
      note: "정품 인증과 함께 제품 이력이 시작되었습니다.",
      image: unit.cutout_image,
      ...describe(unit.id),
    });
  }

  for (const row of storyRows) {
    const unitId = unitByStoryId[row.id];
    if (!unitId) continue;
    if (row.story_date < unitById[unitId].registered_at.slice(0, 10)) continue;
    entries.push({
      id: row.id,
      kind: "story",
      date: row.story_date,
      title: row.tag ?? "기록",
      place: row.location,
      note: row.story ?? row.memo,
      image: normalizeDemoStoryImage(
        row.photo_url ?? ((await signPhotoPath(supabase, row.photo_path)) || null),
        describe(unitId).product_slug,
      ),
      ...describe(unitId),
    });
  }

  for (const row of (repairResult.data ?? []) as RepairRow[]) {
    if (row.created_at.slice(0, 10) < unitById[row.product_unit_id].registered_at.slice(0, 10)) continue;

    // REMADE는 손상을 지운 게 아니라 그 자리에 무늬를 새긴 기록이다.
    // 타임라인에는 손상 사진이 아니라 채택한 시안이 남아야 한다.
    const isRemade = row.source === "remade" && Boolean(row.ai_image_url);

    entries.push({
      id: row.id,
      kind: "repair",
      date: row.created_at.slice(0, 10),
      title: isRemade
        ? `REMADE · ${row.title ?? "리폼"}`
        : (row.title ?? "수선 접수"),
      place: row.location,
      note: (row.condition_tags ?? []).join(" · ") || null,
      image: isRemade
        ? row.ai_image_url
        : (row.thumbnail_url ?? ((await signPhotoPath(supabase, row.thumbnail_path)) || null)),
      ...describe(row.product_unit_id),
    });
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return ok(entries);
}

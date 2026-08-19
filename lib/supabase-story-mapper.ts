import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toStoryDTO,
  type StoryDTO,
  type StoryRow,
} from "@/lib/mappers";
import { signPhotoPath } from "@/lib/supabase-photo-url";
import { productSlugsForUnitIds } from "@/lib/supabase-product-refs";

/** Supabase row와 private Storage 경로를 FE용 Story DTO로 변환한다. */
export async function toSupabaseStoryDTOs(
  supabase: SupabaseClient,
  rows: StoryRow[],
  unitIdsByStoryId: Record<string, string[]>,
): Promise<StoryDTO[]> {
  const allUnitIds = Object.values(unitIdsByStoryId).flat();
  const slugByUnitId = await productSlugsForUnitIds(supabase, allUnitIds);

  return Promise.all(
    rows.map(async (row) => {
      const unitIds = unitIdsByStoryId[row.id] ?? [];
      const productSlugs = unitIds.map(
        (unitId) => slugByUnitId[unitId] ?? unitId,
      );
      let imageUrl = row.photo_url ?? "";

      if (!imageUrl && row.photo_path) {
        imageUrl = await signPhotoPath(supabase, row.photo_path);
      }

      return toStoryDTO(row, productSlugs, imageUrl);
    }),
  );
}

/** story_id → 연결된 product_unit_id 목록 */
export async function buildStoryProductIdsMap(
  supabase: SupabaseClient,
  storyIds: string[],
): Promise<Record<string, string[]>> {
  if (storyIds.length === 0) return {};
  const { data } = await supabase
    .from("story_products")
    .select("story_id, product_unit_id")
    .in("story_id", storyIds);

  const map: Record<string, string[]> = {};
  for (const row of data ?? []) {
    (map[row.story_id] ??= []).push(row.product_unit_id);
  }
  return map;
}

/**
 * 한 제품(product_unit)에 연결된 story 목록. 최신순.
 * stories 라우트와 제품 상세 라우트가 같은 조인을 쓰도록 여기로 모았다.
 */
export async function listProductStoryDTOs(
  supabase: SupabaseClient,
  unitId: string,
): Promise<StoryDTO[]> {
  const { data: links } = await supabase
    .from("story_products")
    .select("story_id")
    .eq("product_unit_id", unitId);

  const storyIds = (links ?? []).map((link) => link.story_id as string);
  if (storyIds.length === 0) return [];

  const { data: storyRows } = await supabase
    .from("stories")
    .select("*")
    .in("id", storyIds)
    .order("created_at", { ascending: false });

  return toSupabaseStoryDTOs(
    supabase,
    (storyRows ?? []) as StoryRow[],
    await buildStoryProductIdsMap(supabase, storyIds),
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toStoryDTO,
  type StoryDTO,
  type StoryRow,
} from "@/lib/mappers";
import { productSlugsForUnitIds } from "@/lib/supabase-product-refs";

const STORY_PHOTOS_BUCKET = "story-photos";

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
        const { data } = await supabase.storage
          .from(STORY_PHOTOS_BUCKET)
          .createSignedUrl(row.photo_path, 60 * 10);
        imageUrl = data?.signedUrl ?? "";
      }

      return toStoryDTO(row, productSlugs, imageUrl);
    }),
  );
}

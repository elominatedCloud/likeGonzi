import type { SupabaseClient } from "@supabase/supabase-js";
import { toRepairDTO, type RepairDTO, type RepairRow } from "@/lib/mappers";
import { signPhotoPath } from "@/lib/supabase-photo-url";

/**
 * repairs row → FE DTO.
 * thumbnail_path(Storage)에 저장된 사진은 임시 서명 URL로 바꿔서 내려준다.
 * productIdByUnitId를 주면 product_id를 FE 라우팅용 slug로 바꾼다.
 */
export function toSupabaseRepairDTOs(
  supabase: SupabaseClient,
  rows: RepairRow[],
  productIdByUnitId?: Record<string, string>,
): Promise<RepairDTO[]> {
  return Promise.all(
    rows.map(async (row) => {
      const thumbnailUrl =
        row.thumbnail_url ?? (await signPhotoPath(supabase, row.thumbnail_path));
      return toRepairDTO(
        row,
        productIdByUnitId?.[row.product_unit_id],
        thumbnailUrl,
      );
    }),
  );
}

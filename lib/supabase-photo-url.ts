import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 유저가 올린 사진(기록 · 수선)은 전부 이 private 버킷에 들어간다.
 * RLS가 "경로 첫 폴더 = auth.uid()"만 허용하므로, 읽을 때는 임시 서명 URL이 필요하다.
 */
export const USER_PHOTOS_BUCKET = "story-photos";

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function signPhotoPath(
  supabase: SupabaseClient,
  path: string | null | undefined,
): Promise<string> {
  if (!path) return "";
  const { data } = await supabase.storage
    .from(USER_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? "";
}

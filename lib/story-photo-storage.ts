import { supabase } from "@/lib/supabase";

export const STORY_PHOTOS_BUCKET = "story-photos";
export const STORY_PHOTO_MAX_BYTES = 8 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export type StoryPhotoPersistence =
  | { mode: "cloud"; photoPath: string }
  | {
      mode: "local";
      reason: "supabase_not_configured" | "supabase_session_missing" | "not_data_url";
    };

type CloudStoryInput = {
  tag: string;
  photoPath: string;
  location?: string;
  memo?: string;
  storyDate: string;
  productSlugs: string[];
};

export type CloudStoryRecord = {
  id: string;
  photo_path: string;
  product_slugs: string[];
};

function dataUrlToBlob(dataUrl: string): Blob {
  const separator = dataUrl.indexOf(",");
  if (separator < 0) throw new Error("사진 데이터 형식을 확인할 수 없습니다.");

  const header = dataUrl.slice(0, separator);
  const mime = header.match(/^data:([^;]+);base64$/)?.[1]?.toLowerCase();
  if (!mime || !EXTENSION_BY_MIME[mime]) {
    throw new Error("JPG, PNG, WEBP 또는 HEIC 사진만 저장할 수 있습니다.");
  }

  const binary = window.atob(dataUrl.slice(separator + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

/**
 * 카메라/앨범 data URL을 사용자 전용 private Storage 경로에 저장한다.
 * Supabase 설정 또는 실제 Auth 세션이 없는 데모 환경에서는 로컬 저장으로 폴백한다.
 */
export async function persistStoryPhoto(
  dataUrl: string,
  productId: string,
): Promise<StoryPhotoPersistence> {
  if (!dataUrl.startsWith("data:image/")) {
    return { mode: "local", reason: "not_data_url" };
  }
  if (!supabase) {
    return { mode: "local", reason: "supabase_not_configured" };
  }

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) {
    return { mode: "local", reason: "supabase_session_missing" };
  }

  const photo = dataUrlToBlob(dataUrl);
  if (photo.size > STORY_PHOTO_MAX_BYTES) {
    throw new Error("사진은 8MB 이하로 선택해 주세요.");
  }

  const extension = EXTENSION_BY_MIME[photo.type];
  const safeProductId = productId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const photoPath = `${data.user.id}/${safeProductId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(STORY_PHOTOS_BUCKET)
    .upload(photoPath, photo, {
      cacheControl: "3600",
      contentType: photo.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`사진 업로드에 실패했습니다: ${uploadError.message}`);
  }

  return { mode: "cloud", photoPath };
}

/** Story와 연결 제품을 소유권 검증 RPC 한 번으로 원자적으로 저장한다. */
export async function persistCloudStory(
  input: CloudStoryInput,
): Promise<CloudStoryRecord> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");

  const { data, error } = await supabase.rpc("create_story_with_products", {
    p_tag: input.tag,
    p_photo_path: input.photoPath,
    p_location: input.location ?? null,
    p_memo: input.memo ?? null,
    p_story_date: input.storyDate,
    p_product_slugs: input.productSlugs,
  });

  if (error) {
    throw new Error(`기록 저장에 실패했습니다: ${error.message}`);
  }

  return data as CloudStoryRecord;
}

/** Story 생성 실패 시 먼저 업로드한 object를 정리하는 보상 작업. */
export async function removeStoryPhoto(photoPath: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.storage
    .from(STORY_PHOTOS_BUCKET)
    .remove([photoPath]);
  if (error) console.warn("Failed to remove orphaned story photo", error.message);
}

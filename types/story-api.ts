export interface StoryRecord {
  id: string;
  product_id: string;
  /** 사진 URL 또는 data URL */
  image_url: string;
  /** private Supabase Storage object path */
  photo_path?: string;
  /** 제품 태그 / 제목 */
  tag: string;
  /** 장소 */
  place: string;
  /** 메모·코멘트 */
  memo: string;
  /** 본문 스토리 (선택) */
  story?: string;
  /** 함께 태그한 제품 id 목록 */
  product_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateStoryBody {
  /** 데모/외부 이미지 URL. photo_path가 있으면 생략 가능 */
  image_url?: string;
  /** private Supabase Storage object path */
  photo_path?: string;
  tag: string;
  place?: string;
  memo?: string;
  story?: string;
  product_ids?: string[];
  date?: string;
}

export interface UpdateStoryBody {
  image_url?: string;
  photo_path?: string;
  tag?: string;
  place?: string;
  memo?: string;
  story?: string;
  product_ids?: string[];
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

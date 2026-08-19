
/** 상황(다중 선택). 자유 텍스트인 tag/place와 달리 집계 가능한 축이다. */
export const OCCASIONS = [
  { id: "commute", label: "출근" },
  { id: "travel", label: "여행" },
  { id: "exhibition", label: "전시" },
  { id: "gathering", label: "모임" },
  { id: "date", label: "데이트" },
  { id: "workout", label: "운동" },
  { id: "daily", label: "일상" },
] as const;

/** 동행(단일 선택) */
export const COMPANIONS = [
  { id: "solo", label: "혼자" },
  { id: "friends", label: "친구" },
  { id: "family", label: "가족" },
  { id: "partner", label: "연인" },
  { id: "colleagues", label: "동료" },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];
export type CompanionId = (typeof COMPANIONS)[number]["id"];

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
  /** 상황 (다중) */
  occasion?: OccasionId[];
  /** 동행 (단일) */
  companion?: CompanionId;
  /** 정규화된 도시명 */
  city?: string;
  /** ISO 3166-1 alpha-2 */
  country?: string;
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
  occasion?: OccasionId[];
  companion?: CompanionId;
  city?: string;
  country?: string;
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
  occasion?: OccasionId[];
  companion?: CompanionId;
  city?: string;
  country?: string;
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

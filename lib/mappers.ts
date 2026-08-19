import type { CompanionId, OccasionId } from "@/types/story-api";

/**
 * snake_case(DB) → 기존 API 응답 계약(mock-db.ts 시절 필드명) 변환 계층.
 *
 * my_products_view / product_units / repairs 등 DB row를 그대로 응답하지 않고
 * 여기를 거치게 하면, 나중에 DB 컬럼명이 바뀌어도 Route Handler와 FE 계약은
 * 그대로 유지할 수 있습니다.
 */

// ------------------------------------------------------------
// products (my_products_view 기준)
// ------------------------------------------------------------

export interface MyProductRow {
  id: string; // = product_units.id
  registered_at: string;
  is_favorite: boolean;
  tag_code: string;
  serial_no: string;
  store: string | null;
  color: string | null;
  year: number | null;
  cutout_image: string | null;
  lifestyle_images: string[] | null;
  care_score: number;
  repair_vouchers: number;
  cleaning_vouchers: number;
  user_id: string;
  model_id: string;
  product_name: string;
  model_no: string | null;
  material: string | null;
  manufacturer: string | null;
}

export interface ProductDTO {
  id: string;
  name: string;
  model_no: string | null;
  serial: string;
  tag_code: string;
  material: string | null;
  manufacturer: string | null;
  color: string | null;
  year: number | null;
  store: string | null;
  cutout_image: string | null;
  lifestyle_images: string[];
  care_score: number;
  repair_vouchers: number;
  cleaning_vouchers: number;
  registered_at: string;
  is_favorite: boolean;
}

export function toProductDTO(row: MyProductRow): ProductDTO {
  return {
    id: row.id,
    name: row.product_name,
    model_no: row.model_no,
    serial: row.serial_no,
    tag_code: row.tag_code,
    material: row.material,
    manufacturer: row.manufacturer,
    color: row.color,
    year: row.year,
    store: row.store,
    cutout_image: row.cutout_image,
    lifestyle_images: row.lifestyle_images ?? [],
    care_score: row.care_score,
    repair_vouchers: row.repair_vouchers,
    cleaning_vouchers: row.cleaning_vouchers,
    registered_at: row.registered_at,
    is_favorite: row.is_favorite,
  };
}

// ------------------------------------------------------------
// repairs
// ------------------------------------------------------------

export interface RepairRow {
  id: string;
  product_unit_id: string;
  user_id: string;
  condition_tags: string[] | null;
  status: string;
  title: string | null;
  location: string | null;
  thumbnail_url: string | null;
  thumbnail_path: string | null;
  source: string;
  ai_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepairDTO {
  id: string;
  product_id: string;
  title: string | null;
  location: string | null;
  thumbnail_url: string | null;
  source: string;
  status: string;
  condition_tags: string[];
  receipt_no: string;
  ai_image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 접수번호는 DB 컬럼이 아니라 (접수일 + repair id) 조합으로 만든다.
 * ponytail: 별도 시퀀스 컬럼 없이 안정적으로 재현 가능. 사람이 부르는 번호가
 * 필요해지면 repairs에 receipt_no 컬럼을 추가하고 여기만 바꾸면 된다.
 */
export function repairReceiptNo(row: Pick<RepairRow, "id" | "created_at">) {
  const ymd = row.created_at.slice(0, 10).replaceAll("-", "");
  return `R-${ymd}-${row.id.slice(0, 4).toUpperCase()}`;
}

/**
 * productId를 넘기면 FE가 라우팅에 쓰는 제품 slug(stark 등)로 바꿔서 내려준다.
 * 넘기지 않으면 DB의 product_unit_id(UUID) 그대로.
 */
export function toRepairDTO(
  row: RepairRow,
  productId = row.product_unit_id,
  thumbnailUrl = row.thumbnail_url,
): RepairDTO {
  return {
    id: row.id,
    product_id: productId,
    title: row.title,
    location: row.location,
    thumbnail_url: thumbnailUrl,
    source: row.source,
    status: row.status,
    condition_tags: row.condition_tags ?? [],
    receipt_no: repairReceiptNo(row),
    ai_image_url: row.ai_image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ------------------------------------------------------------
// profiles
// ------------------------------------------------------------

export interface ProfileRow {
  id: string;
  nickname: string | null;
  birthday: string | null;
  travel_style: string[] | null;
  onboarding_completed: boolean;
  membership: "SILVER" | "GOLD" | "PLATINUM";
  cleaning_coupons: number;
  repair_vouchers: number;
}

export interface ProfileDTO {
  id: string;
  nickname: string | null;
  birthday: string | null;
  lifestyle_chips: string[];
  onboarding_completed: boolean;
  membership: "SILVER" | "GOLD" | "PLATINUM";
  cleaning_coupons: number;
  repair_vouchers: number;
}

export function toProfileDTO(row: ProfileRow): ProfileDTO {
  return {
    id: row.id,
    nickname: row.nickname,
    birthday: row.birthday,
    lifestyle_chips: row.travel_style ?? [],
    onboarding_completed: row.onboarding_completed,
    membership: row.membership,
    cleaning_coupons: row.cleaning_coupons,
    repair_vouchers: row.repair_vouchers,
  };
}

// ------------------------------------------------------------
// ownership_transfers
// ------------------------------------------------------------

export interface TransferRow {
  id: string;
  product_unit_id: string;
  from_user_id: string;
  to_email: string;
  status: string;
  created_at: string;
}

export interface TransferDTO {
  id: string;
  product_id: string;
  from_user_id: string;
  to_email: string;
  direction: "sent" | "received";
  status: string;
  created_at: string;
}

export function toTransferDTO(
  row: TransferRow,
  currentUserId: string,
  productId = row.product_unit_id,
): TransferDTO {
  return {
    id: row.id,
    product_id: productId,
    from_user_id: row.from_user_id,
    to_email: row.to_email,
    direction: row.from_user_id === currentUserId ? "sent" : "received",
    status: row.status,
    created_at: row.created_at,
  };
}

// ------------------------------------------------------------
// stories
// ------------------------------------------------------------

export interface StoryRow {
  id: string;
  user_id: string;
  tag: string | null;
  photo_url: string | null;
  photo_path: string | null;
  location: string | null;
  memo: string | null;
  story: string | null;
  occasion: string[] | null;
  companion: string | null;
  city: string | null;
  country: string | null;
  story_date: string;
  created_at: string;
  updated_at: string;
}

export interface StoryDTO {
  id: string;
  product_id: string;
  image_url: string;
  tag: string;
  place: string;
  memo: string;
  story?: string;
  /** 집계 가능한 상황 축 — tag/place(자유 텍스트)와 별개 */
  occasion: OccasionId[];
  companion?: CompanionId;
  city?: string;
  country?: string;
  product_ids: string[];
  created_at: string;
  updated_at: string;
}

/**
 * story_products에서 조회한 이 story에 연결된 product_unit_id 목록을 같이 받아서 DTO로 변환.
 * product_id(단수)는 mock-db 호환을 위해 첫 번째 연결 제품으로 채움.
 */
export function toStoryDTO(
  row: StoryRow,
  productIds: string[],
  imageUrl = row.photo_url ?? "",
): StoryDTO {
  return {
    id: row.id,
    product_id: productIds[0] ?? "",
    image_url: imageUrl,
    tag: row.tag ?? "",
    place: row.location ?? "",
    memo: row.memo ?? "",
    story: row.story ?? undefined,
    occasion: (row.occasion ?? []) as OccasionId[],
    companion: (row.companion ?? undefined) as CompanionId | undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    product_ids: productIds,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

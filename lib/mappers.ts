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
  ai_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function toRepairDTO(row: RepairRow): RepairDTO {
  return {
    id: row.id,
    product_id: row.product_unit_id,
    title: row.title,
    location: row.location,
    thumbnail_url: row.thumbnail_url,
    source: row.source,
    status: row.status,
    condition_tags: row.condition_tags ?? [],
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

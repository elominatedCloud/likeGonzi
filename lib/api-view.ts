import { IMG } from "@/lib/images";
import type { ProductDTO, RepairDTO } from "@/lib/mappers";
import type { Product, RepairRecord } from "@/types";
import type { StoryRecord } from "@/types/story-api";

/** GET /api/home 응답 (app/api/home/route.ts와 같은 모양) */
export interface HomeData {
  user: {
    id: string;
    display_name: string | null;
    membership: "SILVER" | "GOLD" | "PLATINUM";
    lifestyle_chips: string[];
  };
  products: ProductDTO[];
  care_reminder: {
    season: string;
    material: string | null;
    title: string;
    detail: string;
    ventilation: number;
    product_id: string;
  } | null;
  benefit: {
    tier: string;
    title: string;
    detail: string;
    d_day: number | null;
    cleaning_coupons: number;
  };
  lifestyle_suggestions: { chips: string[] };
}

/** API의 snake_case DTO를 화면이 쓰던 camelCase Product로 변환한다. */
export function toProductView(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    serial: dto.serial,
    registeredAt: dto.registered_at.slice(0, 10).replaceAll("-", "."),
    store: dto.store ?? "",
    material: dto.material ?? "",
    color: dto.color ?? "",
    year: dto.year ?? 0,
    cutoutImage: dto.cutout_image ?? IMG.fallback,
    lifestyleImages: dto.lifestyle_images,
    careScore: dto.care_score,
    repairVouchers: dto.repair_vouchers,
    cleaningVouchers: dto.cleaning_vouchers,
    isFavorite: dto.is_favorite,
  };
}

/** GET /api/products/{id} 응답 */
export interface ProductDetailData extends ProductDTO {
  /** FE 라우팅(/products/{slug}, /log/{slug})용 제품 slug */
  slug: string;
  is_registered_to_user: boolean;
  authenticity: string;
  recent_activity: {
    stories: StoryRecord[];
    repairs: RepairDTO[];
  };
}

/** 제품 상세 화면은 slug로 링크를 만들기 때문에 id를 slug로 바꿔 넘긴다. */
export function toProductDetailView(dto: ProductDetailData): Product {
  return { ...toProductView(dto), id: dto.slug };
}

export function toRepairView(dto: RepairDTO): RepairRecord {
  return {
    id: dto.id,
    productId: dto.product_id,
    date: dto.created_at.slice(0, 10).replaceAll("-", "."),
    title: dto.title ?? "수선 접수",
    location: dto.location ?? "",
    thumbnail: dto.thumbnail_url ?? IMG.fallback,
    source: dto.source === "store" ? "store" : "ai_custom",
  };
}

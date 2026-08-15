export type MembershipTier = "SILVER" | "GOLD" | "PLATINUM";

export type LifestyleChip =
  | "도시 여행"
  | "아트 워크"
  | "주말 산책"
  | "출장"
  | "자연"
  | "전시·미술관"
  | "페스티벌"
  | "캠핑";

export interface UserProfile {
  id: string;
  name: string;
  membership: MembershipTier;
  birthday: string;
  lifestyleChips: LifestyleChip[];
  cleaningCoupons: number;
  repairVouchers: number;
}

export interface Product {
  id: string;
  name: string;
  serial: string;
  registeredAt: string;
  store: string;
  material: string;
  color: string;
  year: number;
  cutoutImage: string;
  lifestyleImages: string[];
  careScore: number;
  repairVouchers: number;
  cleaningVouchers: number;
  isFavorite?: boolean;
}

export interface Story {
  id: string;
  productId: string;
  tag: string;
  count: number;
  image: string;
  date: string;
}

export interface RepairRecord {
  id: string;
  productId: string;
  date: string;
  title: string;
  location: string;
  thumbnail: string;
  source: "store" | "ai_custom";
  foundAt?: string;
}

export interface ClinicTip {
  id: string;
  title: string;
  description: string;
  icon: "cloth" | "detergent" | "sun" | "moisture";
}

export interface CareReminder {
  season: string;
  title: string;
  detail: string;
  ventilation: number;
}

export interface BenefitCard {
  tier: MembershipTier;
  title: string;
  detail: string;
  dDay: number;
}

export interface EsgHighlight {
  label: string;
  title: string;
  description: string;
}

/**
 * 수선 진행 상태.
 * 접수 → 견적 완료 → 진행 확정(결제) → 수선 중 → 완료
 */
export type RepairStatus =
  | "submitted"
  | "quoted"
  | "paid"
  | "in_progress"
  | "completed"
  | "cancelled";

export const AREA_TAGS = [
  { id: "handle", label: "손잡이" },
  { id: "strap", label: "스트랩" },
  { id: "zipper", label: "지퍼" },
  { id: "corner", label: "모서리" },
  { id: "leather", label: "가죽 표면" },
  { id: "other", label: "기타" },
] as const;

export const CONDITION_TYPES = [
  { id: "wear", label: "마모" },
  { id: "stain", label: "오염" },
  { id: "scratch", label: "스크래치" },
  { id: "tear", label: "찢어짐" },
] as const;

/**
 * 이미지 기준 % 좌표. 수선 접수·이력·집계 화면이 이 한 벌을 공유한다.
 * 접수에서 누른 자리가 이력의 핀 자리이고, 집계 히트맵이 뜨거워지는 자리다.
 */
export type AreaBox = { id: string; x: number; y: number; w: number; h: number };

// ponytail: 제품별 좌표를 코드에 둔다. 데모 제품이 3종뿐이라 DB 컬럼이 과하다.
// 제품이 늘면 products.area_boxes jsonb 로 옮기고 이 맵은 폴백으로 남긴다.
const AREA_BOX_SETS: Record<string, AreaBox[]> = {
  // 좌표는 "정사각 프레임에 object-contain 된 제품 실사" 기준 %다.
  // AreaBoxPicker가 이미지와 박스를 같은 정사각 좌표계에 올리므로 그대로 맞는다.

  // Stark Backpack 정면 (public/camera/stark-product.png) 실측
  default: [
    { id: "handle", x: 43, y: 18, w: 15, h: 9 },   // 상단 손잡이 루프
    { id: "strap", x: 24, y: 62, w: 6, h: 7 },     // 측면 스트랩 연결부(스터드)
    { id: "zipper", x: 31, y: 63, w: 38, h: 5 },   // 앞주머니 지퍼
    { id: "leather", x: 34, y: 38, w: 31, h: 20 }, // 본체 가죽면
    { id: "corner", x: 25, y: 80, w: 12, h: 9 },   // 좌하단 모서리
  ],

  // 지갑·소품 — 스트랩과 손잡이가 없다.
  // ponytail: 실사 확보 전 추정치. pina 이미지 나오면 실측으로 교체할 것.
  wallet: [
    { id: "zipper", x: 14, y: 26, w: 72, h: 10 },
    { id: "leather", x: 22, y: 44, w: 56, h: 26 },
    { id: "corner", x: 68, y: 72, w: 16, h: 14 },
  ],
};

/** 이미지 위에 찍을 수 없는 부위. 그림 아래 칩으로 남긴다. */
export const UNPLACED_AREA_IDS: readonly string[] = ["other"];

/** 제품 키(slug/id)로 좌표 한 벌을 고른다. 못 찾으면 default. */
export function getAreaBoxes(productKey?: string): AreaBox[] {
  if (!productKey) return AREA_BOX_SETS.default;
  const key = productKey.toLowerCase();
  if (key.includes("wallet") || key.includes("pina")) return AREA_BOX_SETS.wallet;
  return AREA_BOX_SETS.default;
}

/** 좌표가 있는 부위인지. 없으면 칩으로 고르게 한다. */
export function isPlacedArea(areaId: string, productKey?: string): boolean {
  return getAreaBoxes(productKey).some((b) => b.id === areaId);
}

/** @deprecated use AREA_TAGS + CONDITION_TYPES */
export const CONDITION_TAGS = [...AREA_TAGS, ...CONDITION_TYPES];

export const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "received", label: "접수 완료" },
  { key: "inspecting", label: "제품 확인 중" },
  { key: "in_progress", label: "수선 진행 중" },
  { key: "completed", label: "수선 완료" },
];

export function listBadge(status: RepairStatus) {
  switch (status) {
    case "submitted":
      return "제품 확인 중";
    case "quoted":
      return "견적 확인 필요";
    case "paid":
      return "진행 확정";
    case "in_progress":
      return "수선 진행 중";
    case "completed":
      return "수선 완료";
    case "cancelled":
      return "취소";
  }
}

export function statusTone(status: RepairStatus) {
  switch (status) {
    case "submitted":
      return "bg-[#f4eadb] text-cognac";
    case "quoted":
      return "bg-[#fff4d8] text-cognac-deep";
    case "paid":
      return "bg-[#eef6ea] text-[#3d6b3a]";
    case "in_progress":
      return "bg-ink text-white";
    case "completed":
      return "bg-[#eef6ea] text-[#3d6b3a]";
    case "cancelled":
      return "bg-[#f8ecec] text-[#8a3a3a]";
  }
}

/** 0 접수완료, 1 제품확인, 2 수선진행, 3 완료 — current step index */
export function currentStep(status: RepairStatus) {
  switch (status) {
    case "submitted":
      return 1;
    case "quoted":
    case "paid":
      return 1;
    case "in_progress":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
}

export function areaLabel(id: string) {
  return AREA_TAGS.find((t) => t.id === id)?.label ?? id;
}

export function conditionLabel(id: string) {
  return CONDITION_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function tagLabel(id: string) {
  return areaLabel(id) !== id ? areaLabel(id) : conditionLabel(id);
}

export function areaFromTags(tags: string[]) {
  return tags.filter((t) => AREA_TAGS.some((a) => a.id === t));
}

export function formatDate(iso: string) {
  return iso.slice(0, 10).replaceAll("-", ".");
}

export function toUiProductId(id: string) {
  const map: Record<string, string> = {
    stark: "stark-backpack",
    ella: "ella-boston",
  };
  return map[id] ?? id;
}

export function productDisplayName(id: string) {
  const map: Record<string, string> = {
    stark: "Stark Backpack",
    ella: "Ella Boston Bag",
    pina: "Pina Studded Wallet",
    "stark-backpack": "Stark Backpack",
    "ella-boston": "Ella Boston Bag",
  };
  return map[id] ?? id;
}

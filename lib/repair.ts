import type { RepairStatus } from "@/lib/mock-db";

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

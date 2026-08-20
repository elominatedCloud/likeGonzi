// node --test가 "@/" alias를 풀지 못해 상대 경로를 쓴다.
import { AREA_TAGS, CONDITION_TYPES } from "./repair.ts";

/**
 * 수선 견적 기준표.
 *
 * 금액을 AI가 만들게 하면 안 된다 — 모델은 그럴듯한 숫자를 지어내고,
 * 고객에게 보여주는 금액은 근거가 있어야 한다.
 * 그래서 금액·기간은 이 표에서 계산하고, AI는 "왜 이 범위인지" 설명만 쓴다.
 *
 * 아래 값은 실제 MCM 수선 단가가 아니라 데모 기준이다.
 * 실제 운영에서는 매장 단가표로 교체해야 한다.
 */
interface Band {
  min: number;
  max: number;
  days: number;
}

const AREA_BAND: Record<string, Band> = {
  handle: { min: 60000, max: 120000, days: 14 },
  strap: { min: 50000, max: 100000, days: 12 },
  zipper: { min: 40000, max: 80000, days: 10 },
  corner: { min: 70000, max: 140000, days: 16 },
  leather: { min: 80000, max: 160000, days: 18 },
  other: { min: 40000, max: 150000, days: 14 },
};

/** 증상에 따른 배수. 찢어짐이 가장 크고 오염이 가장 작다. */
const CONDITION_FACTOR: Record<string, number> = {
  stain: 0.7,
  wear: 1,
  scratch: 1.1,
  tear: 1.5,
};

export interface RepairEstimate {
  min: number;
  max: number;
  days: number;
  areaLabel: string;
  conditionLabel: string;
}

const AREA_LABEL = new Map<string, string>(AREA_TAGS.map((tag) => [tag.id, tag.label]));
const CONDITION_LABEL = new Map<string, string>(
  CONDITION_TYPES.map((tag) => [tag.id, tag.label]),
);

/** 1000원 단위로 올림 — 견적서에 端수가 남으면 계산된 것처럼 안 보인다. */
function round(value: number) {
  return Math.ceil(value / 1000) * 1000;
}

export function estimateRepair(conditionTags: string[] | null): RepairEstimate {
  const tags = conditionTags ?? [];
  const area = tags.find((tag) => AREA_BAND[tag]) ?? "other";
  const condition = tags.find((tag) => CONDITION_FACTOR[tag]) ?? "wear";

  const band = AREA_BAND[area];
  const factor = CONDITION_FACTOR[condition];

  return {
    min: round(band.min * factor),
    max: round(band.max * factor),
    days: Math.round(band.days * (factor > 1 ? factor : 1)),
    areaLabel: AREA_LABEL.get(area) ?? "기타",
    conditionLabel: CONDITION_LABEL.get(condition) ?? "마모",
  };
}

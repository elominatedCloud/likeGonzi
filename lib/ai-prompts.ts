import { generateText } from "@/lib/ai";

export interface StorySeed {
  productName: string;
  tag: string;
  place?: string | null;
  memo?: string | null;
  date: string;
}

export interface RecapSeed {
  productName: string;
  store?: string | null;
  year?: number | null;
  ownerNickname?: string | null;
  stories: { tag: string; place?: string | null; memo?: string | null; date: string }[];
  repairs: { title: string; date: string }[];
}

const NO_INVENTION = [
  "사용자가 적지 않은 사실(장소, 동행자, 날씨, 감정, 소감)을 지어내지 마세요.",
  "제품을 칭찬하거나 평가하지 마세요. 디자인·품질·실용성에 대한 감상은 금지입니다.",
  "권유·응원·마케팅 문구를 덧붙이지 마세요.",
  "주어진 사실만 자연스러운 문장으로 연결합니다. 재료가 적으면 짧게 끝내세요.",
  "총평이나 마무리 감상으로 끝내지 마세요. 마지막 사실에서 문장을 끝냅니다.",
].join(" ");

/**
 * 기록 한 건을 짧은 이야기 문단으로 다듬는다. 실패하면 null.
 *
 * 장소·메모가 둘 다 없으면 AI를 부르지 않는다. 태그와 날짜만으로는
 * 쓸 내용이 없어서 모델이 제품 칭찬을 지어내기 때문.
 */
export function generateStory(seed: StorySeed) {
  if (!seed.place?.trim() && !seed.memo?.trim()) return Promise.resolve(null);

  const facts = [
    `제품: ${seed.productName}`,
    `태그: ${seed.tag}`,
    seed.place ? `장소: ${seed.place}` : null,
    seed.memo ? `메모: ${seed.memo}` : null,
    `날짜: ${seed.date}`,
  ]
    .filter(Boolean)
    .join("\n");

  return generateText(
    `당신은 MCM 제품과 함께한 순간을 한국어 짧은 글로 정리하는 편집자입니다. ` +
      `담백하고 과장 없는 존댓말, 이모지는 쓰지 않습니다. ` +
      // 길이를 재료에 맞춘다. 재료가 한 줄인데 여러 문장을 요구하면 모델이 빈칸을 지어낸다.
      `분량은 주어진 재료만큼만 씁니다. 메모가 없으면 한 문장으로 끝내고, ` +
      `어떤 경우에도 두 문장을 넘기지 않습니다. ${NO_INVENTION}`,
    facts,
    300,
  );
}

/**
 * 제품에 쌓인 기록·수선을 하나의 Recap으로 요약한다. 실패하면 null.
 *
 * 기록도 수선도 없으면 AI를 부르지 않는다 — 요약할 재료가 없으면
 * 모델이 광고 문구를 만들어낸다. 호출부의 기본 문구로 폴백된다.
 */
export function generateRecap(seed: RecapSeed) {
  if (seed.stories.length === 0 && seed.repairs.length === 0) {
    return Promise.resolve(null);
  }

  const storyLines = seed.stories.map(
    (story) =>
      `- ${story.date} · ${story.tag}` +
      (story.place ? ` · ${story.place}` : "") +
      (story.memo ? ` · ${story.memo}` : ""),
  );
  const repairLines = seed.repairs.map((repair) => `- ${repair.date} · ${repair.title}`);

  const facts = [
    `제품: ${seed.productName}`,
    seed.store ? `구매 매장: ${seed.store}` : null,
    seed.year ? `연식: ${seed.year}` : null,
    "",
    `기록 ${seed.stories.length}건`,
    ...storyLines,
    "",
    `수선 ${seed.repairs.length}건`,
    ...repairLines,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return generateText(
    `당신은 MCM Storybook의 Recap 작가입니다. 사용자가 제품과 함께 보낸 시간을 ` +
      `한국어 존댓말로 회고합니다. 기록이 1~2건이면 2문장, 많으면 최대 5문장. ` +
      `관리·수선 이력이 있으면 사실만 자연스럽게 엮습니다. ${NO_INVENTION}`,
    facts,
    500,
  );
}

export interface RemadeSeed {
  productName: string;
  material: string;
  color: string;
  /** 사람이 읽는 부위명 — 손잡이 / 스트랩 / 지퍼 / 모서리 / 가죽 표면 */
  areaLabel: string;
  /** 사람이 읽는 증상명 — 마모 / 오염 / 스크래치 / 찢어짐 */
  conditionLabel: string;
}

/**
 * REMADE 시안 프롬프트.
 *
 * 손상을 지우는 게 아니라 그 자리에 얹을 장식을 그리게 한다.
 * 브랜드 모노그램을 그대로 복제하지 않고 기하 모티프(마름모·월계)에서
 * 출발하도록 유도한다.
 */
export function remadePrompt(seed: RemadeSeed) {
  return [
    `A close-up product photograph of a decorative repair applied to a luxury`,
    `${seed.color} ${seed.material} bag, on the ${seed.areaLabel} area where`,
    `${seed.conditionLabel} damage occurred.`,
    `The damage is not hidden — it is deliberately framed and celebrated,`,
    `in the spirit of kintsugi: the mended area is the focal point.`,
    `Hand embroidery and a leather patch, geometric lozenge and laurel motifs,`,
    `cognac and warm gold thread. Artisanal, restrained, no logos, no text.`,
    `Soft directional studio light, shallow depth of field, neutral background.`,
  ].join(" ");
}

/**
 * 견적 설명문. 금액은 여기서 만들지 않는다 —
 * 기준표(lib/repair-estimate.ts)에서 계산한 값을 받아 "왜 이 범위인지"만 쓴다.
 * 모델이 숫자를 지어내면 고객에게 근거 없는 금액을 보여주게 된다.
 */
export function generateEstimateNote(seed: {
  productName: string;
  areaLabel: string;
  conditionLabel: string;
  min: number;
  max: number;
  days: number;
}) {
  return generateText(
    `당신은 MCM 수선 접수 담당자입니다. 고객에게 견적 범위를 설명합니다. ` +
      `2~3문장의 한국어 존댓말. 금액과 기간은 주어진 값만 쓰고 다른 숫자를 만들지 마세요. ` +
      `실물 확인 후 최종 확정된다는 점을 반드시 포함하세요. ` +
      `과장, 홍보 문구, 사과는 넣지 마세요.`,
    [
      `제품: ${seed.productName}`,
      `수선 부위: ${seed.areaLabel}`,
      `증상: ${seed.conditionLabel}`,
      `예상 비용: ${seed.min.toLocaleString()}원 ~ ${seed.max.toLocaleString()}원`,
      `예상 소요: 약 ${seed.days}일`,
    ].join("\n"),
    300,
  );
}

import type { CreateStoryBody, StoryRecord, UpdateStoryBody } from "@/types/story-api";

const A = "/FE-namjun/assets";

/** 멋사 명세 검수용 시드 데이터 (남준 FE 상품 id 기준) */
const seedStories: StoryRecord[] = [
  {
    id: "seongsu-inspiration",
    product_id: "stark",
    image_url: `${A}/로그_타임라인-2.png`,
    tag: "성수에서 만난 새로운 영감",
    place: "서울 성수동",
    memo: "전시를 보고 카페에 들른 여유로운 날.\n#성수 #전시 #Backpack",
    story:
      "오래 함께한 가방 덕분에 익숙한 하루도 조금 더 특별한 장면으로 남았다.",
    product_ids: ["stark"],
    created_at: "2025-05-09T10:00:00.000Z",
    updated_at: "2025-05-09T10:00:00.000Z",
  },
  {
    id: "paris-trip",
    product_id: "stark",
    image_url: `${A}/로그_타임라인-3.png`,
    tag: "파리 여행",
    place: "프랑스 파리",
    memo: "첫 여름 휴가, 가방과 함께한 파리.\n#여름휴가 #파리",
    story:
      "낯선 거리에서 함께한 가방은 여행의 순간마다 익숙한 리듬을 만들어 주었다.",
    product_ids: ["stark"],
    created_at: "2025-08-16T10:00:00.000Z",
    updated_at: "2025-08-16T10:00:00.000Z",
  },
  {
    id: "jazz-evening",
    product_id: "ella",
    image_url: `${A}/ella-jazz-memory.png`,
    tag: "재즈 선율과 함께한 저녁",
    place: "서울 한남동",
    memo: "작은 공연장에서 만난 깊은 선율.\n#재즈 #한남 #Evening",
    story:
      "잔잔한 선율과 검정 가방의 빛이 저녁의 기억을 오래 붙잡아 주었다.",
    product_ids: ["ella"],
    created_at: "2026-01-17T10:00:00.000Z",
    updated_at: "2026-01-17T10:00:00.000Z",
  },
  {
    id: "spring-gallery",
    product_id: "ella",
    image_url: `${A}/ella-ai-concert.png`,
    tag: "봄날의 갤러리 오프닝",
    place: "서울 청담동",
    memo: "검정 가방이 크림 수트의 포인트가 된 날.\n#Gallery #Spring",
    story:
      "새 작품을 처음 마주한 설렘과 검정 보스턴백의 단정한 실루엣이 봄 저녁을 완성했다.",
    product_ids: ["ella"],
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z",
  },
  {
    id: "bookstore-afternoon",
    product_id: "pina",
    image_url: `${A}/pina-bookstore-memory.png`,
    tag: "책갈피 사이에 남은 오후",
    place: "서울 서촌",
    memo: "독립서점에서 발견한 한 권의 책.\n#서촌 #북카페 #Wallet",
    story:
      "책장을 넘기던 손끝과 작은 지갑이 고요한 오후의 온도를 기억한다.",
    product_ids: ["pina"],
    created_at: "2025-10-12T10:00:00.000Z",
    updated_at: "2025-10-12T10:00:00.000Z",
  },
  {
    id: "museum-postcard",
    product_id: "pina",
    image_url: `${A}/pina-ai-museum.png`,
    tag: "미술관에서 쓴 엽서",
    place: "서울 덕수궁길",
    memo: "전시의 여운을 짧은 문장으로 남긴 날.\n#미술관 #엽서",
    story:
      "전시의 여운을 엽서에 적는 동안 작은 지갑은 조용히 그날의 시간을 지켜보았다.",
    product_ids: ["pina"],
    created_at: "2026-08-04T10:00:00.000Z",
    updated_at: "2026-08-04T10:00:00.000Z",
  },
];

const globalStore = globalThis as typeof globalThis & {
  __likegonziStories?: StoryRecord[];
};

function store(): StoryRecord[] {
  if (!globalStore.__likegonziStories) {
    globalStore.__likegonziStories = structuredClone(seedStories);
  }
  return globalStore.__likegonziStories;
}

export function listStories(productId: string): StoryRecord[] {
  return store()
    .filter(
      (s) =>
        s.product_id === productId ||
        s.product_ids?.includes(productId),
    )
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getStory(
  productId: string,
  storyId: string,
): StoryRecord | null {
  return (
    store().find(
      (s) =>
        s.id === storyId &&
        (s.product_id === productId || s.product_ids?.includes(productId)),
    ) ?? null
  );
}

export function createStory(
  productId: string,
  body: CreateStoryBody,
): StoryRecord {
  const now = body.date
    ? new Date(body.date).toISOString()
    : new Date().toISOString();
  const record: StoryRecord = {
    id: `story-${Date.now()}`,
    product_id: productId,
    image_url: body.image_url ?? body.photo_path ?? "",
    photo_path: body.photo_path,
    tag: body.tag,
    place: body.place ?? "",
    memo: body.memo ?? "",
    story: body.story,
    product_ids: body.product_ids?.length
      ? body.product_ids
      : [productId],
    created_at: now,
    updated_at: now,
  };
  store().unshift(record);
  return record;
}

export function updateStory(
  productId: string,
  storyId: string,
  body: UpdateStoryBody,
): StoryRecord | null {
  const target = getStory(productId, storyId);
  if (!target) return null;

  if (body.image_url !== undefined) target.image_url = body.image_url;
  if (body.photo_path !== undefined) target.photo_path = body.photo_path;
  if (body.tag !== undefined) target.tag = body.tag;
  if (body.place !== undefined) target.place = body.place;
  if (body.memo !== undefined) target.memo = body.memo;
  if (body.story !== undefined) target.story = body.story;
  if (body.product_ids !== undefined) target.product_ids = body.product_ids;
  target.updated_at = new Date().toISOString();
  return target;
}

export function deleteStory(productId: string, storyId: string): boolean {
  const list = store();
  const index = list.findIndex(
    (s) =>
      s.id === storyId &&
      (s.product_id === productId || s.product_ids?.includes(productId)),
  );
  if (index < 0) return false;
  list.splice(index, 1);
  return true;
}

export const KNOWN_PRODUCT_IDS = [
  "stark",
  "ella",
  "pina",
  "stark-backpack",
  "ella-boston",
] as const;

export function isKnownProduct(productId: string) {
  return (KNOWN_PRODUCT_IDS as readonly string[]).includes(productId);
}

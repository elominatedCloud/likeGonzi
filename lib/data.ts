import type {
  BenefitCard,
  CareReminder,
  ClinicTip,
  EsgHighlight,
  Product,
  RepairRecord,
  Story,
  UserProfile,
} from "@/types";

export const currentUser: UserProfile = {
  id: "user-gonji",
  name: "곤지",
  membership: "GOLD",
  birthday: "1996-09-02",
  lifestyleChips: ["출장", "도시 여행", "아트 워크", "주말 산책"],
  cleaningCoupons: 1,
  repairVouchers: 1,
};

export const products: Product[] = [
  {
    id: "stark-backpack",
    name: "Stark Backpack",
    serial: "MWKCSVE01C0001",
    registeredAt: "2024.05.12",
    store: "MCM Seoul",
    material: "Visetos",
    color: "Cognac",
    year: 2024,
    cutoutImage: "/camera/stark-product.png",
    lifestyleImages: [
      "/FE-namjun/assets/로그_타임라인-1.png",
      "/FE-namjun/assets/로그_타임라인-2.png",
      "/FE-namjun/assets/로그_타임라인-3.png",
    ],
    careScore: 92,
    repairVouchers: 1,
    cleaningVouchers: 1,
    isFavorite: true,
  },
  {
    id: "ella-boston",
    name: "Ella Boston Bag",
    serial: "MWEBSVE01B0002",
    registeredAt: "2023.11.08",
    store: "MCM Gangnam",
    material: "Visetos leather / gold hardware",
    color: "Black",
    year: 2023,
    cutoutImage: "/FE-namjun/assets/로그_스토리북-3.png",
    lifestyleImages: [
      "/FE-namjun/assets/ella-jazz-memory.png",
    ],
    careScore: 88,
    repairVouchers: 0,
    cleaningVouchers: 1,
  },
];

export const stories: Story[] = [
  {
    id: "story-1",
    productId: "stark-backpack",
    tag: "출근",
    count: 2,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
    date: "2026.07.18",
  },
  {
    id: "story-2",
    productId: "stark-backpack",
    tag: "기념일",
    count: 3,
    image:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=700&q=80",
    date: "2026.06.02",
  },
];

export const repairRecords: RepairRecord[] = [
  {
    id: "repair-1",
    productId: "stark-backpack",
    date: "2026.05.12",
    title: "오른쪽 숄더 스트랩 교체",
    location: "강남 플래그십 스토어",
    thumbnail:
      "https://images.unsplash.com/photo-1590874103328-eac38a67478a?auto=format&fit=crop&w=300&q=80",
    source: "store",
  },
  {
    id: "repair-2",
    productId: "stark-backpack",
    date: "2026.03.20",
    title: "비세토스 로고 패널 클리닝",
    location: "MCM Care Studio",
    thumbnail:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=300&q=80",
    source: "store",
  },
  {
    id: "repair-3",
    productId: "stark-backpack",
    date: "2025.11.04",
    title: "지퍼 슬라이더 교체",
    location: "강남 플래그십 스토어",
    thumbnail:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80",
    source: "store",
  },
  {
    id: "repair-4",
    productId: "stark-backpack",
    date: "2026.06.01",
    title: "오른쪽 숄더 스트랩 보강",
    location: "AI 커스텀 진단",
    thumbnail: "/camera/care-stark.png",
    source: "ai_custom",
    foundAt: "2026.06",
  },
];

export const clinicTips: ClinicTip[] = [
  {
    id: "tip-1",
    title: "부드러운 천으로 먼지 제거",
    description: "마른 극세사 천으로 비세토스 표면을 살살 닦아주세요.",
    icon: "cloth",
  },
  {
    id: "tip-2",
    title: "오염 시 중성 세제 사용",
    description: "물기를 짠 천에 중성 세제를 살짝 묻혀 부분 클리닝하세요.",
    icon: "detergent",
  },
  {
    id: "tip-3",
    title: "직사광선 피하기",
    description: "가죽 트림 변색을 막기 위해 그늘진 곳에 보관하세요.",
    icon: "sun",
  },
  {
    id: "tip-4",
    title: "습기 주의",
    description: "장마철엔 통풍과 제습으로 코팅 캔버스 수분을 관리하세요.",
    icon: "moisture",
  },
];

export const careReminder: CareReminder = {
  season: "MONSOON",
  title: "비세토스 캔버스, 습도 케어가 필요해요",
  detail: "통풍 40% · 보관 가이드 보기",
  ventilation: 40,
};

export const benefitCard: BenefitCard = {
  tier: "GOLD",
  title: "생일 혜택이 곧 도착해요",
  detail: "클리닝 쿠폰 1 · 등급 혜택 보기",
  dDay: 12,
};

export const esgHighlights: EsgHighlight[] = [
  {
    label: "VISION 2030",
    title: "오래 쓰는 럭셔리가 곧 ESG",
    description:
      "수선·클리닝·소유권 이전으로 제품 수명을 늘려 MCM의 순환 가치를 실천해요.",
  },
  {
    label: "CIRCULAR CARE",
    title: "LWG 가죽 · 수리 우선",
    description:
      "새 구매 대신 케어와 수선으로 합리적인 럭셔리 아카이브를 이어가세요.",
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id) ?? products[0];
}

export function getStoriesByProduct(productId: string) {
  return stories.filter((s) => s.productId === productId);
}

export function getRepairsByProduct(productId: string) {
  return repairRecords.filter((r) => r.productId === productId);
}

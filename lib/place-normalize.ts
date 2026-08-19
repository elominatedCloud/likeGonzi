/**
 * 장소 원문에서 도시/국가를 뽑는다.
 *
 * 지오코딩 API를 붙이지 않는다 — 데모에 필요한 건 집계 가능한 축이지 좌표가 아니고,
 * 외부 호출은 비용·지연·키 관리를 새로 만든다.
 * 아래 표에 없는 장소는 city/country를 비워 두고 원문(location)만 남긴다.
 */

interface CityEntry {
  city: string;
  country: string; // ISO 3166-1 alpha-2
  /** 원문에서 이 중 하나라도 보이면 매칭 */
  aliases: string[];
}

const CITIES: CityEntry[] = [
  { city: "서울", country: "KR", aliases: ["서울", "성수", "한남", "강남", "홍대", "이태원", "seoul"] },
  { city: "부산", country: "KR", aliases: ["부산", "해운대", "busan"] },
  { city: "제주", country: "KR", aliases: ["제주", "jeju"] },
  { city: "도쿄", country: "JP", aliases: ["도쿄", "동경", "시부야", "신주쿠", "tokyo"] },
  { city: "오사카", country: "JP", aliases: ["오사카", "osaka"] },
  { city: "후쿠오카", country: "JP", aliases: ["후쿠오카", "fukuoka"] },
  { city: "파리", country: "FR", aliases: ["파리", "paris"] },
  { city: "밀라노", country: "IT", aliases: ["밀라노", "milan", "milano"] },
  { city: "뮌헨", country: "DE", aliases: ["뮌헨", "munich", "münchen"] },
  { city: "베를린", country: "DE", aliases: ["베를린", "berlin"] },
  { city: "런던", country: "GB", aliases: ["런던", "london"] },
  { city: "뉴욕", country: "US", aliases: ["뉴욕", "new york", "브루클린", "맨해튼"] },
  { city: "로스앤젤레스", country: "US", aliases: ["로스앤젤레스", "la ", "los angeles"] },
  { city: "타이베이", country: "TW", aliases: ["타이베이", "대만", "taipei"] },
  { city: "싱가포르", country: "SG", aliases: ["싱가포르", "singapore"] },
  { city: "홍콩", country: "HK", aliases: ["홍콩", "hong kong"] },
];

export interface NormalizedPlace {
  city: string | null;
  country: string | null;
}

export function normalizePlace(raw?: string | null): NormalizedPlace {
  const text = (raw ?? "").trim().toLowerCase();
  if (!text) return { city: null, country: null };

  for (const entry of CITIES) {
    if (entry.aliases.some((alias) => text.includes(alias.trim().toLowerCase()))) {
      return { city: entry.city, country: entry.country };
    }
  }
  return { city: null, country: null };
}

/** 시드·문서용 도시 목록 */
export const KNOWN_CITIES = CITIES.map(({ city, country }) => ({ city, country }));

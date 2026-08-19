import { fail, ok } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import {
  toProductDTO,
  toProfileDTO,
  type MyProductRow,
  type ProfileRow,
} from "@/lib/mappers";

/** 다음 생일까지 남은 일수 (생일 미입력이면 null) */
function daysUntilBirthday(birthday: string | null) {
  if (!birthday) return null;
  const date = new Date(birthday);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
}

/** GET /api/home — 제품 그리드 + 케어 + 혜택 + 라이프스타일 통합 */
export async function GET(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const [profileResult, productsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("my_products_view")
      .select("*")
      .eq("user_id", user.id)
      .order("registered_at", { ascending: false }),
  ]);

  if (profileResult.error || productsResult.error) {
    console.error(
      "[home] query error",
      profileResult.error ?? productsResult.error,
    );
    return fail("QUERY_FAILED", "홈 데이터를 불러오지 못했습니다", 500);
  }
  if (!profileResult.data) {
    return fail("PROFILE_NOT_FOUND", "프로필이 없습니다", 404);
  }

  const profile = toProfileDTO(profileResult.data as ProfileRow);
  const products = ((productsResult.data as MyProductRow[] | null) ?? []).map(
    toProductDTO,
  );
  const primaryRow = (productsResult.data as MyProductRow[] | null)?.[0] ?? null;

  return ok({
    user: {
      id: profile.id,
      display_name: profile.nickname,
      membership: profile.membership,
      lifestyle_chips: profile.lifestyle_chips,
    },
    products,
    care_reminder: primaryRow
      ? {
          season: "MONSOON",
          material: primaryRow.material,
          title: `${primaryRow.material ?? "가죽"} 소재, 습도 케어가 필요해요`,
          detail: "통풍 40% · 보관 가이드 보기",
          ventilation: 40,
          product_id: primaryRow.id,
        }
      : null,
    benefit: {
      tier: profile.membership,
      title: "생일 혜택이 곧 도착해요",
      detail: `클리닝 쿠폰 ${profile.cleaning_coupons} · 등급 혜택 보기`,
      d_day: daysUntilBirthday(profile.birthday),
      cleaning_coupons: profile.cleaning_coupons,
    },
    lifestyle_suggestions: {
      chips: profile.lifestyle_chips.slice(0, 3),
      ai_storybook: {
        title: "서울의 7월, 영상으로 다시 만나기",
        cta: "PLAY",
      },
    },
    esg: {
      label: "VISION 2030",
      title: "오래 쓰는 럭셔리가 곧 ESG",
      description:
        "수선·클리닝·소유권 이전으로 제품 수명을 늘려 MCM의 순환 가치를 실천해요.",
    },
  });
}

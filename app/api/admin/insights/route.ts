import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * GET /api/admin/insights — 브랜드 집계 (슬라이드용 데이터 소스)
 *
 * 세 뷰 모두 개인 식별자를 반환하지 않고, 5건 미만 그룹은 제외되며(k-익명성),
 * analytics_consent = true 인 사용자만 집계된다. 뷰 본문에 is_admin() 조건이
 * 들어 있어 운영자가 아니면 애초에 빈 결과가 나온다.
 */
export async function GET(request: Request) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const [occasion, city, repair, consent] = await Promise.all([
    supabase.from("brand_occasion_usage").select("*").order("story_count", { ascending: false }),
    supabase.from("brand_city_usage").select("*").order("story_count", { ascending: false }),
    supabase.from("brand_repair_hotspots").select("*").order("repair_count", { ascending: false }),
    // profiles를 직접 세면 RLS 때문에 본인 1건만 잡힌다.
    // 집계 수치만 돌려주는 함수를 쓴다(개인정보를 열지 않기 위해).
    supabase.rpc("analytics_consent_stats"),
  ]);

  if (occasion.error || city.error || repair.error) {
    console.error(
      "[admin/insights] query error",
      occasion.error ?? city.error ?? repair.error,
    );
    return fail("QUERY_FAILED", "집계를 불러오지 못했습니다", 500);
  }

  const stats = (consent.data as { total: number; opted_in: number }[] | null)?.[0]
    ?? { total: 0, opted_in: 0 };

  return ok({
    occasion: occasion.data ?? [],
    city: city.data ?? [],
    repair: repair.data ?? [],
    // 집계에 몇 명이 참여 중인지. 표본이 작으면 수치를 그대로 믿으면 안 된다.
    consent: stats,
    // 화면에 근거를 같이 띄우기 위한 상수
    k_anonymity_threshold: 5,
  });
}

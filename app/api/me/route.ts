import { fail, ok, readJson } from "@/lib/api-response";
import { requireSupabaseUser } from "@/lib/auth-guard";
import { toProfileDTO, type ProfileRow } from "@/lib/mappers";

/** GET /api/me — 내 프로필 */
export async function GET(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const { data, error: qError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (qError) {
    console.error("[me] query error", qError);
    return fail("QUERY_FAILED", "프로필을 불러오지 못했습니다", 500);
  }
  if (!data) return fail("PROFILE_NOT_FOUND", "프로필이 없습니다", 404);

  const row = data as ProfileRow & {
    analytics_consent: boolean;
    analytics_consent_at: string | null;
  };
  return ok({
    ...toProfileDTO(row),
    email: user.email ?? null,
    analytics_consent: row.analytics_consent,
    analytics_consent_at: row.analytics_consent_at,
  });
}

/**
 * PATCH /api/me — 프로필 수정
 *
 * analytics_consent는 켜고 끄는 시각을 함께 기록한다.
 * (DB CHECK가 상태와 시각의 정합을 강제하므로 둘을 같이 써야 한다)
 */
export async function PATCH(request: Request) {
  const { user, supabase, error } = await requireSupabaseUser(request);
  if (error) return error;

  const body = await readJson<{
    nickname?: string;
    birthday?: string | null;
    lifestyle_chips?: string[];
    analytics_consent?: boolean;
    onboarding_completed?: boolean;
  }>(request);
  if (!body) return fail("INVALID_JSON", "Request body must be valid JSON");

  const patch: Record<string, unknown> = {};
  if (typeof body.nickname === "string") {
    const nickname = body.nickname.trim();
    if (!nickname) return fail("VALIDATION_ERROR", "닉네임을 입력해주세요");
    patch.nickname = nickname;
  }
  if (body.birthday !== undefined) patch.birthday = body.birthday || null;
  if (Array.isArray(body.lifestyle_chips)) patch.travel_style = body.lifestyle_chips;
  if (typeof body.onboarding_completed === "boolean") {
    patch.onboarding_completed = body.onboarding_completed;
  }
  if (typeof body.analytics_consent === "boolean") {
    patch.analytics_consent = body.analytics_consent;
    patch.analytics_consent_at = body.analytics_consent ? new Date().toISOString() : null;
  }

  if (Object.keys(patch).length === 0) {
    return fail("VALIDATION_ERROR", "변경할 항목이 없습니다");
  }

  const { data, error: upError } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .single();

  if (upError) {
    console.error("[me] update error", upError);
    return fail("UPDATE_FAILED", upError.message, 400);
  }

  const row = data as ProfileRow & {
    analytics_consent: boolean;
    analytics_consent_at: string | null;
  };
  return ok({
    ...toProfileDTO(row),
    email: user.email ?? null,
    analytics_consent: row.analytics_consent,
    analytics_consent_at: row.analytics_consent_at,
  });
}

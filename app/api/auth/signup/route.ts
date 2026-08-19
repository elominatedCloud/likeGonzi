import { fail, ok, readJson } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** POST /api/auth/signup — Supabase Auth 이메일 가입 (소셜은 추후) */
export async function POST(request: Request) {
  const body = await readJson<{
    email?: string;
    password?: string;
    nickname?: string;
    display_name?: string; // 구버전 FE 호환
    analytics_consent?: boolean;
  }>(request);

  const nickname = body?.nickname ?? body?.display_name;
  if (!body?.email || !body?.password || !nickname) {
    return fail(
      "VALIDATION_ERROR",
      "email, password, nickname(display_name) are required",
    );
  }

  const supabase = createSupabaseServerClient(request);
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    // handle_new_user() 트리거가 raw_user_meta_data->>'nickname' 을 읽어 profiles를 자동 생성함
    options: { data: { nickname } },
  });

  if (error) {
    const status = error.status === 422 ? 409 : 400;
    return fail(
      status === 409 ? "EMAIL_TAKEN" : "SIGNUP_FAILED",
      error.message,
      status,
    );
  }

  if (!data.session) {
    // Supabase 프로젝트에서 "Confirm email"이 켜져 있으면 가입 직후엔 세션이 없음
    return ok(
      {
        access_token: null,
        user: { id: data.user?.id, email: body.email },
        needs_email_confirmation: true,
      },
      201,
    );
  }

  // 선택 동의. handle_new_user 트리거가 만든 프로필에 이어서 반영한다.
  // 실패해도 가입 자체는 성공으로 둔다(동의는 마이 화면에서 다시 켤 수 있다).
  if (body.analytics_consent) {
    const { error: consentError } = await supabase
      .from("profiles")
      .update({
        analytics_consent: true,
        analytics_consent_at: new Date().toISOString(),
      })
      .eq("id", data.user!.id);
    if (consentError) {
      console.warn("[signup] consent update failed", consentError.message);
    }
  }

  return ok(
    {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: "Bearer",
      user: { id: data.user!.id, email: data.user!.email, nickname },
    },
    201,
  );
}

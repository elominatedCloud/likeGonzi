import { fail, ok, readJson } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** POST /api/auth/signup — Supabase Auth 이메일 가입 (소셜은 추후) */
export async function POST(request: Request) {
  const body = await readJson<{
    email?: string;
    password?: string;
    nickname?: string;
    display_name?: string; // 구버전 FE 호환
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

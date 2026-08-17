import { fail, ok, readJson } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toProfileDTO, type ProfileRow } from "@/lib/mappers";

/** POST /api/auth/login — Supabase Auth 로그인 */
export async function POST(request: Request) {
  const body = await readJson<{ email?: string; password?: string }>(request);
  if (!body?.email || !body?.password) {
    return fail("VALIDATION_ERROR", "email and password are required");
  }

  const supabase = createSupabaseServerClient(request);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session) {
    return fail(
      "INVALID_CREDENTIALS",
      "이메일 또는 비밀번호가 올바르지 않습니다",
      401,
    );
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return ok({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    token_type: "Bearer",
    user: {
      id: data.user.id,
      email: data.user.email,
      ...(profileRow ? toProfileDTO(profileRow as ProfileRow) : {}),
    },
  });
}

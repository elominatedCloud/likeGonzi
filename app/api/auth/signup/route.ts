import { fail, ok, readJson } from "@/lib/api-response";
import { createSession, createUser, publicUser } from "@/lib/mock-db";

/** POST /api/auth/signup — 이메일 가입 우선 (소셜은 추후) */
export async function POST(request: Request) {
  const body = await readJson<{
    email?: string;
    password?: string;
    display_name?: string;
    birthday?: string;
    lifestyle_chips?: string[];
  }>(request);

  if (!body?.email || !body?.password || !body?.display_name) {
    return fail(
      "VALIDATION_ERROR",
      "email, password, display_name are required",
    );
  }

  const user = createUser({
    email: body.email,
    password: body.password,
    display_name: body.display_name,
    birthday: body.birthday,
    lifestyle_chips: body.lifestyle_chips,
  });

  if (!user) {
    return fail("EMAIL_TAKEN", "이미 가입된 이메일입니다", 409);
  }

  const access_token = createSession(user.id);
  return ok(
    {
      access_token,
      token_type: "Bearer",
      user: publicUser(user),
    },
    201,
  );
}

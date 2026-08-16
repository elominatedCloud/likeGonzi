import { fail, ok, readJson } from "@/lib/api-response";
import {
  createSession,
  getUserByEmail,
  publicUser,
} from "@/lib/mock-db";

/** POST /api/auth/login */
export async function POST(request: Request) {
  const body = await readJson<{ email?: string; password?: string }>(request);
  if (!body?.email || !body?.password) {
    return fail("VALIDATION_ERROR", "email and password are required");
  }

  const user = getUserByEmail(body.email);
  if (!user || user.password !== body.password) {
    return fail("INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다", 401);
  }

  const access_token = createSession(user.id);
  return ok({
    access_token,
    token_type: "Bearer",
    user: publicUser(user),
  });
}

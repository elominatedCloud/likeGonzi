/**
 * OpenAI 호출 래퍼 (서버 전용).
 *
 * ⚠️ 키 환경변수(OPENAI_API_KEY 또는 OPENAI_KEY)에 절대 NEXT_PUBLIC_ 접두사를 붙이지 말 것.
 *    붙이면 번들에 들어가 브라우저에 그대로 노출된다.
 *    이 모듈은 Route Handler에서만 import한다.
 *
 * 키가 없으면 null을 돌려주고, 호출부는 규칙 기반 문장으로 폴백한다.
 * (해커톤 데모가 키 없이도 굴러가야 하므로)
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;

/** .env.local에서 쓰는 이름과 관례적인 이름을 모두 받아준다. */
function apiKey() {
  return process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "";
}

export function isAiConfigured() {
  return Boolean(apiKey());
}

export async function generateText(
  system: string,
  user: string,
  maxTokens = 400,
): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: maxTokens,
        // 사실 요약이라 창작 여지를 줄인다.
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      // 본문에 키가 섞일 일은 없지만 상태 코드 위주로만 남긴다.
      console.error("[ai] openai error", response.status);
      return null;
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch (cause) {
    console.error("[ai] request failed", cause);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

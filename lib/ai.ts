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
const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const MODEL = "gpt-4o-mini";
// gpt-image-1 / 1.5 / 2 는 이 조직에서 한도가 0이다(429 rate_limit_exceeded).
// mini만 열려 있어 실제로 생성된다. 한도가 풀리면 여기만 바꾸면 된다.
const IMAGE_MODEL = "gpt-image-1-mini";
const TIMEOUT_MS = 20_000;
// 이미지 생성은 텍스트보다 한참 느리다.
const IMAGE_TIMEOUT_MS = 90_000;

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

/**
 * 리폼 시안 이미지를 n장 생성한다.
 *
 * 응답은 base64라 data URL로 돌려준다. 해커톤 데모 기준이며,
 * 운영에서는 Storage에 올리고 경로만 넘기는 게 맞다.
 * (repairs.thumbnail_url도 같은 이유로 data URL 폴백을 쓰고 있다)
 *
 * 키가 없으면 null. 호출부가 "AI 미설정" 상태를 그대로 보여준다.
 */
export async function generateImages(
  prompt: string,
  count = 3,
): Promise<string[] | null> {
  const key = apiKey();
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const response = await fetch(OPENAI_IMAGE_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        n: count,
        size: "1024x1024",
        // 시안 단계라 화질보다 속도를 택한다.
        quality: "low",
        // png로 받으면 장당 2.3MB다. webp 70이면 150~300KB로 떨어지고
        // 시안 판단에는 지장이 없다.
        output_format: "webp",
        output_compression: 70,
      }),
    });

    if (!response.ok) {
      console.error("[ai] image error", response.status);
      return null;
    }

    const json = (await response.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const images = (json.data ?? [])
      .map((d) => (d.b64_json ? `data:image/webp;base64,${d.b64_json}` : d.url))
      .filter((v): v is string => Boolean(v));

    return images.length ? images : null;
  } catch (cause) {
    console.error("[ai] image request failed", cause);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

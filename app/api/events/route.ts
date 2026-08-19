import { ok, readJson } from "@/lib/api-response";
import { logProductEvent, type ProductEventType } from "@/lib/product-events";
import { optionalSupabaseUser } from "@/lib/auth-guard";

/** 화면에서 발생하는 이벤트(언박싱 완료, 공유 등)를 받는다. 비로그인도 허용. */
const CLIENT_EVENTS: ProductEventType[] = ["unbox_complete", "share", "recap_view"];

export async function POST(request: Request) {
  const body = await readJson<{
    type?: string;
    product_unit_id?: string | null;
    meta?: Record<string, unknown>;
  }>(request);

  const type = body?.type as ProductEventType | undefined;
  // 알 수 없는 타입은 조용히 무시한다. 로깅 때문에 화면이 실패하면 안 된다.
  if (!type || !CLIENT_EVENTS.includes(type)) return ok({ logged: false });

  const { user, supabase } = await optionalSupabaseUser(request);
  await logProductEvent(supabase, {
    type,
    userId: user?.id ?? null,
    productUnitId: body?.product_unit_id ?? null,
    meta: body?.meta ?? {},
  });
  return ok({ logged: true });
}

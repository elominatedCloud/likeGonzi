import type { SupabaseClient } from "@supabase/supabase-js";

export type ProductEventType =
  | "scan"
  | "unbox_complete"
  | "register"
  | "story_create"
  | "repair_submit"
  | "recap_view"
  | "share";

interface LogEventInput {
  type: ProductEventType;
  userId?: string | null;
  productUnitId?: string | null;
  meta?: Record<string, unknown>;
}

/**
 * 제품 생애주기 이벤트를 남긴다.
 *
 * 절대 throw하지 않는다 — 로깅이 실패했다고 등록·기록 저장이 실패하면 안 된다.
 * 배치나 큐를 쓰지 않는다. 발생 시점 단순 insert로 충분한 규모다.
 */
export async function logProductEvent(
  supabase: SupabaseClient,
  { type, userId = null, productUnitId = null, meta = {} }: LogEventInput,
): Promise<void> {
  try {
    const { error } = await supabase.from("product_events").insert({
      user_id: userId,
      product_unit_id: productUnitId,
      event_type: type,
      meta,
    });
    if (error) console.warn("[events] insert failed", type, error.message);
  } catch (cause) {
    console.warn("[events] insert threw", type, cause);
  }
}

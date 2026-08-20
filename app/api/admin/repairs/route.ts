import { fail, ok, readJson } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-guard";
import type { RepairRow } from "@/lib/mappers";
import { productSlugsForUnitIds } from "@/lib/supabase-product-refs";

/** 운영자가 옮길 수 있는 상태와, 그 앞에 와야 하는 상태 */
const TRANSITIONS: Record<string, string[]> = {
  in_progress: ["paid"],
  completed: ["in_progress"],
  cancelled: ["submitted", "quoted", "paid", "in_progress"],
};

const STAMP: Record<string, string | null> = {
  in_progress: "started_at",
  completed: "completed_at",
  cancelled: null,
};

interface AdminRepairRow extends RepairRow {
  started_at: string | null;
  completed_at: string | null;
}

/**
 * GET /api/admin/repairs — 접수 전체 목록
 *
 * 운영자에게도 개인 식별 정보(이메일 등)는 내리지 않는다.
 * 제품을 되돌려줄 때 필요한 건 접수번호와 제품이지 고객 이메일이 아니다.
 */
export async function GET(request: Request) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const status = new URL(request.url).searchParams.get("status")?.trim();

  const query = supabase
    .from("repairs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query.eq("status", status);

  const { data, error: qError } = await query;
  if (qError) {
    console.error("[admin/repairs] query error", qError);
    return fail("QUERY_FAILED", "접수 목록을 불러오지 못했습니다", 500);
  }

  const rows = (data as AdminRepairRow[] | null) ?? [];
  const slugByUnitId = await productSlugsForUnitIds(
    supabase,
    rows.map((row) => row.product_unit_id),
  );

  const { data: units } = await supabase
    .from("product_units")
    .select("id, tag_code, serial_no")
    .in("id", [...new Set(rows.map((row) => row.product_unit_id))]);
  const unitById = Object.fromEntries(
    ((units ?? []) as { id: string; tag_code: string; serial_no: string }[]).map(
      (unit) => [unit.id, unit],
    ),
  );

  return ok(
    rows.map((row) => ({
      id: row.id,
      status: row.status,
      title: row.title,
      condition_tags: row.condition_tags ?? [],
      product_slug: slugByUnitId[row.product_unit_id] ?? row.product_unit_id,
      tag_code: unitById[row.product_unit_id]?.tag_code ?? null,
      serial_no: unitById[row.product_unit_id]?.serial_no ?? null,
      estimate_min: row.estimate_min,
      estimate_max: row.estimate_max,
      estimate_days: row.estimate_days,
      paid_at: row.paid_at,
      started_at: row.started_at,
      completed_at: row.completed_at,
      created_at: row.created_at,
      // 고객 식별자는 짧은 참조만. 이메일·이름은 내리지 않는다.
      customer_ref: row.user_id.slice(0, 8),
    })),
  );
}

/** PATCH /api/admin/repairs — 진행 상태 변경 */
export async function PATCH(request: Request) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body = await readJson<{ id?: string; status?: string }>(request);
  const id = body?.id?.trim();
  const next = body?.status?.trim();

  if (!id || !next) return fail("VALIDATION_ERROR", "id and status are required", 400);
  if (!TRANSITIONS[next]) {
    return fail("VALIDATION_ERROR", `운영자가 바꿀 수 없는 상태입니다: ${next}`, 400);
  }

  const { data: current, error: qError } = await supabase
    .from("repairs")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (qError && qError.code !== "22P02") {
    console.error("[admin/repairs] load error", qError);
    return fail("QUERY_FAILED", qError.message, 500);
  }
  if (!current) return fail("REPAIR_NOT_FOUND", "접수를 찾을 수 없습니다", 404);

  // 건너뛰기를 막는다. 결제 전에 수선을 시작하거나 착수 없이 완료할 수 없다.
  if (!TRANSITIONS[next].includes(current.status as string)) {
    return fail(
      "INVALID_TRANSITION",
      `'${current.status}' 상태에서는 '${next}'로 바꿀 수 없습니다`,
      409,
    );
  }

  const patch: Record<string, unknown> = { status: next };
  const stamp = STAMP[next];
  if (stamp) patch[stamp] = new Date().toISOString();

  const { data, error: upError } = await supabase
    .from("repairs")
    .update(patch)
    .eq("id", id)
    .select("id, status, started_at, completed_at")
    .single();

  if (upError) {
    console.error("[admin/repairs] update error", upError);
    return fail("UPDATE_FAILED", upError.message, 400);
  }
  return ok(data);
}

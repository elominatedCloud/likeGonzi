"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { AREA_TAGS, CONDITION_TYPES, listBadge, type RepairStatus } from "@/lib/repair";

interface AdminRepair {
  id: string;
  status: RepairStatus;
  title: string | null;
  condition_tags: string[];
  product_slug: string;
  tag_code: string | null;
  serial_no: string | null;
  estimate_min: number | null;
  estimate_max: number | null;
  paid_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  customer_ref: string;
}

/** 각 상태에서 운영자가 누를 수 있는 다음 동작 */
const NEXT_ACTIONS: Partial<Record<RepairStatus, { to: RepairStatus; label: string }[]>> = {
  submitted: [{ to: "cancelled", label: "취소" }],
  quoted: [{ to: "cancelled", label: "취소" }],
  paid: [
    { to: "in_progress", label: "수선 시작" },
    { to: "cancelled", label: "취소" },
  ],
  in_progress: [
    { to: "completed", label: "완료 처리" },
    { to: "cancelled", label: "취소" },
  ],
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "submitted", label: "접수" },
  { value: "quoted", label: "견적" },
  { value: "paid", label: "진행 확정" },
  { value: "in_progress", label: "수선 중" },
  { value: "completed", label: "완료" },
];

const AREA_LABEL = new Map<string, string>(AREA_TAGS.map((t) => [t.id, t.label]));
const CONDITION_LABEL = new Map<string, string>(CONDITION_TYPES.map((t) => [t.id, t.label]));

/** condition_tags는 [부위, 증상]이 섞여 들어온다. 순서를 믿지 않고 각각 찾는다. */
function describeTags(tags: string[]) {
  const area = tags.find((tag) => AREA_LABEL.has(tag));
  const condition = tags.find((tag) => CONDITION_LABEL.has(tag));
  return [area && AREA_LABEL.get(area), condition && CONDITION_LABEL.get(condition)]
    .filter(Boolean)
    .join(" · ");
}

const won = (value: number | null) => (value == null ? "-" : `${value.toLocaleString("ko-KR")}원`);
const day = (value: string | null) => (value ? value.slice(0, 10) : "-");

export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<AdminRepair[] | null>(null);
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const json = await apiFetch<AdminRepair[]>(
      `/api/admin/repairs${filter ? `?status=${filter}` : ""}`,
    );
    if (json.ok) {
      setRepairs(json.data);
      setError("");
    } else setError(json.error.message);
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    apiFetch<AdminRepair[]>(`/api/admin/repairs${filter ? `?status=${filter}` : ""}`)
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setRepairs(json.data);
          setError("");
        } else setError(json.error.message);
      })
      .catch(() => {
        if (!cancelled) setError("접수 목록을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  async function move(id: string, to: RepairStatus) {
    if (busyId) return;
    setBusyId(id);
    setError("");
    try {
      const json = await apiFetch<unknown>("/api/admin/repairs", {
        method: "PATCH",
        body: JSON.stringify({ id, status: to }),
      });
      if (!json.ok) setError(json.error.message);
      else await load();
    } catch {
      setError("상태를 바꾸지 못했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-paper p-5">
        <h1 className="text-[17px] font-bold text-ink">수선 접수 관리</h1>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          진행 확정된 접수를 수선 중 → 완료로 넘깁니다. 단계를 건너뛸 수 없습니다.
          고객 이메일 등 개인 정보는 표시하지 않습니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full border px-3 py-1.5 text-[12px] ${
                filter === item.value
                  ? "border-cognac bg-cream-deep text-ink"
                  : "border-black/10 text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-[#f8ecec] px-4 py-3 text-[13px] text-[#8a3a3a]" role="alert">
          {error}
        </p>
      )}

      {!repairs && !error && (
        <div className="space-y-2" aria-busy="true">
          <div className="h-20 animate-pulse rounded-2xl bg-black/5" />
          <div className="h-20 animate-pulse rounded-2xl bg-black/5" />
        </div>
      )}

      {repairs?.length === 0 && (
        <p className="rounded-2xl bg-paper p-8 text-center text-[13px] text-muted">
          해당 상태의 접수가 없습니다.
        </p>
      )}

      {repairs && repairs.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-paper p-2">
          <table className="w-full min-w-[820px] text-left text-[12px]">
            <thead className="text-muted">
              <tr className="border-b border-black/10">
                <th className="px-2 py-2">태그</th>
                <th className="px-2 py-2">제품</th>
                <th className="px-2 py-2">부위 · 증상</th>
                <th className="px-2 py-2">견적</th>
                <th className="px-2 py-2">상태</th>
                <th className="px-2 py-2">접수일</th>
                <th className="px-2 py-2">고객</th>
                <th className="px-2 py-2">처리</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => {
                const tagText = describeTags(repair.condition_tags);
                return (
                  <tr key={repair.id} className="border-b border-black/5">
                    <td className="px-2 py-2.5 font-medium text-ink">{repair.tag_code ?? "-"}</td>
                    <td className="px-2 py-2.5 text-ink-soft">{repair.product_slug}</td>
                    <td className="px-2 py-2.5 text-ink-soft">
                      {tagText || repair.title}
                    </td>
                    <td className="px-2 py-2.5 text-muted">
                      {repair.estimate_min == null
                        ? "-"
                        : `${won(repair.estimate_min)}~${won(repair.estimate_max)}`}
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[11px] text-ink">
                        {listBadge(repair.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-muted">{day(repair.created_at)}</td>
                    <td className="px-2 py-2.5 font-mono text-[11px] text-muted">
                      {repair.customer_ref}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex gap-1.5">
                        {(NEXT_ACTIONS[repair.status] ?? []).map((action) => (
                          <button
                            key={action.to}
                            type="button"
                            onClick={() => move(repair.id, action.to)}
                            disabled={busyId !== null}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50 ${
                              action.to === "cancelled"
                                ? "border border-black/10 text-muted"
                                : "bg-cognac-deep text-white"
                            }`}
                          >
                            {busyId === repair.id && (
                              <LoaderCircle size={10} className="animate-spin" />
                            )}
                            {action.label}
                          </button>
                        ))}
                        {!NEXT_ACTIONS[repair.status] && (
                          <span className="text-[11px] text-muted">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

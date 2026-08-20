"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Pencil, UserRound, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface Me {
  id: string;
  nickname: string | null;
  email: string | null;
  birthday: string | null;
  membership: "SILVER" | "GOLD" | "PLATINUM";
  cleaning_coupons: number;
  repair_vouchers: number;
}

/**
 * 내 정보.
 *
 * 이전에는 "Storybook Member"라는 고정 문구만 있어서 로그인한 사람이
 * 누구인지, 어떤 등급인지 화면에서 확인할 수 없었다.
 *
 * 생일은 홈의 혜택 D-day가 쓰는 값이라 여기서 입력할 수 있게 둔다
 * (비어 있으면 홈에서 D-day가 아예 표시되지 않는다).
 */
export function ProfileCard() {
  const [me, setMe] = useState<Me | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch<Me>("/api/me")
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setMe(json.data);
          setNickname(json.data.nickname ?? "");
          setBirthday(json.data.birthday ?? "");
        } else setError(json.error.message);
      })
      .catch(() => {
        if (!cancelled) setError("내 정보를 불러오지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (saving) return;
    if (!nickname.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const json = await apiFetch<Me>("/api/me", {
        method: "PATCH",
        body: JSON.stringify({
          nickname: nickname.trim(),
          birthday: birthday || null,
        }),
      });
      if (json.ok) {
        setMe(json.data);
        setEditing(false);
      } else setError(json.error.message);
    } catch {
      setError("저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="soft-card overflow-hidden border border-white/70">
      <div className="bg-[linear-gradient(135deg,#2d1f11_0%,#6e432c_100%)] px-5 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12">
            <UserRound size={26} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            {me ? (
              <>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#d9c2a2]">
                  {me.membership} MEMBER
                </p>
                {/* nickname은 nullable이다. 비면 이름 자리가 빈칸으로 남는다. */}
                <h2 className="mt-1 truncate text-[20px] font-semibold">{me.nickname || "이름 없음"}</h2>
                <p className="mt-1 truncate text-[12px] text-white/65">{me.email}</p>
              </>
            ) : (
              <div aria-hidden>
                <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
                <div className="mt-2 h-5 w-28 animate-pulse rounded bg-white/25" />
                <div className="mt-2 h-3 w-40 animate-pulse rounded bg-white/15" />
              </div>
            )}
          </div>
          {me && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-full border border-white/25 p-2 text-white/80"
              aria-label="내 정보 수정"
            >
              <Pencil size={15} strokeWidth={1.7} />
            </button>
          )}
        </div>

        {!me && !error && (
          <div className="mt-5 grid grid-cols-3 gap-2" aria-busy="true" aria-label="내 정보 불러오는 중">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        )}

        {me && (
          <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/10 py-2">
              <dt className="text-[10px] text-white/60">클리닝 쿠폰</dt>
              <dd className="mt-0.5 text-[15px] font-semibold">{me.cleaning_coupons}</dd>
            </div>
            <div className="rounded-xl bg-white/10 py-2">
              <dt className="text-[10px] text-white/60">수선권</dt>
              <dd className="mt-0.5 text-[15px] font-semibold">{me.repair_vouchers}</dd>
            </div>
            <div className="rounded-xl bg-white/10 py-2">
              <dt className="text-[10px] text-white/60">생일</dt>
              <dd className="mt-0.5 text-[13px] font-semibold">
                {me.birthday ? me.birthday.slice(5).replace("-", ".") : "미입력"}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {editing && (
        <div className="border-t border-black/5 bg-cream/60 px-5 py-4">
          <label className="block text-[12px] font-semibold text-ink">
            이름
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[13px] font-normal outline-none focus:border-cognac"
            />
          </label>
          <label className="mt-3 block text-[12px] font-semibold text-ink">
            생일
            <input
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[13px] font-normal outline-none focus:border-cognac"
            />
            <span className="mt-1 block text-[11px] font-normal leading-4 text-muted">
              홈의 생일 혜택 D-day에 쓰입니다. 비워두면 표시되지 않아요.
            </span>
          </label>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-cognac-deep py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
              저장
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
                setNickname(me?.nickname ?? "");
                setBirthday(me?.birthday ?? "");
              }}
              disabled={saving}
              className="flex items-center justify-center gap-1 rounded-xl border border-black/10 px-4 py-2.5 text-[13px] text-muted"
            >
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="px-5 py-3 text-[12px] text-[#8a3a3a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

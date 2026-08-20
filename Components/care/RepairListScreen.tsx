"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/Components/ui/SafeImage";
import Link from "next/link";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { Plus, RefreshCw, Wrench } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { DbRepair } from "@/lib/mock-db";
import {
  areaFromTags,
  areaLabel,
  formatDate,
  listBadge,
  productDisplayName,
  statusTone,
  toUiProductId,
} from "@/lib/repair";

function RepairReceiptCard({
  repair,
  href,
  productName,
  productImage,
}: {
  repair: DbRepair;
  href: string;
  productName: string;
  productImage?: string;
}) {
  const areas = areaFromTags(repair.condition_tags);
  const src = productImage ?? repair.thumbnail_url;
  return (
    <Link href={href} className="soft-card flex items-center gap-3 px-3 py-3">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-cream-deep">
        <SafeImage
          src={src}
          alt={productName}
          fill
          className="object-contain p-1.5"
          sizes="72px"
          unoptimized={src.startsWith("data:")}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted">{repair.receipt_no}</p>
        <p className="mt-0.5 text-[14px] font-semibold text-ink">{productName}</p>
        <p className="mt-0.5 text-[12px] text-ink-soft">
          {areas.map(areaLabel).join(" · ") || repair.title}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">{formatDate(repair.created_at)}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusTone(repair.status)}`}
      >
        {listBadge(repair.status)}
      </span>
    </Link>
  );
}

interface RepairListScreenProps {
  productId: string;
  productName: string;
  productImage: string;
}

export function RepairListScreen({
  productId,
  productName,
  productImage,
}: RepairListScreenProps) {
  const [repairs, setRepairs] = useState<DbRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    apiFetch<DbRepair[]>(`/api/products/${productId}/repairs`)
      .then((json) => {
        if (json.ok) setRepairs(json.data);
        else setError(json.error?.message ?? "수선 내역을 불러오지 못했어요.");
      })
      .catch(() => setError("네트워크 연결을 확인한 뒤 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [productId, retryKey]);

  const inProgress = repairs.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const completed = repairs.filter((r) => r.status === "completed");

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader
        title="수선 접수 내역"
        backHref={`/products/${productId}/care?tab=repairs`}
        rightSlot={
          <Link
            href={`/products/${productId}/repairs/new`}
            className="inline-flex items-center gap-1 rounded-full bg-cognac-deep px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            <Plus size={13} strokeWidth={2.4} /> 접수
          </Link>
        }
      />

      {loading && (
        <div className="mx-4 mt-5 space-y-3" aria-busy="true"><div className="h-24 animate-pulse rounded-2xl bg-black/5"/><div className="h-24 animate-pulse rounded-2xl bg-black/5"/><p className="text-center text-[12px] text-muted">수선 내역을 불러오고 있어요.</p></div>
      )}

      {!loading && error && (
        <div className="mx-4 mt-6 rounded-2xl bg-paper px-5 py-8 text-center" role="alert"><p className="text-[13px] text-[#8a3a3a]">{error}</p><button type="button" onClick={() => {setLoading(true);setError("");setRetryKey((value) => value + 1)}} className="mt-4 inline-flex items-center gap-2 rounded-full border border-cognac/25 px-4 py-2.5 text-[12px] font-semibold text-cognac-deep"><RefreshCw size={14}/> 다시 시도</button></div>
      )}

      {!loading && !error && repairs.length === 0 && (
        <div className="soft-card mx-4 mt-5 px-6 py-12 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-deep text-cognac"><Wrench size={23}/></span><h2 className="mt-4 text-[15px] font-semibold text-ink">수선 기록이 없습니다</h2><p className="mt-2 text-[12px] leading-5 text-muted">제품 상태가 달라졌다면 사진과 메모로<br/>첫 수선 접수를 시작해보세요.</p><Link href={`/products/${productId}/repairs/new`} className="mt-5 inline-flex rounded-full bg-cognac-deep px-5 py-3 text-[13px] font-semibold text-white">첫 수선 접수하기</Link></div>
      )}

      {!loading && !error && repairs.length > 0 && (
        <div className="mx-4 mt-3 space-y-6">
          <section>
            <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              IN PROGRESS
            </h2>
            <div className="mt-2 space-y-2">
              {inProgress.length === 0 && (
                <p className="py-4 text-[12px] text-muted">진행 중인 접수가 없습니다.</p>
              )}
              {inProgress.map((repair) => (
                <RepairReceiptCard
                  key={repair.id}
                  repair={repair}
                  productName={productName}
                  productImage={productImage}
                  href={`/products/${productId}/repairs/${repair.id}`}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              COMPLETED
            </h2>
            <div className="mt-2 space-y-2">
              {completed.length === 0 && (
                <p className="py-4 text-[12px] text-muted">완료된 수선이 없습니다.</p>
              )}
              {completed.map((repair) => (
                <RepairReceiptCard
                  key={repair.id}
                  repair={repair}
                  productName={productName}
                  productImage={productImage}
                  href={`/products/${productId}/repairs/${repair.id}`}
                />
              ))}
            </div>
          </section>

          <p className="px-1 pb-2 text-center text-[12px] leading-relaxed text-muted">
            접수 카드를 선택하면 상세 정보와
            <br />
            현재 진행 단계를 확인하실 수 있습니다.
          </p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

export function MyRepairsList() {
  const [repairs, setRepairs] = useState<DbRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    apiFetch<DbRepair[]>("/api/repairs")
      .then((json) => {
        if (json.ok) setRepairs(json.data);
        else setError(json.error?.message ?? "수선 내역을 불러오지 못했어요.");
      })
      .catch(() => setError("네트워크 연결을 확인한 뒤 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [retryKey]);

  const inProgress = repairs.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const completed = repairs.filter((r) => r.status === "completed");

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="수선 접수 내역" backHref="/home" />

      {loading && (
        <div className="mx-4 mt-5 space-y-3" aria-busy="true"><div className="h-24 animate-pulse rounded-2xl bg-black/5"/><div className="h-24 animate-pulse rounded-2xl bg-black/5"/><p className="text-center text-[12px] text-muted">수선 내역을 불러오고 있어요.</p></div>
      )}

      {!loading && error && (
        <div className="mx-4 mt-6 rounded-2xl bg-paper px-5 py-8 text-center" role="alert"><p className="text-[13px] text-[#8a3a3a]">{error}</p><button type="button" onClick={() => {setLoading(true);setError("");setRetryKey((value) => value + 1)}} className="mt-4 inline-flex items-center gap-2 rounded-full border border-cognac/25 px-4 py-2.5 text-[12px] font-semibold text-cognac-deep"><RefreshCw size={14}/> 다시 시도</button></div>
      )}

      {!loading && !error && repairs.length === 0 && (
        <div className="soft-card mx-4 mt-5 px-6 py-12 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-deep text-cognac"><Wrench size={23}/></span><h2 className="mt-4 text-[15px] font-semibold text-ink">수선 기록이 없습니다</h2><p className="mt-2 text-[12px] leading-5 text-muted">제품 상세에서 수선이 필요한 제품을 선택해<br/>새 접수를 시작할 수 있어요.</p><Link href="/home" className="mt-5 inline-flex rounded-full bg-cognac-deep px-5 py-3 text-[13px] font-semibold text-white">내 제품 보기</Link></div>
      )}

      {!loading && !error && repairs.length > 0 && (
        <div className="mx-4 mt-3 space-y-6">
          <section>
            <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              IN PROGRESS
            </h2>
            <div className="mt-2 space-y-2">
              {inProgress.map((repair) => (
                <RepairReceiptCard
                  key={repair.id}
                  repair={repair}
                  productName={productDisplayName(repair.product_id)}
                  href={`/products/${toUiProductId(repair.product_id)}/repairs/${repair.id}`}
                />
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              COMPLETED
            </h2>
            <div className="mt-2 space-y-2">
              {completed.map((repair) => (
                <RepairReceiptCard
                  key={repair.id}
                  repair={repair}
                  productName={productDisplayName(repair.product_id)}
                  href={`/products/${toUiProductId(repair.product_id)}/repairs/${repair.id}`}
                />
              ))}
            </div>
          </section>
          <p className="px-1 pb-2 text-center text-[12px] leading-relaxed text-muted">
            접수 카드를 선택하면 상세 정보와
            <br />
            현재 진행 단계를 확인하실 수 있습니다.
          </p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

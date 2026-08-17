"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/Components/ui/SafeImage";
import Link from "next/link";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
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

  useEffect(() => {
    fetch(`/api/products/${productId}/repairs`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setRepairs(json.data);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const inProgress = repairs.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const completed = repairs.filter((r) => r.status === "completed");

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="수선 접수 내역" backHref={`/products/${productId}/care?tab=repairs`} />

      {loading && (
        <p className="py-10 text-center text-[13px] text-muted">불러오는 중…</p>
      )}

      {!loading && (
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

  useEffect(() => {
    fetch("/api/repairs")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setRepairs(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const inProgress = repairs.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const completed = repairs.filter((r) => r.status === "completed");

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="수선 접수 내역" backHref="/home" />

      {loading && (
        <p className="py-10 text-center text-[13px] text-muted">불러오는 중…</p>
      )}

      {!loading && (
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

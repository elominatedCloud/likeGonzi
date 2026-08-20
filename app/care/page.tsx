"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, PackagePlus, Wrench } from "lucide-react";
import { SafeImage } from "@/Components/ui/SafeImage";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { apiFetch } from "@/lib/api-client";

interface OwnedProduct {
  id: string;
  slug?: string;
  name: string;
  color: string | null;
  year: number | null;
  cutout_image: string | null;
  care_score: number;
}

/**
 * 케어 & 리페어 진입용 제품 선택.
 *
 * 마이 화면에서 바로 첫 제품의 케어 화면으로 보내고 있었는데,
 * 제품이 여러 개면 어느 제품인지 고를 수가 없었다.
 * 제품이 하나뿐이면 고를 것이 없으므로 그대로 통과시킨다.
 */
export default function CarePickerPage() {
  const router = useRouter();
  const [products, setProducts] = useState<OwnedProduct[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch<OwnedProduct[]>("/api/products/my")
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) {
          setError(json.error.message);
          return;
        }
        if (json.data.length === 1) {
          const only = json.data[0];
          router.replace(`/products/${only.slug ?? only.id}/care`);
          return;
        }
        setProducts(json.data);
      })
      .catch(() => {
        if (!cancelled) setError("제품을 불러오지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader title="케어 & 리페어" backHref="/my" />

      <p className="mx-4 mt-3 text-[12px] leading-5 text-muted">
        관리 가이드와 수선 여정을 볼 제품을 선택하세요.
      </p>

      {error && (
        <p className="mx-4 mt-6 rounded-2xl bg-paper px-5 py-8 text-center text-[13px] text-[#8a3a3a]" role="alert">
          {error}
        </p>
      )}

      {!products && !error && (
        <div className="mx-4 mt-4 space-y-3" aria-busy="true">
          <div className="h-20 animate-pulse rounded-2xl bg-black/5" />
          <div className="h-20 animate-pulse rounded-2xl bg-black/5" />
        </div>
      )}

      {products?.length === 0 && (
        <div className="soft-card mx-4 mt-4 px-6 py-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-deep text-cognac">
            <PackagePlus size={23} />
          </span>
          <h2 className="mt-4 text-[15px] font-semibold text-ink">등록된 제품이 없어요</h2>
          <p className="mt-2 text-[12px] leading-5 text-muted">
            제품 태그를 스캔하면 케어와 수선 이력을 남길 수 있어요.
          </p>
          <Link
            href="/camera?mode=qr"
            className="mt-5 inline-flex rounded-full bg-cognac-deep px-5 py-3 text-[13px] font-semibold text-white"
          >
            제품 등록하기
          </Link>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="mx-4 mt-4 space-y-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug ?? product.id}/care`}
              className="soft-card flex items-center gap-3 px-3 py-3"
            >
              <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                <SafeImage
                  src={product.cutout_image ?? ""}
                  alt={product.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{product.name}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {[product.color, product.year].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-cognac">
                  <Wrench size={11} /> 케어 점수 {product.care_score}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

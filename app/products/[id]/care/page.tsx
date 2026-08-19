"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { CareGuideScreen } from "@/Components/care/CareGuideScreen";
import {
  ProductLoadError,
  ProductLoading,
} from "@/Components/product/ProductLoadState";
import { toRepairView } from "@/lib/api-view";
import { useProductDetail } from "@/lib/use-product-detail";

export default function CarePage() {
  const { id } = useParams<{ id: string }>();
  const { data, product, error, retry } = useProductDetail(id);

  if (error)
    return <ProductLoadError message={error} onRetry={retry} title="케어" />;
  if (!data || !product) return <ProductLoading title="케어" />;

  return (
    // CareGuideScreen이 useSearchParams(?tab=)를 쓰기 때문에 Suspense가 필요하다.
    <Suspense fallback={<ProductLoading title="케어" />}>
      <CareGuideScreen
        product={product}
        repairs={data.recent_activity.repairs.map(toRepairView)}
      />
    </Suspense>
  );
}

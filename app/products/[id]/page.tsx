"use client";

import { useParams } from "next/navigation";
import { ProductDetailScreen } from "@/Components/product/ProductDetailScreen";
import {
  ProductLoadError,
  ProductLoading,
} from "@/Components/product/ProductLoadState";
import { toRepairView } from "@/lib/api-view";
import { useProductDetail } from "@/lib/use-product-detail";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data, product, error, retry } = useProductDetail(id);

  if (error) return <ProductLoadError message={error} onRetry={retry} />;
  if (!data || !product) return <ProductLoading />;

  return (
    <ProductDetailScreen
      product={product}
      stories={data.recent_activity.stories}
      repairs={data.recent_activity.repairs.map(toRepairView)}
    />
  );
}

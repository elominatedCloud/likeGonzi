"use client";

import { useParams } from "next/navigation";
import { ProductStoriesScreen } from "@/Components/product/ProductStoriesScreen";
import {
  ProductLoadError,
  ProductLoading,
} from "@/Components/product/ProductLoadState";
import { useProductDetail } from "@/lib/use-product-detail";

export default function ProductStoriesPage() {
  const { id } = useParams<{ id: string }>();
  const { data, product, error, retry } = useProductDetail(id);

  if (error)
    return <ProductLoadError message={error} onRetry={retry} title="기록" />;
  if (!data || !product) return <ProductLoading title="기록" />;

  return (
    <ProductStoriesScreen
      product={product}
      stories={data.recent_activity.stories}
    />
  );
}

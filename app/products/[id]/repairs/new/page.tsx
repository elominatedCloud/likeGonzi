"use client";

import { useParams } from "next/navigation";
import { RepairApplyScreen } from "@/Components/care/RepairApplyScreen";
import {
  ProductLoadError,
  ProductLoading,
} from "@/Components/product/ProductLoadState";
import { useProductDetail } from "@/lib/use-product-detail";

export default function RepairApplyPage() {
  const { id } = useParams<{ id: string }>();
  const { product, error, retry } = useProductDetail(id);

  if (error)
    return <ProductLoadError message={error} onRetry={retry} title="수선 신청" />;
  if (!product) return <ProductLoading title="수선 신청" />;

  return (
    <RepairApplyScreen
      productId={id}
      productName={product.name}
      productColor={product.color}
      productImage={product.cutoutImage}
    />
  );
}

"use client";

import { useParams } from "next/navigation";
import { RepairDetailScreen } from "@/Components/care/RepairDetailScreen";
import {
  ProductLoadError,
  ProductLoading,
} from "@/Components/product/ProductLoadState";
import { useProductDetail } from "@/lib/use-product-detail";

export default function RepairDetailPage() {
  const { id, repairId } = useParams<{ id: string; repairId: string }>();
  const { product, error, retry } = useProductDetail(id);

  if (error)
    return (
      <ProductLoadError message={error} onRetry={retry} title="수선 접수 내역" />
    );
  if (!product) return <ProductLoading title="수선 접수 내역" />;

  return (
    <RepairDetailScreen
      productId={id}
      productName={product.name}
      productColor={product.color}
      productImage={product.cutoutImage}
      repairId={repairId}
    />
  );
}

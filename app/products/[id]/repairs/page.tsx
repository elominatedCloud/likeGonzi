"use client";

import { useParams } from "next/navigation";
import { RepairListScreen } from "@/Components/care/RepairListScreen";
import {
  ProductLoadError,
  ProductLoading,
} from "@/Components/product/ProductLoadState";
import { useProductDetail } from "@/lib/use-product-detail";

export default function RepairListPage() {
  const { id } = useParams<{ id: string }>();
  const { product, error, retry } = useProductDetail(id);

  if (error)
    return (
      <ProductLoadError message={error} onRetry={retry} title="수선 접수 내역" />
    );
  if (!product) return <ProductLoading title="수선 접수 내역" />;

  return (
    <RepairListScreen
      productId={id}
      productName={product.name}
      productImage={product.cutoutImage}
    />
  );
}

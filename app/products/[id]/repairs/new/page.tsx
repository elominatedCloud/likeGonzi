import { Suspense } from "react";
import { RepairApplyScreen } from "@/Components/care/RepairApplyScreen";
import { getProduct } from "@/lib/data";

export default async function RepairApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);

  return (
    <Suspense
      fallback={
        <div className="visetos-bg flex min-h-dvh items-center justify-center text-muted">
          수선 접수 불러오는 중…
        </div>
      }
    >
      <RepairApplyScreen
        productId={product.id}
        productName={product.name}
        productColor={product.color}
        productImage={product.cutoutImage}
      />
    </Suspense>
  );
}

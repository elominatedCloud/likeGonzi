import { Suspense } from "react";
import { CareGuideScreen } from "@/components/care/CareGuideScreen";
import { getProduct, getRepairsByProduct } from "@/lib/data";

export default async function CarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const repairs = getRepairsByProduct(product.id);

  return (
    <Suspense
      fallback={
        <div className="visetos-bg flex min-h-dvh items-center justify-center text-muted">
          케어 가이드 불러오는 중…
        </div>
      }
    >
      <CareGuideScreen product={product} repairs={repairs} />
    </Suspense>
  );
}

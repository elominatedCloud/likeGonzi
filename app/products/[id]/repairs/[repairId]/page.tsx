import { RepairDetailScreen } from "@/Components/care/RepairDetailScreen";
import { getProduct } from "@/lib/data";

export default async function RepairDetailPage({
  params,
}: {
  params: Promise<{ id: string; repairId: string }>;
}) {
  const { id, repairId } = await params;
  const product = getProduct(id);
  return (
    <RepairDetailScreen
      productId={product.id}
      productName={product.name}
      productColor={product.color}
      productImage={product.cutoutImage}
      repairId={repairId}
    />
  );
}

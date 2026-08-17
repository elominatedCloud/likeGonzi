import { RepairListScreen } from "@/Components/care/RepairListScreen";
import { getProduct } from "@/lib/data";

export default async function RepairListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  return (
    <RepairListScreen
      productId={product.id}
      productName={product.name}
      productImage={product.cutoutImage}
    />
  );
}

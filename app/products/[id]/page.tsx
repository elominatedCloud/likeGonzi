import { ProductDetailScreen } from "@/components/product/ProductDetailScreen";
import {
  getProduct,
  getRepairsByProduct,
  getStoriesByProduct,
} from "@/lib/data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const stories = getStoriesByProduct(product.id);
  const repairs = getRepairsByProduct(product.id);

  return (
    <ProductDetailScreen
      product={product}
      stories={stories}
      repairs={repairs}
    />
  );
}

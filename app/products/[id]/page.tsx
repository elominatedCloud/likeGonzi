import { ProductDetailScreen } from "@/Components/product/ProductDetailScreen";
import {
  getProduct,
  getRepairsByProduct,
} from "@/lib/data";
import { normalizeProductId } from "@/lib/mock-db";
import { listStories } from "@/lib/story-store";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const stories = listStories(normalizeProductId(product.id));
  const repairs = getRepairsByProduct(product.id);

  return (
    <ProductDetailScreen
      product={product}
      stories={stories}
      repairs={repairs}
    />
  );
}

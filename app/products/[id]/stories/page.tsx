import { ProductStoriesScreen } from "@/Components/product/ProductStoriesScreen";
import { getProduct, getStoriesByProduct } from "@/lib/data";

export default async function ProductStoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const stories = getStoriesByProduct(product.id);

  return <ProductStoriesScreen product={product} stories={stories} />;
}

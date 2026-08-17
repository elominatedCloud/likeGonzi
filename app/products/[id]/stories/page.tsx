import { ProductStoriesScreen } from "@/Components/product/ProductStoriesScreen";
import { getProduct } from "@/lib/data";
import { normalizeProductId } from "@/lib/mock-db";
import { listStories } from "@/lib/story-store";

export default async function ProductStoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const stories = listStories(normalizeProductId(product.id));

  return <ProductStoriesScreen product={product} stories={stories} />;
}

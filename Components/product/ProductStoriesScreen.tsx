"use client";

import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { ProductStoryTimeline } from "@/Components/product/ProductStoryTimeline";
import type { Product } from "@/types";
import type { StoryRecord } from "@/types/story-api";

interface ProductStoriesScreenProps {
  product: Product;
  stories: StoryRecord[];
}

export function ProductStoriesScreen({
  product,
  stories,
}: ProductStoriesScreenProps) {
  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <AmbientPattern variant="product" />
      <PageHeader title={product.name} backHref={`/products/${product.id}`} />
      <ProductStoryTimeline product={product} stories={stories} />
      <BottomNav />
    </main>
  );
}

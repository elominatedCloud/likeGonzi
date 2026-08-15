"use client";

import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import { PageHeader } from "@/Components/ui/PageHeader";
import { BottomNav } from "@/Components/ui/BottomNav";
import type { Product, Story } from "@/types";

interface ProductStoriesScreenProps {
  product: Product;
  stories: Story[];
}

function shortMaterial(material: string) {
  if (material.toLowerCase().includes("visetos")) return "Visetos";
  return material.split(/[/,]/)[0]?.trim() || material;
}

export function ProductStoriesScreen({
  product,
  stories,
}: ProductStoriesScreenProps) {
  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <PageHeader
        title={product.name}
        backHref={`/products/${product.id}`}
        rightSlot={
          <span className="flex h-9 w-9 items-center justify-center text-ink">
            <Star size={18} strokeWidth={1.5} />
          </span>
        }
      />

      <section className="relative mx-auto h-[220px] w-full max-w-[320px]">
        <Image
          src={product.cutoutImage}
          alt={product.name}
          fill
          className="object-contain p-6"
          sizes="320px"
          priority
        />
      </section>

      <section className="soft-card mx-4 mt-1 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-[26px] leading-none text-ink">
            {product.name}
          </h2>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eef6ea] px-2.5 py-1 text-[11px] font-medium text-[#3d6b3a]">
            <BadgeCheck size={12} /> 정품 인증 완료
          </span>
        </div>
        <p className="mt-3 text-[13px] text-ink-soft">
          {product.color} · {shortMaterial(product.material)}
        </p>
        <p className="mt-1 text-[12px] text-muted">{product.registeredAt}</p>
      </section>

      <section className="mx-4 mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-[13px] tracking-[0.14em] text-ink">
            MY STORYS
          </h3>
          <span className="text-[12px] text-muted">전체 {stories.length}</span>
        </div>

        <div className="space-y-4">
          {stories.map((story) => (
            <article
              key={story.id}
              className="relative h-[320px] w-full overflow-hidden rounded-2xl shadow-[0_10px_24px_rgba(43,33,28,0.08)]"
            >
              <Image
                src={story.image}
                alt={story.tag}
                fill
                className="object-cover"
                sizes="400px"
              />
              <span className="ribbon-tag">
                {story.tag} ({story.count})
              </span>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

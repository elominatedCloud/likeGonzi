import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import type { StoryRecord } from "@/types/story-api";
import { getLogProductId } from "@/lib/product-routes";

interface ProductStoryTimelineProps {
  product: Product;
  stories: StoryRecord[];
  allHref?: string;
  limit?: number;
}

function storyDate(story: StoryRecord) {
  return story.created_at.slice(0, 10).replaceAll("-", ".");
}

export function ProductStoryTimeline({
  product,
  stories,
  allHref,
  limit,
}: ProductStoryTimelineProps) {
  const productLogId = getLogProductId(product.id);
  const visibleStories = [...stories]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, limit ?? stories.length);

  return (
    <section className="soft-card mx-4 mt-4 min-h-[390px] overflow-hidden px-4 pb-7 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[14px] font-semibold tracking-[0.08em] text-cognac">
          MY STORIES
        </h3>
        {allHref ? (
          <Link href={allHref} className="text-[12px] leading-5 text-muted">
            전체보기 →
          </Link>
        ) : (
          <span className="text-[12px] leading-5 text-muted">
            전체 {visibleStories.length}
          </span>
        )}
      </div>

      {visibleStories.length ? (
        <div className="relative mt-4 space-y-4 pl-7 before:absolute before:bottom-[-28px] before:left-[7px] before:top-[-4px] before:w-px before:bg-[#caa77f]">
          {visibleStories.map((story) => {
            const detailHref = `/log/${productLogId}/record/${story.id}`;
            const memo = story.memo.split("\n").filter(Boolean).slice(0, 2);

            return (
              <Link
                key={story.id}
                href={detailHref}
                aria-label={`${storyDate(story)} ${story.tag}, ${story.place || "장소 미지정"} 기록 보기`}
                className="relative flex min-h-[132px] gap-3 rounded-[20px] bg-white p-3.5 text-ink shadow-[0_5px_16px_rgba(75,48,26,0.12)] outline-none transition-transform active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-cognac"
              >
                <Image
                  src="/images/pattern/mcm-diamond.svg"
                  alt=""
                  aria-hidden="true"
                  width={13}
                  height={18}
                  className="absolute left-[-27px] top-3 h-[18px] w-[13px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold leading-4 text-cognac">
                    {storyDate(story)} · 내 기록
                  </p>
                  <h4 className="mt-1 text-[15px] font-semibold leading-[21px] tracking-[-0.02em]">
                    {story.tag}
                  </h4>
                  <p className="mt-1 text-[12px] leading-[18px] text-muted">
                    {story.place || "장소 미지정"} · {product.name}
                  </p>
                  {memo.length > 0 && (
                    <p className="mt-4 line-clamp-2 whitespace-pre-line text-[11px] leading-[17px] text-[#8d857e]">
                      {memo.join("\n")}
                    </p>
                  )}
                </div>
                <div className="relative h-[104px] w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-cream-deep">
                  <Image
                    src={story.image_url}
                    alt={`${story.tag} 기록 사진`}
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[18px] border border-dashed border-cognac/25 bg-cream/70 px-5 py-10 text-center">
          <p className="text-[14px] font-semibold text-ink">아직 남긴 이야기가 없어요.</p>
          <Link
            href={`/log/${productLogId}/record/new`}
            className="mt-2 inline-block text-[12px] text-cognac"
          >
            첫 기록 남기기 →
          </Link>
        </div>
      )}
    </section>
  );
}

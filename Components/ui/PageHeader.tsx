import Link from "next/link";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  onMore?: () => void;
  rightSlot?: React.ReactNode;
  serif?: boolean;
}

export function PageHeader({
  title,
  backHref = "/home",
  onMore,
  rightSlot,
  serif = true,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 grid min-h-[60px] grid-cols-[72px_minmax(0,1fr)_72px] items-center bg-cream/90 px-4 py-2 backdrop-blur-md">
      <Link
        href={backHref}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        aria-label="뒤로"
      >
        <ArrowLeft size={20} strokeWidth={1.6} />
      </Link>
      <h1
        className={`min-w-0 break-keep text-center text-[18px] leading-[23px] tracking-[0.01em] text-ink [overflow-wrap:anywhere] ${serif ? "font-serif font-medium" : "font-semibold"}`}
      >
        {title}
      </h1>
      <div className="flex items-center justify-end gap-1">
        {rightSlot}
        {onMore ? (
          <button
            type="button"
            onClick={onMore}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
            aria-label="더보기"
          >
            <MoreHorizontal size={20} />
          </button>
        ) : (
          !rightSlot && <div className="h-9 w-9" />
        )}
      </div>
    </header>
  );
}

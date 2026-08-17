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
    <header className="sticky top-0 z-30 flex items-center justify-between bg-cream/90 px-4 py-3 backdrop-blur-md">
      <Link
        href={backHref}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        aria-label="뒤로"
      >
        <ArrowLeft size={20} strokeWidth={1.6} />
      </Link>
      <h1
        className={`text-[18px] leading-7 tracking-[0.01em] text-ink ${serif ? "font-serif font-medium" : "font-semibold"}`}
      >
        {title}
      </h1>
      <div className="flex items-center gap-1">
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

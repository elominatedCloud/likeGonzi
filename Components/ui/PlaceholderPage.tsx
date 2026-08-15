import Link from "next/link";
import { BottomNav } from "@/Components/ui/BottomNav";

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="visetos-bg flex min-h-dvh flex-col pb-28">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="font-serif text-[12px] tracking-[0.18em] text-gold">
          MCM · STORYBOOK
        </p>
        <h1 className="mt-3 text-[24px] font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          {description}
        </p>
        <Link
          href="/home"
          className="mt-6 rounded-full bg-ink px-5 py-2.5 text-[13px] text-white"
        >
          홈으로
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}

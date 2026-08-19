import Link from "next/link";
import { AdminGate } from "@/Components/admin/AdminGate";

/**
 * 운영용 admin 영역.
 * 앱 본체(모바일 프레임)와 달리 표·QR을 넓게 보기 때문에 프레임 폭 제한을 풀어둔다.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <header className="border-b border-black/10 bg-paper px-5 py-4 print:hidden">
        <p className="type-eyebrow text-gold">MCM · STORYBOOK</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-[20px] font-bold text-ink">운영 도구</h1>
          <nav className="flex gap-3 text-[13px]">
            <Link href="/admin/insights" className="text-cognac-deep underline-offset-4 hover:underline">
              브랜드 인사이트
            </Link>
            <Link href="/admin/units" className="text-cognac-deep underline-offset-4 hover:underline">
              개체 발급 · QR 시트
            </Link>
            <Link href="/admin/tags" className="text-cognac-deep underline-offset-4 hover:underline">
              단건 QR
            </Link>
            <Link href="/home" className="text-muted underline-offset-4 hover:underline">
              앱으로 돌아가기
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[880px] px-5 py-6">
        <AdminGate>{children}</AdminGate>
      </main>
    </div>
  );
}

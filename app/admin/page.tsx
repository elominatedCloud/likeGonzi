import Link from "next/link";
import { BarChart3, QrCode, Sparkles, Wrench } from "lucide-react";

/**
 * /admin — 운영 도구 첫 화면.
 *
 * 여태 네 개의 하위 화면만 있고 /admin 자체가 404였다. 주소를 정확히 아는
 * 사람만 들어올 수 있었다는 뜻이다. 레이아웃 상단 nav와 같은 목록이지만,
 * 무엇을 하는 화면인지 여기서 한 줄씩 설명한다.
 */
const TOOLS = [
  {
    href: "/admin/insights",
    label: "브랜드 인사이트",
    detail: "동의한 사용자만 집계한 도시·상황·수선 부위 통계",
    icon: BarChart3,
  },
  {
    href: "/admin/repairs",
    label: "수선 접수 관리",
    detail: "접수 목록과 진행 단계 변경. 개인 정보는 표시하지 않습니다",
    icon: Wrench,
  },
  {
    href: "/admin/units",
    label: "개체 발급 · QR 시트",
    detail: "제품 개체를 대량 발급하고 QR을 한 장에 모아 출력",
    icon: QrCode,
  },
  {
    href: "/admin/tags",
    label: "단건 QR",
    detail: "태그 하나의 QR을 즉석에서 만들어 확인",
    icon: Sparkles,
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-paper p-5">
        <h1 className="text-[17px] font-bold text-ink">운영 도구</h1>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          운영자 계정에서만 열립니다. 화면과 API 양쪽에서 권한을 확인합니다.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl bg-paper">
        {TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`flex items-center gap-3 px-5 py-4 ${
                index ? "border-t border-black/5" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-deep text-cognac-deep">
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">
                  {tool.label}
                </span>
                <span className="mt-0.5 block text-[12px] leading-4 text-muted">
                  {tool.detail}
                </span>
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

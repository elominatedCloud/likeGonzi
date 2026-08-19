import Link from "next/link";
import { ExternalLink, ShieldCheck, ShoppingBag } from "lucide-react";
import { AmbientPattern } from "@/Components/ui/AmbientPattern";
import { BottomNav } from "@/Components/ui/BottomNav";
import { PageHeader } from "@/Components/ui/PageHeader";
import { MCM_OFFICIAL_SHOP_URL } from "@/lib/navigation";

export default function ShopPage() {
  return (
    <main className="visetos-bg relative min-h-dvh pb-28">
      <AmbientPattern variant="home"/>
      <PageHeader title="MCM 공식 온라인 스토어" backHref="/home" serif={false}/>
      <section className="mx-4 mt-5 overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,#2d1f11_0%,#6e432c_100%)] px-6 py-8 text-white shadow-[0_16px_40px_rgba(45,31,17,.2)]">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10"><ShoppingBag size={22}/></span>
        <p className="mt-6 text-[11px] font-semibold tracking-[.14em] text-[#dcc5a6]">MCM OFFICIAL STORE</p>
        <h1 className="mt-2 font-serif text-[27px] leading-9">쇼핑은 MCM 공식몰에서<br/>안전하게 이어집니다.</h1>
        <p className="mt-4 text-[12px] leading-5 text-white/70">상품 검색, 찜, 장바구니와 결제는 앱 내부 기능이 아닙니다. 버튼을 누르면 외부 브라우저의 MCM 공식몰이 열립니다.</p>
        <a href={MCM_OFFICIAL_SHOP_URL} target="_blank" rel="noreferrer" className="mt-7 flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#fffaf3] px-4 text-[14px] font-semibold text-[#2d1f11]">공식몰에서 쇼핑하기 <ExternalLink size={16}/></a>
      </section>
      <section className="soft-card mx-4 mt-4 flex items-start gap-3 px-4 py-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-cognac"/>
        <div><h2 className="text-[13px] font-semibold text-ink">외부 사이트 이동 안내</h2><p className="mt-1 text-[11px] leading-4 text-muted">공식몰의 상품, 재고, 가격과 주문 정보는 MCM 공식몰 정책을 따릅니다.</p></div>
      </section>
      <Link href="/home" className="mx-auto mt-5 block w-fit text-[12px] text-muted">Storybook으로 돌아가기</Link>
      <BottomNav/>
    </main>
  );
}

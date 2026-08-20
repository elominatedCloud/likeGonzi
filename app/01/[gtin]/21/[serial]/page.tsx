import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * GS1 Digital Link — /01/{gtin}/21/{serial}
 *
 * 실물 DPP 태그(및 Aura가 쓰는 태그)가 담는 표준 URL 형식이다.
 * 01은 GTIN(제품 모델), 21은 시리얼(개체)을 뜻하는 GS1 application identifier다.
 * 표준 리더가 읽을 수 있게 이 주소를 열어두고, 안에서는 기존 tag_code 흐름으로 넘긴다.
 * 기존 /start?tag=UNIT-... 도 계속 동작한다.
 */
export default async function Gs1DigitalLinkPage({
  params,
}: {
  params: Promise<{ gtin: string; serial: string }>;
}) {
  const { gtin, serial } = await params;

  // 형식이 아니면 조회할 것도 없다. 스캔 실패 화면으로 보낸다.
  if (!/^\d{13}$/.test(gtin)) redirect("/start?status=error");

  const supabase = createSupabaseServerClient(new Request("http://gs1.local"));
  const { data: tagCode } = await supabase.rpc("resolve_gs1_link", {
    p_gtin: gtin,
    p_serial: decodeURIComponent(serial),
  });

  if (!tagCode) redirect("/start?status=error");
  redirect(`/start?tag=${encodeURIComponent(tagCode as string)}`);
}

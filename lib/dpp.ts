import type { SupabaseClient } from "@supabase/supabase-js";
import type { MyProductRow } from "@/lib/mappers";

/** 소재 구성 한 줄. share는 백분율. */
export interface MaterialShare {
  material: string;
  share: number;
}

/**
 * 디지털 제품 여권(DPP).
 *
 * EU ESPR이 요구하는 모델 단위 항목(소재 구성, 재활용 함량, 수리가능성,
 * 원산지)에 개체 단위 식별자(GTIN + 시리얼)를 붙인 형태다.
 *
 * data_source가 'demo'면 시연용 가정치다. 화면에서 반드시 그렇게 표시한다 —
 * 근거 없는 수치를 브랜드 공식 데이터처럼 보이게 하면 안 된다.
 */
export interface ProductPassport {
  gtin: string | null;
  serial_no: string;
  /** GS1 Digital Link 경로. 표준 DPP 리더가 읽는 주소 형식. */
  gs1_digital_link: string | null;
  material_composition: MaterialShare[];
  recycled_content_pct: number | null;
  repairability_score: number | null;
  country_of_origin: string | null;
  registered_at: string;
  store: string | null;
  year: number | null;
  data_source: "demo" | "brand";
  /**
   * 온체인 앵커링 상태. MCM의 Aura 패스포트는 브랜드가 운영하는 시스템이라
   * 우리가 기록할 수 없다. 여권 내용을 표준 형태로 갖춰두고 자리만 비워둔다.
   */
  anchor: { target: "aura"; status: "not_anchored" };
}

interface DppRow {
  gtin: string | null;
  material_composition: MaterialShare[] | null;
  recycled_content_pct: number | string | null;
  repairability_score: number | string | null;
  country_of_origin: string | null;
  dpp_data_source: string | null;
}

/** numeric 컬럼은 supabase-js가 문자열로 준다. */
function num(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
}

/** 제품 여권을 만든다. 모델 정보를 못 읽어도 개체 정보만으로 만든다. */
export async function buildPassport(
  supabase: SupabaseClient,
  unit: MyProductRow,
): Promise<ProductPassport> {
  const { data } = await supabase
    .from("products")
    .select(
      "gtin, material_composition, recycled_content_pct, repairability_score, country_of_origin, dpp_data_source",
    )
    .eq("id", unit.model_id)
    .maybeSingle();

  const row = (data as DppRow | null) ?? null;
  const gtin = row?.gtin ?? null;

  return {
    gtin,
    serial_no: unit.serial_no,
    gs1_digital_link: gtin
      ? `/01/${gtin}/21/${encodeURIComponent(unit.serial_no)}`
      : null,
    material_composition: row?.material_composition ?? [],
    recycled_content_pct: num(row?.recycled_content_pct ?? null),
    repairability_score: num(row?.repairability_score ?? null),
    country_of_origin: row?.country_of_origin ?? null,
    registered_at: unit.registered_at,
    store: unit.store,
    year: unit.year,
    data_source: row?.dpp_data_source === "brand" ? "brand" : "demo",
    anchor: { target: "aura", status: "not_anchored" },
  };
}

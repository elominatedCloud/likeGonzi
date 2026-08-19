import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeProductId } from "@/lib/mock-db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProductRow = {
  id: string;
  slug: string | null;
};

type ProductUnitRow = {
  id: string;
  product_id: string;
};

export type OwnedProductRef = {
  unitId: string;
  slug: string;
};

/**
 * FE slug(stark)와 DB product_units UUID를 모두 받아 현재 사용자가 소유한 unit으로 해석한다.
 * product_units RLS가 소유권 필터를 담당하므로 타인의 unit은 null로 처리된다.
 */
export async function resolveOwnedProductRef(
  supabase: SupabaseClient,
  input: string,
): Promise<OwnedProductRef | null> {
  const ref = normalizeProductId(input.trim());
  if (!ref) return null;

  if (UUID_PATTERN.test(ref)) {
    const { data: unit } = await supabase
      .from("product_units")
      .select("id, product_id")
      .eq("id", ref)
      .maybeSingle();
    if (!unit) return null;

    const { data: product } = await supabase
      .from("products")
      .select("id, slug")
      .eq("id", (unit as ProductUnitRow).product_id)
      .maybeSingle();
    if (!product) return null;

    return {
      unitId: (unit as ProductUnitRow).id,
      slug: (product as ProductRow).slug ?? (unit as ProductUnitRow).id,
    };
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, slug")
    .eq("slug", ref)
    .maybeSingle();
  if (!product) return null;

  const { data: units } = await supabase
    .from("product_units")
    .select("id, product_id")
    .eq("product_id", (product as ProductRow).id)
    .limit(1);
  const unit = (units?.[0] as ProductUnitRow | undefined) ?? null;
  if (!unit) return null;

  return {
    unitId: unit.id,
    slug: (product as ProductRow).slug ?? ref,
  };
}

export async function resolveOwnedProductRefs(
  supabase: SupabaseClient,
  inputs: string[],
): Promise<{ refs: OwnedProductRef[]; missing: string[] }> {
  const uniqueInputs = [...new Set(inputs.map((input) => normalizeProductId(input.trim())))].filter(
    Boolean,
  );
  const resolved = await Promise.all(
    uniqueInputs.map(async (input) => ({
      input,
      ref: await resolveOwnedProductRef(supabase, input),
    })),
  );

  return {
    refs: resolved.flatMap(({ ref }) => (ref ? [ref] : [])),
    missing: resolved.flatMap(({ input, ref }) => (ref ? [] : [input])),
  };
}

/** DB unit UUID 목록을 FE가 이해하는 제품 slug 목록으로 되돌린다. */
export async function productSlugsForUnitIds(
  supabase: SupabaseClient,
  unitIds: string[],
): Promise<Record<string, string>> {
  const uniqueUnitIds = [...new Set(unitIds)];
  if (uniqueUnitIds.length === 0) return {};

  const { data: units } = await supabase
    .from("product_units")
    .select("id, product_id")
    .in("id", uniqueUnitIds);
  const unitRows = (units ?? []) as ProductUnitRow[];
  const productIds = [...new Set(unitRows.map((unit) => unit.product_id))];
  if (productIds.length === 0) return {};

  const { data: products } = await supabase
    .from("products")
    .select("id, slug")
    .in("id", productIds);
  const slugByProductId = Object.fromEntries(
    ((products ?? []) as ProductRow[]).map((product) => [
      product.id,
      product.slug ?? product.id,
    ]),
  );

  return Object.fromEntries(
    unitRows.map((unit) => [unit.id, slugByProductId[unit.product_id] ?? unit.id]),
  );
}

import assert from "node:assert/strict";
import test from "node:test";
import { toRepairDTO, type RepairRow } from "./mappers.ts";

const row: RepairRow = {
  id: "9f3c1d2e-0000-4000-8000-000000000000",
  product_unit_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  user_id: "cb27fa2d-7f61-4b58-b99b-bfe8322cb4aa",
  condition_tags: null,
  status: "submitted",
  title: "스트랩 수선",
  location: "접수 대기",
  thumbnail_url: null,
  thumbnail_path: null,
  memo: null,
  source: "user",
  ai_image_url: null,
  estimate_min: null,
  estimate_max: null,
  estimate_days: null,
  estimate_note: null,
  estimated_at: null,
  paid_at: null,
  is_demo_payment: true,
  created_at: "2026-05-12T04:05:06.000Z",
  updated_at: "2026-05-12T04:05:06.000Z",
};

test("접수번호는 접수일 + repair id로 만들어진다", () => {
  assert.equal(toRepairDTO(row).receipt_no, "R-20260512-9F3C");
});

test("product_id는 기본값이 unit UUID, slug를 넘기면 slug", () => {
  assert.equal(toRepairDTO(row).product_id, row.product_unit_id);
  assert.equal(toRepairDTO(row, "stark").product_id, "stark");
});

test("condition_tags가 null이어도 빈 배열로 내려간다", () => {
  assert.deepEqual(toRepairDTO(row).condition_tags, []);
});

test("Storage 서명 URL을 넘기면 thumbnail_url을 그것으로 대체한다", () => {
  const signed = "https://kwstxcaggtxnntwwpxto.supabase.co/storage/v1/object/sign/x";
  assert.equal(toRepairDTO(row, "stark", signed).thumbnail_url, signed);
});

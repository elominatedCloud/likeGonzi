import assert from "node:assert/strict";
import test from "node:test";
import { estimateRepair } from "./repair-estimate.ts";

test("부위와 증상으로 금액대와 기간이 정해진다", () => {
  const result = estimateRepair(["zipper", "stain"]);
  assert.equal(result.areaLabel, "지퍼");
  assert.equal(result.conditionLabel, "오염");
  // 지퍼 40,000~80,000 * 오염 0.7
  assert.equal(result.min, 28000);
  assert.equal(result.max, 56000);
});

test("찢어짐은 마모보다 비싸고 오래 걸린다", () => {
  const tear = estimateRepair(["handle", "tear"]);
  const wear = estimateRepair(["handle", "wear"]);
  assert.ok(tear.min > wear.min);
  assert.ok(tear.days > wear.days);
});

test("항상 하한이 상한보다 작거나 같다", () => {
  for (const area of ["handle", "strap", "zipper", "corner", "leather", "other"]) {
    for (const condition of ["stain", "wear", "scratch", "tear"]) {
      const result = estimateRepair([area, condition]);
      assert.ok(result.min <= result.max, `${area}/${condition}`);
    }
  }
});

test("태그가 없거나 모르는 값이면 기본 구간으로 떨어진다", () => {
  const empty = estimateRepair([]);
  const unknown = estimateRepair(["bogus"]);
  assert.deepEqual(
    { min: empty.min, max: empty.max },
    { min: unknown.min, max: unknown.max },
  );
  assert.ok(empty.min > 0);
});

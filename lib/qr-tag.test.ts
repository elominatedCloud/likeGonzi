import assert from "node:assert/strict";
import test from "node:test";
import { tagCodeFromScan } from "./qr-tag.ts";

test("전체 URL에서 tag 파라미터를 뽑는다", () => {
  assert.equal(
    tagCodeFromScan("https://storybook.mcm.com/start?tag=UNIT-STARK-0001"),
    "UNIT-STARK-0001",
  );
});

test("다른 파라미터가 섞여 있어도 tag만 뽑는다", () => {
  assert.equal(
    tagCodeFromScan("/start?claim=1&tag=CAMP-2026-SEOUL"),
    "CAMP-2026-SEOUL",
  );
});

test("코드만 인쇄된 태그도 받는다", () => {
  assert.equal(tagCodeFromScan("  UNIT-ELLA-0002 "), "UNIT-ELLA-0002");
});

test("태그가 없는 URL이나 엉뚱한 문자열은 null", () => {
  assert.equal(tagCodeFromScan("https://mcm.com/?utm_source=qr"), null);
  assert.equal(tagCodeFromScan("hello world"), null);
  assert.equal(tagCodeFromScan(""), null);
});

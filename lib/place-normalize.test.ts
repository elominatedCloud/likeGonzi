import assert from "node:assert/strict";
import test from "node:test";
import { normalizePlace } from "./place-normalize.ts";

test("한국어 원문에서 도시·국가를 뽑는다", () => {
  assert.deepEqual(normalizePlace("서울 성수동"), { city: "서울", country: "KR" });
  assert.deepEqual(normalizePlace("성수"), { city: "서울", country: "KR" });
});

test("나라 이름이 앞에 붙어도 도시로 매칭된다", () => {
  assert.deepEqual(normalizePlace("프랑스 파리"), { city: "파리", country: "FR" });
});

test("영문·대소문자 혼용도 처리한다", () => {
  assert.deepEqual(normalizePlace("Tokyo, Shibuya"), { city: "도쿄", country: "JP" });
});

test("표에 없는 장소는 비워 두고 원문만 남긴다", () => {
  assert.deepEqual(normalizePlace("우리 동네 카페"), { city: null, country: null });
  assert.deepEqual(normalizePlace(""), { city: null, country: null });
  assert.deepEqual(normalizePlace(null), { city: null, country: null });
});

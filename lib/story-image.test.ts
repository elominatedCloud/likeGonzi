import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDemoStoryImage } from "./story-image.ts";

const legacy = "/FE-namjun/assets/로그_타임라인-1.png";

test("Pina의 공통 Backpack 시드 이미지를 Wallet 이미지로 교정한다", () => {
  assert.equal(
    normalizeDemoStoryImage(legacy, "pina"),
    "/FE-namjun/assets/pina-bookstore-memory.png",
  );
});

test("사용자가 업로드한 Story 이미지는 변경하지 않는다", () => {
  assert.equal(
    normalizeDemoStoryImage("https://example.com/my-photo.jpg", "pina"),
    "https://example.com/my-photo.jpg",
  );
});

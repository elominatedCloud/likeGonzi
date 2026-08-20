const pptxgen = require("pptxgenjs");
const path = require("path");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";                 // 13.3 x 7.5
const W = 13.3, H = 7.5;
const BG = path.join(__dirname, "bg-dark.png");
const IMG = n => path.join(__dirname, n);

/**
 * 앱 화면 캡처 슬롯.
 * 파일이 있으면 그림을 넣고, 없으면 점선 자리만 그린다.
 * 캡처를 이 폴더에 떨궈두고 다시 돌리면 자동으로 채워진다.
 */
const fs = require("fs");
function shot(s, file, label, x, y, w, h, noLabel) {
  const f = path.join(__dirname, file);
  if (fs.existsSync(f)) {
    s.addImage({ path: f, x, y, w, h });
    s.addShape(p.ShapeType.rect, { x, y, w, h,
      fill: { type: "none" }, line: { color: C.line, width: 0.75 } });
  } else {
    s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06,
      fill: { color: "17140F" }, line: { color: C.line, width: 0.75, dashType: "dash" } });
    s.addText(label, { x: x + 0.1, y: y + h / 2 - 0.24, w: w - 0.2, h: 0.48,
      align: "center", fontFace: F, fontSize: 10.5, color: C.dim,
      lineSpacing: 16, margin: 0 });
  }
  if (!noLabel) s.addText(label.split("\n")[0], { x, y: y + h + 0.12, w, h: 0.28,
    align: "center", fontFace: F, fontSize: 11.5, color: C.muted, margin: 0 });
}

const C = {
  dark: "12100E", light: "F4F1EC", line: "3A3025",
  cognac: "C4915F", deep: "8B5A2B", white: "FFFFFF", ink: "1A1613",
  muted: "9A8F84", dim: "6E6459",
};
const F = "Apple SD Gothic Neo";

/* ── 프리미티브 ─────────────────────────────
   박스를 쓰지 않는다. 여백과 헤어라인으로만 구분한다. */

const dark = s => { s.background = { color: C.dark }; s.addImage({ path: BG, x: 0, y: 0, w: W, h: H }); };

const mark = s => s.addText("MCM STORYBOOK", {
  x: W - 3.4, y: H - 0.55, w: 2.9, h: 0.3, align: "right",
  fontFace: F, fontSize: 9, color: "4A423A", charSpacing: 1.4 });

const eyebrow = (s, t) => s.addText(t, {
  x: 0, y: 0.62, w: W, h: 0.34, align: "center",
  fontFace: F, fontSize: 11.5, bold: true, color: C.cognac, charSpacing: 3.4 });

const sub = (s, t, y) => s.addText(t, {
  x: 1.1, y: y || 2.04, w: W - 2.2, h: 0.42, align: "center",
  fontFace: F, fontSize: 15, color: C.muted, margin: 0 });

const rule = (s, x, y, w) => s.addShape(p.ShapeType.line,
  { x, y, w, h: 0, line: { color: C.line, width: 0.75 } });

/** 한 줄 슬라이드. 화면에 이것만 남는다. */
function statement(s, lines, opt = {}) {
  dark(s);
  const size = opt.size || (lines.length > 1 ? 40 : 48);
  s.addText(lines.map((l, i) => ({
    text: l.t !== undefined ? l.t : l,
    options: { breakLine: i < lines.length - 1, color: l.c || C.white, bold: true },
  })), {
    x: 1.0, y: 2.5, w: W - 2.0, h: 2.5, align: "center", valign: "middle",
    fontFace: F, fontSize: size, lineSpacing: size * 1.36, margin: 0 });
  if (opt.note) s.addText(opt.note, {
    x: 1.6, y: 5.3, w: W - 3.2, h: 0.4, align: "center",
    fontFace: F, fontSize: 15, color: C.muted, margin: 0 });
  mark(s);
}

/** 제목 슬라이드 상단부 */
function head(s, eb, lines, opt = {}) {
  dark(s);
  eyebrow(s, eb);
  const size = opt.size || 34;
  s.addText(lines.map((l, i) => ({
    text: l.t !== undefined ? l.t : l,
    options: { breakLine: i < lines.length - 1, color: l.c || C.white, bold: true },
  })), {
    x: 0.8, y: 1.14, w: W - 1.6, h: lines.length > 1 ? 1.5 : 0.9, align: "center",
    fontFace: F, fontSize: size, lineSpacing: size * 1.34, valign: "top", margin: 0 });
  mark(s);
}

/** 3열. 박스 없이 세로 헤어라인으로만 나눈다. */
function columns(s, items, y0) {
  const y = y0 || 3.0, colW = (W - 2.4) / items.length;
  items.forEach((it, i) => {
    const x = 1.2 + i * colW, hi = it[3];
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: y - 0.1, w: 0, h: 2.1,
      line: { color: C.line, width: 0.75 } });
    s.addText(it[0], { x: x + 0.34, y, w: colW - 0.7, h: 0.32, fontFace: F,
      fontSize: 12, color: hi ? C.cognac : C.dim, charSpacing: 1.4, margin: 0 });
    s.addText(it[1], { x: x + 0.34, y: y + 0.44, w: colW - 0.6, h: 0.5, fontFace: F,
      fontSize: 24, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(it[2], { x: x + 0.34, y: y + 1.12, w: colW - 0.72, h: 0.9, fontFace: F,
      fontSize: 14, color: C.muted, lineSpacing: 23, margin: 0 });
  });
}

/** 행 목록. 가로 헤어라인만. */
function rows(s, items, y0, cols) {
  const y = y0 || 2.4;
  items.forEach((it, i) => {
    const ry = y + i * 0.82;
    if (i > 0) rule(s, 1.2, ry - 0.1, W - 2.4);
    const hi = it[cols.hiIndex !== undefined && i >= cols.hiIndex];
    it.forEach((cell, j) => {
      if (j >= cols.x.length) return;
      s.addText(cell, {
        x: cols.x[j], y: ry + (j === 0 ? 0.14 : 0.18), w: cols.w[j], h: 0.36,
        align: cols.align ? cols.align[j] : "left", fontFace: F,
        fontSize: j === 0 ? 17 : 13.5, bold: j === 0,
        color: j === 0 ? (it.hi ? C.cognac : C.white) : C.muted, margin: 0 });
    });
  });
}

function chapter(n, title, subtitle) {
  const s = p.addSlide();
  s.background = { color: C.light };
  s.addText(`Chapter ${n}`, { x: 1.1, y: 2.86, w: 5, h: 0.36, fontFace: F,
    fontSize: 14, bold: true, color: C.deep, charSpacing: 2.6, margin: 0 });
  s.addText(title, { x: 1.08, y: 3.34, w: 11, h: 0.9, fontFace: F,
    fontSize: 40, bold: true, color: C.ink, margin: 0 });
  s.addText(subtitle, { x: 1.1, y: 4.46, w: 10.5, h: 0.38, fontFace: F,
    fontSize: 15, color: "7A716A", margin: 0 });
  s.addText("MCM STORYBOOK", { x: W - 3.4, y: H - 0.55, w: 2.9, h: 0.3,
    align: "right", fontFace: F, fontSize: 9, color: "B3ABA3", charSpacing: 1.4 });
}

/* ═══ 01 표지 ═══ */
{
  const s = p.addSlide(); dark(s);
  s.addText([
    { text: "MCM", options: { color: C.white, breakLine: true } },
    { text: "Storybook", options: { color: C.cognac } },
  ], { x: 0.9, y: 2.42, w: 11.6, h: 2.5, fontFace: F, fontSize: 72, bold: true,
    lineSpacing: 96, charSpacing: -1, margin: 0 });
  s.addText("흠을 지우지 않습니다. 나의 것으로 만듭니다", {
    x: 0.98, y: 5.28, w: 11, h: 0.42, fontFace: F, fontSize: 18,
    color: C.muted, margin: 0 });
  s.addText("Challenge 03 · 360° 고객 경험        2026.08", {
    x: 0.98, y: 5.86, w: 11, h: 0.34, fontFace: F, fontSize: 13, color: C.dim, margin: 0 });
  s.addNotes("MCM 스토리북입니다. 제품과 함께한 시간을 한 줄로 남기고, 흠이 생기면 그 자리를 나만의 것으로 만드는 서비스입니다.");
}

/* ═══ 01b 질문 ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "3년을 함께한 가방." },
    { t: "그 기록은 지금 어디 있습니까?", c: C.cognac },
  ], { size: 40 });
  s.addNotes("사진은 갤러리 어딘가에 있고, 영수증은 잃어버렸고, 수선 이력은 매장 전산에만 있습니다. 3년을 같이 다녔는데 그걸 한 줄로 보여줄 방법이 없습니다.");
}

/* ═══ 16 타임라인 ═══ */
{
  const s = p.addSlide();
  head(s, "SOLUTION", ["하나의 타임라인"], { size: 40 });
  s.addText("CHALLENGE 03 · 360° 고객 경험", {
    x: 0, y: 2.06, w: W, h: 0.32, align: "center", fontFace: F,
    fontSize: 11.5, bold: true, color: C.dim, charSpacing: 2.4, margin: 0 });
  const steps = ["발견", "구매", "사용", "관리", "수선", "물려주기"];
  const gap = (W - 2.4) / steps.length;
  s.addShape(p.ShapeType.line, { x: 1.2 + gap / 2, y: 3.92, w: (W - 2.4) - gap, h: 0,
    line: { color: C.line, width: 1 } });
  steps.forEach((t, i) => {
    const cx = 1.2 + gap * (i + 0.5), on = i >= 3, r = on ? 0.19 : 0.13;
    s.addShape(p.ShapeType.ellipse, { x: cx - r / 2, y: 3.92 - r / 2, w: r, h: r,
      fill: { color: on ? C.cognac : C.muted }, line: { type: "none" } });
    s.addText(t, { x: cx - gap / 2, y: 4.28, w: gap, h: 0.36, align: "center",
      fontFace: F, fontSize: 17, bold: on, color: on ? C.white : C.muted, margin: 0 });
  });
  s.addText("내가 남긴 기록과 브랜드가 남긴 기록이 같은 줄에 흐릅니다", {
    x: 1.0, y: 5.22, w: W - 2, h: 0.42, align: "center", fontFace: F,
    fontSize: 22, bold: true, color: C.white, margin: 0 });
  s.addText("이 둘이 같이 있는 곳은 지금 없습니다", {
    x: 1.0, y: 5.76, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  s.addNotes("별도 앱 설치가 없습니다. 제품의 QR·NFC가 진입점입니다. 등록하면 구매 기록이 첫 줄로 자동 생성돼 빈 화면을 보여주지 않습니다.");
}

/* ═══ 02b 360 여정 ═══ */
{
  const s = p.addSlide();
  head(s, "360° CUSTOMER JOURNEY", ["발견부터 다음 소유자까지"], { size: 36 });
  s.addText("CHALLENGE 03 · 360° 고객 경험", {
    x: 0, y: 2.02, w: W, h: 0.32, align: "center", fontFace: F,
    fontSize: 11.5, bold: true, color: C.dim, charSpacing: 2.4, margin: 0 });

  const legs = [
    ["발견",  "길거리 캠페인 QR",   false],
    ["구매",  "MCM 매장",          false],
    ["개봉",  "박스 QR·NFC 스캔",   true],
    ["등록",  "제품이 내 것이 된다", true],
    ["기록",  "Story · Care",      true],
    ["수선",  "복원 또는 REMADE",   true],
    ["이전",  "다음 소유자에게",     false],
  ];
  const gap = (W - 1.8) / legs.length;

  // 03 안에 나머지 둘이 들어온다. 구간을 브래킷으로 얹는다.
  [["CHALLENGE 02 · 인터랙티브 리테일", 0, 2],
   ["CHALLENGE 01 · AI 프로덕트", 4, 5]].forEach(([label, a, b]) => {
    const x0 = 0.9 + gap * a + 0.14, x1 = 0.9 + gap * (b + 1) - 0.14;
    s.addShape(p.ShapeType.line, { x: x0, y: 3.06, w: x1 - x0, h: 0,
      line: { color: C.deep, width: 0.75 } });
    [x0, x1].forEach(x => s.addShape(p.ShapeType.line, { x, y: 3.06, w: 0, h: 0.11,
      line: { color: C.deep, width: 0.75 } }));
    s.addText(label, { x: x0, y: 2.62, w: x1 - x0, h: 0.3, align: "center",
      fontFace: F, fontSize: 10.5, bold: true, color: C.deep, charSpacing: 1.6, margin: 0 });
  });

  s.addShape(p.ShapeType.line, { x: 0.9 + gap / 2, y: 3.5, w: (W - 1.8) - gap, h: 0,
    line: { color: C.line, width: 1 } });
  legs.forEach((l, i) => {
    const cx = 0.9 + gap * (i + 0.5), on = l[2], r = on ? 0.2 : 0.13;
    s.addShape(p.ShapeType.ellipse, { x: cx - r / 2, y: 3.5 - r / 2, w: r, h: r,
      fill: { color: on ? C.cognac : C.muted }, line: { type: "none" } });
    s.addText(l[0], { x: cx - gap / 2, y: 3.86, w: gap, h: 0.36, align: "center",
      fontFace: F, fontSize: 17, bold: true, color: on ? C.white : C.muted, margin: 0 });
    s.addText(l[1], { x: cx - gap / 2, y: 4.28, w: gap, h: 0.6, align: "center",
      fontFace: F, fontSize: 11.5, color: C.muted, lineSpacing: 17, margin: 0 });
  });
  s.addText("오프라인에서 발견하고 사서, 온라인에서 남기고 고치고 넘깁니다", {
    x: 1.0, y: 5.36, w: W - 2, h: 0.42, align: "center", fontFace: F,
    fontSize: 20, bold: true, color: C.white, margin: 0 });
  s.addText("03을 제대로 풀면 01과 02가 그 안으로 들어옵니다", {
    x: 1.0, y: 5.9, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 14, color: C.cognac, margin: 0 });
  mark(s);
  s.addNotes("3번 과제는 발견부터 구매 이후까지입니다. 길거리 캠페인 QR로 브랜드를 발견하고, 매장에서 사고, 박스의 QR이나 NFC로 개봉하고, 등록하면 그때부터 기록과 관리가 이어집니다. 마지막은 다음 소유자에게 공식 이력이 그대로 넘어가는 것입니다. 오프라인과 온라인을 QR과 NFC가 잇습니다. 저희가 고른 건 3번 하나지만 이 트랙을 제대로 풀면 나머지 둘이 그 안으로 들어옵니다. 캠페인 QR부터 개봉까지가 2번 인터랙티브 리테일이고, 사진 한 장으로 기록이 만들어지고 손상 자리에 시안이 그려지는 구간이 1번 AI 프로덕트입니다. 순간을 좋게 만드는 것만으로는 끊긴 여정이 이어지지 않습니다.");
}

/* ═══ 03 네 가지 축 ═══ */
{
  const s = p.addSlide();
  head(s, "WHAT WE BUILT", ["타임라인 위에 네 가지가 얹힙니다"], { size: 34 });
  const axes = [
    ["STORY", "기록", "사진 한 장을 올리면\nAI가 문장으로 남긴다", "구현"],
    ["CARE · REPAIR", "제품 수명 연장", "세척 · 보강 · 부품 교체\n부위를 눌러 접수한다", "구현"],
    ["REMADE", "선택형 커스터마이징", "흠 위에 무늬를 새긴다\nAI 시안 · MCM 제작", "구현"],
    ["TRANSFER", "다음 소유자로", "공식 이력이 그대로\n넘어간다", "로드맵"],
  ];
  const gap = (W - 1.8) / 4;
  axes.forEach((a, i) => {
    const x = 0.9 + gap * i, hi = i === 1 || i === 2;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 2.6, w: 0, h: 2.5,
      line: { color: C.line, width: 0.75 } });
    s.addText(a[0], { x: x + 0.3, y: 2.66, w: gap - 0.6, h: 0.3, fontFace: F,
      fontSize: 11, bold: true, color: C.cognac, charSpacing: 1.4, margin: 0 });
    s.addText(a[1], { x: x + 0.3, y: 3.04, w: gap - 0.55, h: 0.44, fontFace: F,
      fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(a[2], { x: x + 0.3, y: 3.64, w: gap - 0.62, h: 0.9, fontFace: F,
      fontSize: 13, color: C.muted, lineSpacing: 21, margin: 0 });
    s.addText(a[3], { x: x + 0.3, y: 4.66, w: gap - 0.6, h: 0.3, fontFace: F,
      fontSize: 11, color: a[3] === "구현" ? C.cognac : C.dim, margin: 0 });
  });
  s.addText("네 가지가 각각의 앱이 아니라, 하나의 타임라인 위 레이어입니다", {
    x: 1.0, y: 5.5, w: W - 2, h: 0.42, align: "center", fontFace: F,
    fontSize: 18, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("Story는 기록입니다. Care와 Repair는 제품 수명을 늘립니다. REMADE는 선택형 커스터마이징이고, 소유권 이전은 다음 사용자에게 공식 이력을 넘깁니다. 네 가지가 각각 떨어진 기능이 아니라 하나의 타임라인 위에 쌓이는 레이어입니다. 소유권 이전은 스키마까지 있고 화면은 다음 단계입니다.");
}

/* ═══ 04 REMADE 실물 ═══ */
{
  const s = p.addSlide();
  head(s, "REMADE", ["긁힌 자리에 무늬를 새깁니다"], { size: 36 });
  const shots = [
    [IMG("damage.jpg"),   "긁혔다",  false],
    [IMG("remade-1.jpg"), "시안 A", true],
    [IMG("remade-2.jpg"), "시안 B", true],
    [IMG("remade-3.jpg"), "시안 C", true],
  ];
  const iw = 2.62, gapx = 0.3, total = shots.length * iw + (shots.length - 1) * gapx;
  shots.forEach((sh, i) => {
    const x = (W - total) / 2 + i * (iw + gapx);
    s.addImage({ path: sh[0], x, y: 2.42, w: iw, h: iw });
    if (sh[2]) s.addShape(p.ShapeType.rect, { x, y: 2.42, w: iw, h: iw,
      fill: { type: "none" }, line: { color: C.cognac, width: 1.25 } });
    s.addText(sh[1], { x, y: 2.42 + iw + 0.14, w: iw, h: 0.32, align: "center",
      fontFace: F, fontSize: 13, bold: sh[2],
      color: sh[2] ? C.cognac : C.muted, margin: 0 });
  });
  s.addText("실제 생성 결과입니다. 사용자는 셋 중 하나를 고르고, 제작은 MCM 매장이 합니다.", {
    x: 1.0, y: 6.06, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 16, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("이건 목업이 아니라 실제로 생성된 결과입니다. 손상 사진과 부위를 넣으면 AI가 그 자리에 어울리는 시안을 세 개 만듭니다. 사용자는 고르기만 하고 실물 제작은 MCM 매장이 합니다. 수선이 서비스가 아니라 상품이 됩니다.");
}

chapter(1, "왜 이걸 만들었나", "사용 빈도라는 축을 하나 더 두면 자리가 달라진다");

/* ═══ 03 진술 ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "럭셔리의 가치는 여전히" },
    { t: "“흠 없는 상태”를 기준으로 평가됩니다", c: C.cognac },
  ], { size: 34, note: "그래서 상할까 봐 자주 들지 못하는 가방이 생깁니다" });
  s.addNotes("리셀 시세도, 감정도, 광고도 전부 흠이 없는 상태를 기준으로 매깁니다. 그러니 사는 순간부터 값이 떨어지는 걸 지켜보게 되고, 상할까 봐 자주 들지 못하는 가방이 생깁니다.");
}

/* ═══ 05 포지셔닝 맵 ═══ */
{
  const s = p.addSlide();
  head(s, "POSITIONING", ["사용 빈도로 보면 자리가 다릅니다"], { size: 34 });

  const X0 = 2.3, Y0 = 6.35, PW = 8.9, PH = 3.7;
  const zx = X0 + PW * 0.46, zy = Y0 - PH * 0.82, zw = PW * 0.6, zh = PH * 0.64;
  s.addShape(p.ShapeType.roundRect, { x: zx, y: zy, w: zw, h: zh, rectRadius: 0.08,
    fill: { color: C.deep, transparency: 88 }, line: { color: C.cognac, width: 1 } });
  s.addText("매일 드는 럭셔리", { x: zx, y: zy - 0.36, w: zw, h: 0.3, align: "center",
    fontFace: F, fontSize: 12.5, bold: true, color: C.cognac, charSpacing: 1.4, margin: 0 });

  s.addShape(p.ShapeType.line, { x: X0, y: Y0, w: PW, h: 0, line: { color: C.line, width: 1 } });
  s.addShape(p.ShapeType.line, { x: X0, y: Y0 - PH, w: 0, h: PH, line: { color: C.line, width: 1 } });
  s.addText("↑ 가격", { x: X0 - 0.06, y: Y0 - PH - 0.38, w: 1.4, h: 0.3, fontFace: F,
    fontSize: 12, color: C.dim, margin: 0 });
  s.addText("일상 사용 빈도  →", { x: X0, y: Y0 + 0.12, w: PW, h: 0.3, align: "center",
    fontFace: F, fontSize: 12, color: C.dim, margin: 0 });

  const dots = [
    [0.12, 0.86, "에르메스 · 샤넬 · 루이비통", "R", false],
    [0.60, 0.42, "Coach · Michael Kors", "R", false],
    [0.82, 0.24, "Longchamp", "R", false],
    [0.74, 0.64, "MCM", "R", true],
    [0.92, 0.07, "매스 브랜드", "L", false],
  ];
  dots.forEach(d => {
    const cx = X0 + PW * d[0], cy = Y0 - PH * d[1], r = d[4] ? 0.26 : 0.15;
    s.addShape(p.ShapeType.ellipse, { x: cx - r / 2, y: cy - r / 2, w: r, h: r,
      fill: { color: d[4] ? C.cognac : C.muted }, line: { type: "none" } });
    const right = d[3] === "R";
    s.addText(d[2], { x: right ? cx + 0.2 : cx - 3.4, y: cy - 0.19, w: 3.2, h: 0.38,
      align: right ? "left" : "right", fontFace: F, fontSize: d[4] ? 23 : 14.5,
      bold: d[4], color: d[4] ? C.white : C.muted, margin: 0 });
  });
  s.addText("Coach는 접근 가능 럭셔리 1위 · Longchamp $100–250 · Michael Kors $150–800 (2026)", {
    x: 0.8, y: H - 0.46, w: W - 1.6, h: 0.34, align: "center", fontFace: F,
    fontSize: 11, color: C.dim, margin: 0 });
  s.addNotes("가격만 보면 MCM은 준명품입니다. 축을 하나 더 두면 자리가 달라집니다. 일상 사용 빈도입니다. 3대장은 가격이 높아 옷장에 머뭅니다. 매스 브랜드는 매일 쓰지만 애착이 없습니다. 이 구간이 매일 들 수 있으면서 애착이 생기는 유일한 자리입니다.");
}

/* ═══ 06 진술 ═══ */
{
  const s = p.addSlide();
  dark(s);
  s.addImage({ path: IMG("product.png"), x: 0.9, y: 1.5, w: 4.5, h: 4.5 });
  s.addText("MCM은\n매일 드는 가방입니다", {
    x: 6.1, y: 2.3, w: 6.3, h: 1.9, fontFace: F, fontSize: 40, bold: true,
    color: C.white, lineSpacing: 58, margin: 0 });
  s.addText("그래서 언제든 고칠 수 있어야 합니다", {
    x: 6.15, y: 4.42, w: 6.3, h: 0.42, fontFace: F, fontSize: 18,
    color: C.cognac, margin: 0 });
  mark(s);
  s.addNotes("가격대가 그걸 허락합니다. 3대장은 못 하는 일입니다.");
}

/* ═══ 08 3열 ═══ */
{
  const s = p.addSlide();
  head(s, "THE PARADOX", ["매일 쓰면 상합니다"], { size: 40 });
  sub(s, "그런데 상함을 다루는 방식이 저마다 다릅니다", 2.06);
  columns(s, [
    ["3대장", "안 씁니다", "그래서 안 상합니다.\n대신 함께한 시간도 없습니다.", false],
    ["매스 브랜드", "버립니다", "애착이 없어서\n고칠 이유가 없습니다.", false],
    ["MCM", "고칩니다", "버리기엔 아깝습니다.\n고쳐 쓸 값은 합니다.", true],
  ], 3.42);
  s.addNotes("3대장은 안 쓰니까 안 상합니다. 매스 브랜드는 상하면 버립니다. MCM 구간만 매일 쓰고, 상하고, 버리기엔 아까운 물건입니다.");
}

/* ═══ 10 실제 불편 ═══ */
{
  const s = p.addSlide();
  head(s, "WHAT ACTUALLY HURTS", ["기록이 없으면 값을 잃습니다"], { size: 36 });
  const facts = [
    ["30–40%", "같은 제품도 구성품과 이력 유무로\n리셀 가격이 갈린다"],
    ["1위", "명품 플랫폼에 소비자가 요구한 개선점\n— 정품 보증 시스템 강화"],
    ["50개 중 1개", "감정에서 걸러진 가품 비율.\n40%는 백화점·아웃렛에서 산 것"],
  ];
  const gap = (W - 2.4) / 3;
  facts.forEach((f, i) => {
    const x = 1.2 + gap * i;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 3.0, w: 0, h: 1.8,
      line: { color: C.line, width: 0.75 } });
    s.addText(f[0], { x: x + 0.34, y: 3.06, w: gap - 0.6, h: 0.66, fontFace: F,
      fontSize: 40, bold: true, color: C.cognac, margin: 0 });
    s.addText(f[1], { x: x + 0.34, y: 3.92, w: gap - 0.72, h: 0.9, fontFace: F,
      fontSize: 14, color: C.muted, lineSpacing: 23, margin: 0 });
  });
  s.addText("보증서 분실과 일련번호 불일치가 명품 거래 분쟁의 주된 원인입니다", {
    x: 1.0, y: 5.28, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 16, color: C.muted, margin: 0 });
  s.addText("그런데 지금 이 문제를 푸는 브랜드가 없습니다", {
    x: 1.0, y: 5.84, w: W - 2, h: 0.44, align: "center", fontFace: F,
    fontSize: 22, bold: true, color: C.cognac, margin: 0 });
  s.addText("트렌비 감정센터 · 명품 플랫폼 소비자 조사 · 한국소비자원 (2025)", {
    x: 0.8, y: H - 0.5, w: W - 1.6, h: 0.34, align: "center", fontFace: F,
    fontSize: 11, color: C.dim, margin: 0 });
  s.addNotes("불편은 감성이 아니라 돈입니다. 같은 제품도 구성품과 이력이 있느냐에 따라 리셀 가격이 30에서 40퍼센트 갈립니다. 명품 플랫폼에 소비자가 요구한 개선점 1위가 정품 보증 시스템이었고, 감정에서 걸러진 가품이 50개 중 1개입니다. 그런데 그 증빙을 지금은 각자 종이로 보관합니다. 보증서를 잃어버리는 순간 값도 사라집니다.");
}

chapter(2, "흠이 역사가 된다", "고칠수록 나만의 것이 되는 이유");

/* ═══ 11 3열 계보 ═══ */
{
  const s = p.addSlide();
  head(s, "THIS IS NOT NEW", ["같은 생각이 이미 세 번 있었습니다"], { size: 34 });
  const eras = [
    ["lin-joseon.jpg",   "조선",        "신사임당의 포도",
     "치마 얼룩 위에 포도를 그렸다.\n버려질 옷이 오히려 팔렸다.", false],
    ["lin-kintsugi.jpg", "일본",        "킨츠기 金継ぎ",
     "깨진 자리를 금으로 잇는다.\n흉터를 감추지 않고 드러낸다.", false],
    ["lin-harlem.jpg",   "1988 · 할렘", "Dapper Dan",
     "MCM 코냑 비세토스를 뜯어\n무대의상으로 다시 꿰맸다.", true],
  ];
  const iw = 2.75, gapx = 0.62, total = 3 * iw + 2 * gapx, x0 = (W - total) / 2;
  eras.forEach((e, i) => {
    const x = x0 + i * (iw + gapx);
    s.addImage({ path: IMG(e[0]), x, y: 2.36, w: iw, h: iw * 0.78 });
    if (e[4]) s.addShape(p.ShapeType.rect, { x, y: 2.36, w: iw, h: iw * 0.78,
      fill: { type: "none" }, line: { color: C.cognac, width: 1.25 } });
    s.addText(e[1], { x, y: 4.62, w: iw, h: 0.3, fontFace: F,
      fontSize: 11.5, color: C.cognac, charSpacing: 1.4, margin: 0 });
    s.addText(e[2], { x, y: 4.96, w: iw + 0.3, h: 0.42, fontFace: F,
      fontSize: 19, bold: true, color: C.white, margin: 0 });
    s.addText(e[3], { x, y: 5.5, w: iw + 0.2, h: 0.82, fontFace: F,
      fontSize: 12.5, color: C.muted, lineSpacing: 20, margin: 0 });
  });
  s.addText("이미지는 AI 생성 · 신사임당은 전해지는 일화 · Dapper Dan은 브랜드 기록 (Highsnobiety, MCM Heritage)", {
    x: 0.8, y: H - 0.5, w: W - 1.6, h: 0.32, align: "center", fontFace: F,
    fontSize: 10.5, color: C.dim, margin: 0 });
  mark(s);
  s.addNotes("신사임당이 잔칫상에서 남의 치마에 튄 얼룩 위에 포도를 그린 이야기가 있습니다. 일본에는 깨진 그릇을 금으로 잇는 킨츠기가 있습니다. 그리고 1988년 할렘에서 같은 일이 일어났습니다. 이미지는 저작권 때문에 AI로 생성했고 화면 아래에 밝혀뒀습니다.");
}

/* ═══ 12 진술 ★ ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "내 가방의 역사이자," },
    { t: "MCM의 역사입니다", c: C.cognac },
  ], { size: 38, note: "Dapper Dan이 뜯어 만든 옷이 이 브랜드를 아이콘으로 만들었습니다" });
  s.addNotes("Eric B. & Rakim, Salt-N-Pepa, LL Cool J가 그 옷을 입었습니다. 2020년에는 그 계보의 스타일리스트 Misa Hylton이 MCM 글로벌 크리에이티브 파트너가 됐습니다.");
}

/* ═══ 13 페르소나 ═══ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHO WE BUILD FOR");
  s.addText("“무리해서 산 거 아니야.\n3년째 잘 쓰고 있어.”", {
    x: 1.0, y: 2.42, w: W - 2, h: 1.7, align: "center", fontFace: F,
    fontSize: 40, bold: true, color: C.white, lineSpacing: 58, margin: 0 });
  s.addText("서지우 · 28 · 뷰티 브랜드 마케터 4년차", {
    x: 1.0, y: 4.44, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 15, color: C.muted, margin: 0 });
  rule(s, 4.4, 5.24, 4.5);
  s.addText("과시하고 싶다. 그런데 과시로 보이면 안 된다.", {
    x: 1.0, y: 5.52, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 20, bold: true, color: C.cognac, margin: 0 });
  s.addText("흠이 서사가 되면 흠이 있는 쪽이 더 당당합니다", {
    x: 1.0, y: 6.06, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  mark(s);
  s.addNotes("큰 지출을 했을 때 두려운 건 통장이 아니라 평판입니다. 연령대 실측은 미확보이며 페르소나는 가설입니다.");
}

chapter(3, "어떻게 동작하나", "AI가 마찰을 없애고 흠을 무늬로 바꾼다");

/* ═══ 22 마찰 ═══ */
{
  const s = p.addSlide();
  head(s, "THE FRICTION", ["기록은 흩어졌다가 사라집니다"], { size: 36 });
  const three = [
    ["사진", "SNS와 갤러리에"],
    ["구매 · 보증", "종이 영수증과 카드에"],
    ["수선 이력", "브랜드 내부에만"],
  ];
  const gap = (W - 2.4) / 3;
  three.forEach((t, i) => {
    const x = 1.2 + gap * i;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 3.1, w: 0, h: 1.2,
      line: { color: C.line, width: 0.75 } });
    s.addText(t[0], { x: x + 0.34, y: 3.2, w: gap - 0.6, h: 0.46, fontFace: F,
      fontSize: 24, bold: true, color: C.white, margin: 0 });
    s.addText(t[1], { x: x + 0.34, y: 3.82, w: gap - 0.72, h: 0.4, fontFace: F,
      fontSize: 14, color: C.muted, margin: 0 });
  });
  s.addText("모으라고 하면 아무도 하지 않습니다", {
    x: 1.0, y: 4.86, w: W - 2, h: 0.44, align: "center", fontFace: F,
    fontSize: 24, bold: true, color: C.white, margin: 0 });
  rule(s, 4.4, 5.56, 4.5);
  s.addText("사진 고르고, 날짜 쓰고, 장소 쓰고, 설명 쓰고 — 입력창을 더 주면 더 안 합니다", {
    x: 1.0, y: 5.82, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  s.addNotes("기록이 값이 된다는 건 앞에서 봤습니다. 그런데 지금은 세 군데로 흩어져 있고, 모으라고 하면 아무도 하지 않습니다. 여기가 AI가 들어갈 자리입니다.");
}

/* ═══ 18 AI 3열 ═══ */
{
  const s = p.addSlide();
  head(s, "HOW WE USE AI", ["사진을 올리면 AI가 알아서 기록합니다"], { size: 32 });
  sub(s, "사용자가 하는 일은 사진 한 장과 칩 세 번뿐입니다", 2.06);
  columns(s, [
    ["기록", "문장을 쓴다", "장소·날짜·제품을 엮어\n한 편의 글로 만든다.", false],
    ["축적", "이야기로 묶는다", "흩어진 기록을\n하나의 Recap으로.", false],
    ["수선", "그 자리에 그린다", "손상 부위에 어울리는\n리폼 시안 3안.", true],
  ], 3.42);
  s.addText("제품 상태 판정에는 AI를 쓰지 않습니다. 그건 기록 기반 계산입니다.", {
    x: 0.8, y: H - 0.78, w: W - 1.6, h: 0.34, align: "center", fontFace: F,
    fontSize: 11, color: C.dim, margin: 0 });
  s.addNotes("기존 서비스는 사용자에게 입력을 요구했습니다. 저희는 반대로 갑니다.");
}

/* ═══ 18b AI 레이어 ═══ */
{
  const s = p.addSlide();
  head(s, "WHY NOT A PHOTO APP", ["사진 앱에는 없는 재료가 들어갑니다"], { size: 32 });

  const ins = ["사진", "제품 ID · 시리얼", "구매 · 수선 이력", "DPP 여권 정보"];
  ins.forEach((t, i) => {
    const y = 2.62 + i * 0.62;
    s.addShape(p.ShapeType.roundRect, { x: 0.95, y, w: 2.9, h: 0.5, rectRadius: 0.06,
      fill: { color: "1B1712" }, line: { color: C.line, width: 0.75 } });
    s.addText(t, { x: 0.95, y: y + 0.12, w: 2.9, h: 0.3, align: "center", fontFace: F,
      fontSize: 13, color: i === 0 ? C.muted : C.white, margin: 0 });
  });
  s.addText("사진 앱이 가진 건 첫 줄 하나뿐입니다", { x: 0.95, y: 5.26, w: 2.9, h: 0.5,
    align: "center", fontFace: F, fontSize: 11.5, color: C.dim, lineSpacing: 17, margin: 0 });

  s.addText("→", { x: 4.0, y: 3.52, w: 0.5, h: 0.4, align: "center", fontFace: F,
    fontSize: 20, color: C.dim, margin: 0 });

  s.addShape(p.ShapeType.roundRect, { x: 4.7, y: 2.62, w: 2.3, h: 2.5, rectRadius: 0.08,
    fill: { color: "1B1712" }, line: { color: C.cognac, width: 1.5 } });
  s.addText("AI 레이어", { x: 4.7, y: 3.4, w: 2.3, h: 0.4, align: "center", fontFace: F,
    fontSize: 18, bold: true, color: C.cognac, margin: 0 });
  s.addText("gpt-4o-mini\ngpt-image-1-mini", { x: 4.7, y: 3.9, w: 2.3, h: 0.6, align: "center",
    fontFace: F, fontSize: 11, color: C.muted, lineSpacing: 16, margin: 0 });

  s.addText("→", { x: 7.2, y: 3.52, w: 0.5, h: 0.4, align: "center", fontFace: F,
    fontSize: 20, color: C.dim, margin: 0 });

  const outs = [
    ["Story", "사진을 문장으로", "구현"],
    ["Recap", "기록을 이야기로", "구현"],
    ["Care Score", "기록 기반 규칙 계산", "AI 아님"],
    ["REMADE", "손상 자리 시안 생성", "구현"],
  ];
  outs.forEach((o, i) => {
    const y = 2.62 + i * 0.62, ai = o[2] === "구현";
    s.addShape(p.ShapeType.roundRect, { x: 7.9, y, w: 4.45, h: 0.5, rectRadius: 0.06,
      fill: { color: "1B1712" }, line: { color: ai ? C.cognac : C.line, width: ai ? 1.1 : 0.75 } });
    s.addText(o[0], { x: 8.15, y: y + 0.12, w: 1.5, h: 0.3, fontFace: F,
      fontSize: 13.5, bold: true, color: ai ? C.cognac : C.white, margin: 0 });
    s.addText(o[1], { x: 9.55, y: y + 0.13, w: 1.9, h: 0.28, fontFace: F,
      fontSize: 11.5, color: C.muted, margin: 0 });
    s.addText(o[2], { x: 11.3, y: y + 0.13, w: 0.85, h: 0.28, align: "right", fontFace: F,
      fontSize: 10.5, color: ai ? C.cognac : C.dim, margin: 0 });
  });
  s.addText("제품 상태는 AI가 판정하지 않습니다. 등록된 기록으로 계산합니다.", {
    x: 7.9, y: 5.26, w: 4.45, h: 0.5, align: "center", fontFace: F,
    fontSize: 11.5, color: C.dim, lineSpacing: 17, margin: 0 });

  rule(s, 0.95, 5.94, W - 1.9);
  s.addText("같은 사진이라도 어느 제품인지, 언제 샀는지, 무엇을 고쳤는지를 알고 씁니다", {
    x: 1.0, y: 6.14, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 17, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("사진 앱과 뭐가 다르냐는 질문에 대한 답입니다. 저희는 사진만 받는 게 아니라 제품 ID와 시리얼, 구매와 수선 이력, DPP 여권 정보를 같이 넣습니다. 사진 앱이 가진 건 사진 하나뿐입니다. AI 레이어를 거쳐 나오는 것은 Story, Recap, REMADE 시안이고, Care Score는 AI가 아니라 등록된 기록으로 계산합니다. 제품 상태를 AI가 판정하지 않는다는 뜻입니다.");
}

/* ═══ 19 REMADE ═══ */
{
  const s = p.addSlide();
  head(s, "REPAIR & REMADE", ["고칠 때, 두 갈래를 고릅니다"], { size: 34 });

  const forks = [
    ["복원", "원래 상태로", "세척 · 보강 · 부품 교체\n대부분이 여기로 온다", false],
    ["REMADE", "흠 위에 무늬를", "AI 시안 3안 · MCM 매장 제작\n선택 · 프리미엄", true],
  ];
  forks.forEach((f, i) => {
    const x = 1.3 + i * 5.5;
    if (i > 0) s.addShape(p.ShapeType.line, { x: x - 0.5, y: 2.5, w: 0, h: 1.9,
      line: { color: C.line, width: 0.75 } });
    s.addText(f[0], { x, y: 2.54, w: 4.6, h: 0.46, fontFace: F,
      fontSize: 26, bold: true, color: f[3] ? C.cognac : C.white, margin: 0 });
    s.addText(f[1], { x, y: 3.1, w: 4.6, h: 0.34, fontFace: F,
      fontSize: 15, color: C.white, margin: 0 });
    s.addText(f[2], { x, y: 3.54, w: 4.7, h: 0.8, fontFace: F,
      fontSize: 13, color: C.muted, lineSpacing: 21, margin: 0 });
  });

  shot(s, "shot-repair.png", "부위를 눌러 접수", 1.3, 4.4, 1.55, 1.65, true);
  shot(s, "shot-remade.png", "선택 화면", 3.05, 4.4, 1.55, 1.65, true);
  s.addText("실제 화면입니다.\n접수하면 이 선택이 뜹니다.", { x: 4.9, y: 4.84, w: 2.2, h: 0.8,
    fontFace: F, fontSize: 12, color: C.muted, lineSpacing: 19, margin: 0 });
  s.addImage({ path: IMG("remade-1.jpg"), x: 7.35, y: 4.4, w: 1.55, h: 1.55 });
  s.addImage({ path: IMG("remade-2.jpg"), x: 9.05, y: 4.4, w: 1.55, h: 1.55 });
  s.addImage({ path: IMG("remade-3.jpg"), x: 10.75, y: 4.4, w: 1.55, h: 1.55 });

  rule(s, 1.3, 6.24, W - 2.6);
  s.addText("어느 쪽을 고르든 이력은 한 줄에 남고, 다음 소유자에게 그대로 넘어갑니다", {
    x: 1.0, y: 6.44, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 17, bold: true, color: C.cognac, margin: 0 });
  mark(s);
  s.addNotes("고칠 때 두 갈래에서 고릅니다. 복원은 원래 상태로 되돌리는 것이고 대부분이 여기로 옵니다. REMADE는 흠 위에 무늬를 새기는 선택형 프리미엄입니다. 오른쪽 세 장은 실제 생성 결과입니다. 중요한 건 어느 쪽을 고르든 이력이 한 줄에 남고, 그 이력이 다음 소유자에게 그대로 넘어간다는 점입니다. 소유권 이전은 스키마까지 있고 화면은 다음 단계입니다.");
}

/* ═══ 23b 디지털 제품 여권 ═══ */
{
  const s = p.addSlide();
  head(s, "DIGITAL PRODUCT PASSPORT", ["MCM이 이미 가진 것을 그대로 씁니다"], { size: 32 });
  sub(s, "스캔하면 도착하는 자리입니다", 2.04);

  shot(s, "shot-passport.png", "제품 상세\n여권 펼침", 0.85, 2.52, 1.85, 3.02, true);

  const left = [
    ["시리얼", "MWKCSVE01C0002"],
    ["구매처", "MCM Gangnam"],
    ["등록일", "2026.08.19"],
    ["GTIN", "2900000000018"],
  ];
  const right = [
    ["원산지", "IT"],
    ["소재 구성", "coated canvas 72% · calf 24% · brass 4%"],
    ["재활용 함량", "18%"],
    ["수리가능성", "8.2 / 10"],
  ];
  [left, right].forEach((col, c) => {
    const x = c === 0 ? 3.15 : 8.0;
    col.forEach((r, i) => {
      const y = 2.66 + i * 0.62;
      if (i > 0) rule(s, x, y - 0.1, 4.3);
      s.addText(r[0], { x, y: y + 0.06, w: 1.7, h: 0.3, fontFace: F,
        fontSize: 12.5, color: C.dim, margin: 0 });
      s.addText(r[1], { x: x + 1.6, y: y + 0.05, w: 2.7, h: 0.32, fontFace: F,
        fontSize: 12, color: C.white, margin: 0 });
    });
  });

  s.addText("EU ESPR 여권 항목을 그대로 채웁니다. GS1 Digital Link 표준 태그로 도착합니다.", {
    x: 1.0, y: 5.42, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 17, bold: true, color: C.white, margin: 0 });
  s.addText("소재 · 재활용 · 수리가능성 수치는 화면에 “시연용 가정치”라고 함께 띄웁니다.\n블록체인 원장 기록은 “아직 연결되지 않았습니다”라고 적습니다.", {
    x: 1.0, y: 5.92, w: W - 2, h: 0.76, align: "center", fontFace: F,
    fontSize: 13, color: C.muted, lineSpacing: 21, margin: 0 });
  mark(s);
  s.addNotes("스캔해서 도착하는 자리가 제품 상세라, 새 화면을 만들지 않고 인증 정보를 여권으로 키웠습니다. EU ESPR이 요구하는 항목을 그대로 채웁니다. 다만 수치는 아직 저희 가정치라 화면에 시연용이라고 같이 띄웁니다. 뒷받침 못 하는 숫자를 사실처럼 보여주지 않습니다. MCM 실데이터를 받으면 표시가 자동으로 사라집니다. Aura 원장 기록만 브랜드 연동이 필요합니다.");
}

/* ═══ 22 데모 ═══ */
{
  const s = p.addSlide();
  head(s, "USER FLOW", ["매장에서 산 박스가 시작점입니다"], { size: 34 });
  const steps = [
    ["shot-scan.png",     "스캔\nQR·NFC로 도착"],
    ["shot-register.png", "등록\n타임라인 첫 줄"],
    ["shot-record.png",   "기록\n사진 + 상황 칩"],
    ["shot-remade.png",   "수선\n복원 또는 REMADE"],
  ];
  const iw = 2.25, gapx = 0.5, total = steps.length * iw + (steps.length - 1) * gapx;
  steps.forEach((st, i) => {
    const x = (W - total) / 2 + i * (iw + gapx);
    shot(s, st[0], st[1], x, 2.5, iw, 3.6);
    if (i < steps.length - 1) s.addText("→", { x: x + iw, y: 4.14, w: gapx, h: 0.32,
      align: "center", fontFace: F, fontSize: 15, color: C.dim, margin: 0 });
  });
  s.addText("QR이나 NFC를 찍는 순간부터 등록 · 기록 · 수선이 한 줄로 이어집니다", {
    x: 1.0, y: 6.5, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 16, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("박스의 QR이나 NFC를 찍으면 언박싱으로 들어갑니다. 박스는 손으로 끌어서 엽니다. 등록하면 구매 기록이 타임라인 첫 줄로 자동 생성돼 빈 화면을 보여주지 않습니다. 기록은 사진 한 장과 상황 칩이면 끝이고 문장은 AI가 씁니다. 수선은 제품 사진 위에서 부위를 눌러 접수하고, 거기서 복원과 REMADE를 고릅니다.");
}

chapter(4, "왜 지금, 무엇으로 버는가", "데이터 · 경쟁 · 타이밍");

/* ═══ 23 데이터 ═══ */
{
  const s = p.addSlide();
  head(s, "DATA ASSET", ["브랜드가 몰랐던 것이 보입니다"], { size: 36 });
  s.addText("브랜드는 무엇이 팔렸는지는 압니다.\n언제, 어떤 상황에 쓰이는지는 모릅니다.", {
    x: 1.0, y: 2.66, w: W - 2, h: 0.9, align: "center", fontFace: F,
    fontSize: 17, color: C.muted, lineSpacing: 28, margin: 0 });
  const three = ["상황 분포", "수선 부위", "도시별 사용"];
  const gap = (W - 2.4) / 3;
  three.forEach((t, i) => {
    const x = 1.2 + gap * i, hi = i === 1;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 4.14, w: 0, h: 0.8,
      line: { color: C.line, width: 0.75 } });
    s.addText(t, { x, y: 4.32, w: gap, h: 0.44, align: "center", fontFace: F,
      fontSize: 24, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
  });
  s.addText("어느 부위가 자주 상하는가 → 다음 제품 설계로", {
    x: 1.0, y: 5.22, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 15, color: C.muted, margin: 0 });
  rule(s, 4.4, 5.88, 4.5);
  s.addText("동의한 사용자만 집계합니다 · 5건 미만 그룹은 뺍니다", {
    x: 1.0, y: 6.14, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 14, color: C.white, margin: 0 });
  s.addNotes("사용자가 자기 추억을 남기는 과정에서 자연스럽게 얻어집니다. 동의 없이도 개인 기능은 전부 동작합니다. 코드로 보여드릴 수 있습니다.");
}

/* ═══ 25 경쟁 ═══ */
{
  const s = p.addSlide();
  head(s, "COMPETITIVE POSITION", ["저희 자리는 DPP 위층입니다"], { size: 36 });
  sub(s, "대체재는 셋인데, 다섯을 다 가진 곳은 없습니다", 2.04);

  const cols = ["개인 추억", "공식 제품 이력", "AI Story", "Care · Repair", "소유권 이전"];
  const rowsD = [
    ["Google Photos · 갤러리", ["●", "", "", "", ""]],
    ["브랜드 A/S 창구", ["", "●", "", "●", ""]],
    ["DPP 플랫폼 (Aura · Arianee)", ["", "●", "", "", "●"]],
    ["MCM Luxury Book", ["●", "●", "●", "●", "◐"]],
  ];
  const x0 = 5.0, cw = (W - x0 - 1.0) / cols.length;
  cols.forEach((c, j) => s.addText(c, {
    x: x0 + cw * j, y: 2.6, w: cw, h: 0.5, align: "center", fontFace: F,
    fontSize: 11.5, color: C.dim, lineSpacing: 16, margin: 0 }));
  rowsD.forEach((r, i) => {
    const y = 3.28 + i * 0.78, mine = i === 3;
    if (i > 0) rule(s, 1.2, y - 0.1, W - 2.4);
    s.addText(r[0], { x: 1.3, y: y + 0.1, w: 3.6, h: 0.36, fontFace: F,
      fontSize: 14.5, bold: mine, color: mine ? C.cognac : C.muted, margin: 0 });
    r[1].forEach((v, j) => s.addText(v, {
      x: x0 + cw * j, y: y + 0.06, w: cw, h: 0.4, align: "center", fontFace: F,
      fontSize: 17, color: mine ? C.cognac : C.muted, margin: 0 }));
  });
  s.addText("◐ 소유권 이전은 스키마까지. 화면은 다음 단계입니다.", {
    x: 1.2, y: 6.34, w: W - 2.4, h: 0.32, fontFace: F,
    fontSize: 11.5, color: C.dim, margin: 0 });
  s.addText("결합이 곧 해자입니다. 하나씩은 이미 다 있습니다.", {
    x: 1.0, y: 6.74, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 16, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("사용자가 실제로 대체하는 건 인프라 회사가 아닙니다. 사진은 갤러리에, 수선은 브랜드 A/S 창구에 맡깁니다. DPP 플랫폼은 제조 이력만 담습니다. 하나씩은 이미 다 있습니다. 다섯을 한 줄에 놓은 곳이 없을 뿐입니다.");
}

/* ═══ 26 왜 지금 ═══ */
{
  const s = p.addSlide();
  head(s, "WHY NOW", ["MCM이 직접 써놓은 문장입니다"], { size: 34 });
  s.addText("“패스포트는 제품의 수명을 지원하고, 보존하고,\n연장하기 위한 향후 서비스와 경험으로의\n접근을 연다.”", {
    x: 1.2, y: 2.72, w: W - 2.4, h: 1.9, align: "center", fontFace: F,
    fontSize: 26, bold: true, color: C.white, lineSpacing: 44, margin: 0 });
  s.addText("MCM 공식 Digital Product Passport 페이지", {
    x: 1.0, y: 4.76, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 13, color: C.dim, margin: 0 });
  rule(s, 4.4, 5.44, 4.5);
  s.addText("EU ESPR 여권 항목은 이미 화면에 채워져 있습니다", {
    x: 1.0, y: 5.06, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  s.addText("저희 제품이 이 문장의 다음 장입니다", {
    x: 1.0, y: 5.7, w: W - 2, h: 0.44, align: "center", fontFace: F,
    fontSize: 24, bold: true, color: C.cognac, margin: 0 });
  s.addText("EU ESPR 섬유 위임법 2027년 2분기 예상 · 시행 2028~29년 전망 (2026.08 기준)", {
    x: 0.8, y: H - 0.78, w: W - 1.6, h: 0.34, align: "center", fontFace: F,
    fontSize: 11, color: C.dim, margin: 0 });
  s.addNotes("MCM은 이미 NFC와 Aura 패스포트를 운영 중입니다. Coach는 같은 접근으로 FY2025 북미 신규 120만 명을 얻었고 3분의 2가 Gen Z입니다. 그리고 EU 규제가 밀어줍니다. 2027년 의무화라고 말하지 말고 위임법 2027, 시행 2028에서 29로 나눠 말할 것.");
}

/* ═══ 27 수익모델 ═══ */
{
  const s = p.addSlide();
  head(s, "BUSINESS MODEL", ["수선이 매출이 됩니다"], { size: 40 });
  s.addText("사용자는 무료입니다. 브랜드가 냅니다.", {
    x: 1.0, y: 2.62, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 17, color: C.muted, margin: 0 });
  const list = [
    ["SaaS 구독", "활성 제품 · 사용자 수 기준 월 이용료 + 인사이트 리포트"],
    ["구축비", "전용 UI/UX · 제품 DB · 관리자 시스템"],
    ["Care · Repair 중개", "세척 · 보강 · 부품 교체 예약 연결 수수료"],
    ["리셀 · 소유권 이전", "로드맵"],
  ];
  list.forEach((r, i) => {
    const y = 3.4 + i * 0.86, hi = i === 2;
    if (i > 0) rule(s, 1.4, y - 0.1, W - 2.8);
    s.addText(r[0], { x: 1.5, y: y + 0.1, w: 4.0, h: 0.36, fontFace: F,
      fontSize: 18, bold: true, color: i === 3 ? C.dim : (hi ? C.cognac : C.white), margin: 0 });
    s.addText(r[1], { x: 5.8, y: y + 0.14, w: 6.0, h: 0.32, fontFace: F,
      fontSize: 13.5, color: C.muted, margin: 0 });
  });
  s.addText("고칠수록 브랜드와 오래 갑니다", {
    x: 1.0, y: 6.72, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 16, color: C.white, margin: 0 });
  s.addNotes("리셀과 소유권 이전은 로드맵입니다.");
}

/* ═══ 27b 확장성 ═══ */
{
  const s = p.addSlide();
  head(s, "WHY THIS SCALES", ["새로 지을 게 없습니다"], { size: 38 });
  const cols = [
    ["신규 투자", "거의 없다", "수선은 이미 MCM이 한다.\n매장 · 장인 · 물류가 이미 있다.\n접점과 데이터만 얹는다."],
    ["한계비용", "제품이 늘어도 같다", "박스는 코드로 그린다.\n여권은 스키마 한 줄.\nAI만 건당 과금."],
    ["다음 브랜드", "그대로 옮겨진다", "GS1 · EU ESPR 표준을 따른다.\n브랜드에 묶인 코드가 없다."],
  ];
  const gap = (W - 2.0) / 3;
  cols.forEach((c, i) => {
    const x = 1.0 + gap * i;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 2.6, w: 0, h: 2.5,
      line: { color: C.line, width: 0.75 } });
    s.addText(c[0], { x: x + 0.34, y: 2.66, w: gap - 0.6, h: 0.3, fontFace: F,
      fontSize: 12, color: C.cognac, charSpacing: 1.4, margin: 0 });
    s.addText(c[1], { x: x + 0.34, y: 3.04, w: gap - 0.55, h: 0.46, fontFace: F,
      fontSize: 22, bold: true, color: C.white, margin: 0 });
    s.addText(c[2], { x: x + 0.34, y: 3.68, w: gap - 0.66, h: 1.3, fontFace: F,
      fontSize: 13, color: C.muted, lineSpacing: 22, margin: 0 });
  });
  s.addText("한 브랜드에서 되면, 다음 브랜드는 붙이는 일만 남습니다", {
    x: 1.0, y: 5.5, w: W - 2, h: 0.44, align: "center", fontFace: F,
    fontSize: 20, bold: true, color: C.white, margin: 0 });
  s.addText("수선 단가는 이미 시장에 있습니다 — 부분 리폼 7~25만원 · 전체 30~50만원 (2025)", {
    x: 1.0, y: 6.06, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 13, color: C.muted, margin: 0 });
  mark(s);
  s.addNotes("시장 규모 숫자는 아직 산정 중입니다. 대신 구조로 말씀드립니다. 저희는 새로 지을 게 없습니다. 수선은 이미 MCM이 하고 매장과 장인과 물류가 이미 있습니다. 제품이 늘어도 한계비용이 거의 안 늘고, GS1과 EU ESPR 표준을 따르기 때문에 다음 브랜드로 그대로 옮겨집니다. 수선 단가도 이미 시장에 형성돼 있습니다.");
}

/* ═══ 28 마무리 ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "인프라는 MCM에 있습니다." },
    { t: "경험을 얹는 일이 저희 몫입니다.", c: C.cognac },
  ], { size: 34 });
  s.addText("감사합니다", { x: 1.0, y: 6.1, w: W - 2, h: 0.4, align: "center",
    fontFace: F, fontSize: 14, color: C.dim, charSpacing: 4, margin: 0 });
  s.addNotes("구현 수준을 물으면 이렇게 답합니다. 실제로 도는 것은 AI Story와 Recap 생성, REMADE 시안 생성, GS1 Digital Link 태그 라우팅, EU ESPR 여권 항목, 수선 접수와 상황 데이터 집계입니다. Care Score와 수선 견적은 규칙 계산이고 AI가 아닙니다. 여권 수치와 결제는 시연용이며 화면에 그렇게 표시합니다. Aura 원장 기록은 브랜드 연동이 필요하고, 캠페인 QR과 소유권 이전은 화면이 아직 없습니다. Phase 1은 스토리북과 Care/Repair, REMADE, 기존 DPP 연동입니다. Phase 2는 Archive Style과 B2B 대시보드, Phase 3은 멀티 브랜드와 리셀 연계입니다. 감사합니다.");
}

p.writeFile({ fileName: "/Users/home/Desktop/likeGonzi/docs/ir/MCM_Luxury_Book_IR.pptx" })
  .then(f => console.log("written:", f));

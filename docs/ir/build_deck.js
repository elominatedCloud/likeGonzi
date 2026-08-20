const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";           // 13.3 x 7.5
const W = 13.3, H = 7.5;

const C = {
  dark:   "12100E",
  light:  "F4F1EC",
  card:   "1E1A16",
  line:   "31291F",
  cognac: "C4915F",
  deep:   "8B5A2B",
  white:  "FFFFFF",
  ink:    "1A1613",
  muted:  "8C8177",
  dim:    "635A51",
};
const F = "Arial";

/* ── 공통 ───────────────────────────────── */
const BG_DARK = require("path").join(__dirname, "bg-dark.png");

function dark(s) {
  s.background = { color: C.dark };
  // 반투명 도형으로 글로우를 만들면 경계가 보인다. 그라디언트 이미지를 깔고
  // 가장 먼저 추가해 z-order 맨 아래에 둔다.
  s.addImage({ path: BG_DARK, x: 0, y: 0, w: W, h: H });
}
function brandMark(s, color) {
  s.addText("MCM LUXURY BOOK", {
    x: W - 3.3, y: H - 0.62, w: 2.8, h: 0.3, align: "right",
    fontFace: F, fontSize: 9, color: color || C.dim, charSpacing: 1.4,
  });
}
function eyebrow(s, t) {
  s.addText(t, {
    x: 0, y: 0.62, w: W, h: 0.3, align: "center",
    fontFace: F, fontSize: 11, bold: true, color: C.cognac, charSpacing: 3,
  });
}
function headline(s, lines, opt) {
  const o = opt || {};
  s.addText(lines.map((l, i) => ({
    text: l.t !== undefined ? l.t : l,
    options: {
      breakLine: i < lines.length - 1,
      color: l.c || C.white, bold: true,
    },
  })), {
    x: 0.8, y: o.y || 1.08, w: W - 1.6, h: o.h || 1.5, align: "center",
    fontFace: F, fontSize: o.size || 30, lineSpacing: o.size ? o.size * 1.34 : 40,
    valign: "top", margin: 0,
  });
}
function sub(s, t, y) {
  s.addText(t, {
    x: 1.2, y: y || 2.06, w: W - 2.4, h: 0.5, align: "center",
    fontFace: F, fontSize: 13, color: C.muted, lineSpacing: 21, margin: 0,
  });
}
function foot(s, t) {
  s.addText(t, {
    x: 0.8, y: H - 0.72, w: W - 1.6, h: 0.34, align: "center",
    fontFace: F, fontSize: 9.5, color: C.dim, margin: 0,
  });
}
function card(s, x, y, w, h) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: C.card }, line: { color: C.line, width: 0.75 },
  });
}

/* ── 1. 표지 ─────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  s.addText("MCM LUXURY BOOK", {
    x: 0.95, y: 0.72, w: 5, h: 0.32, fontFace: F, fontSize: 12,
    bold: true, color: C.white, charSpacing: 2, margin: 0,
  });
  s.addText([
    { text: "AI는 흠을 지우지 않습니다.", options: { color: C.white, breakLine: true } },
    { text: "값으로 바꿉니다", options: { color: C.cognac } },
  ], {
    x: 0.95, y: 2.42, w: 11, h: 1.9, fontFace: F, fontSize: 40, bold: true,
    lineSpacing: 58, margin: 0,
  });
  s.addText("제품과 함께한 시간을 기록으로 남기는 MCM 디지털 라이프 플랫폼", {
    x: 0.98, y: 4.62, w: 10, h: 0.34, fontFace: F, fontSize: 14, color: C.white, margin: 0,
  });
  s.addText("Challenge 03 · 360° 고객 경험    |    QR·NFC · AI Storybook · Care & REMADE", {
    x: 0.98, y: 5.06, w: 11, h: 0.3, fontFace: F, fontSize: 11, color: C.muted, margin: 0,
  });
  s.addText("2026.08    |    Hackathon", {
    x: 0.98, y: H - 0.9, w: 6, h: 0.3, fontFace: F, fontSize: 11, color: C.dim, margin: 0,
  });
  s.addNotes("주제를 받고 가장 먼저 한 일은 AI로 무엇을 더 만들까가 아니라, 럭셔리의 본질을 다시 묻는 것이었습니다. 럭셔리는 새것일 때 가장 비쌉니다. 그래서 사람들은 쓰기를 두려워합니다. 저희는 그 방향을 뒤집었습니다.");
}

/* ── 2. 챌린지 선택 ───────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "OUR CHALLENGE");
  headline(s, [{ t: "Challenge 03 · 360° 고객 경험" }], { size: 30 });
  sub(s, "발견 → 구매 → 사용 → 관리 → 수선 → 다음 소유자까지 끊김 없이", 2.02);

  const rows = [
    ["Challenge 01", "AI 프로덕트", "AI Storybook · Recap · REMADE"],
    ["Challenge 02", "인터랙티브 리테일", "매장 구매 → 박스 QR/NFC → 몰입형 언박싱"],
    ["Challenge 03", "360° 고객 경험", "전 여정을 하나의 타임라인으로"],
  ];
  rows.forEach((r, i) => {
    const y = 3.12 + i * 1.02;
    card(s, 1.15, y, W - 2.3, 0.86);
    s.addText(r[0], { x: 1.5, y: y + 0.28, w: 1.5, h: 0.3, fontFace: F, fontSize: 11,
      bold: true, color: i === 2 ? C.cognac : C.dim, margin: 0 });
    s.addText(r[1], { x: 3.15, y: y + 0.25, w: 3.1, h: 0.36, fontFace: F, fontSize: 14,
      bold: true, color: C.white, margin: 0 });
    s.addText(r[2], { x: 6.4, y: y + 0.28, w: 5.4, h: 0.34, fontFace: F, fontSize: 12,
      color: C.muted, margin: 0 });
  });
  foot(s, "3번을 제대로 풀면 1번과 2번이 그 안에 들어온다");
  brandMark(s);
  s.addNotes("1번과 2번은 특정 순간을 좋게 만들지만 끊긴 경험은 여전히 끊겨 있습니다. 매장에서 산 박스의 QR을 찍는 순간이 2번이고, 그 뒤 기록을 만드는 게 1번입니다.");
}

/* ── 챕터 구분 ────────────────────────────── */
function chapter(n, title, subtitle) {
  const s = p.addSlide();
  s.background = { color: C.light };
  s.addText(`Chapter ${n}`, {
    x: 1.1, y: 2.82, w: 5, h: 0.34, fontFace: F, fontSize: 13, bold: true,
    color: C.deep, charSpacing: 2.4, margin: 0,
  });
  s.addText(title, {
    x: 1.08, y: 3.28, w: 11, h: 0.8, fontFace: F, fontSize: 34, bold: true,
    color: C.ink, margin: 0,
  });
  s.addText(subtitle, {
    x: 1.1, y: 4.3, w: 10, h: 0.34, fontFace: F, fontSize: 13, color: "7A716A", margin: 0,
  });
  s.addText("MCM LUXURY BOOK", {
    x: W - 3.3, y: H - 0.62, w: 2.8, h: 0.3, align: "right",
    fontFace: F, fontSize: 9, color: "A79E96", charSpacing: 1.4,
  });
}

chapter(1, "럭셔리 경험은 어디서 끊기는가", "구매 이후가 비어 있다");

/* ── 3. 공백 ─────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "THE GAP");
  headline(s, [{ t: "브랜드는 새것만 보여줍니다" }], { size: 30 });
  sub(s, "광고도, 매장도, 패키지도 전부 새것 상태입니다", 1.98);

  const items = [
    ["구매까지는 완벽합니다", "매장 · 패키지 · 접객에 막대한 투자가 들어갑니다.\n경험의 정점은 구매 순간입니다."],
    ["그 이후는 침묵입니다", "제품 안내 · 프로모션 · A/S.\n가장 애착이 큰 시점부터 관계가 비어 있습니다."],
    ["기록은 세 군데로 흩어집니다", "사진은 SNS, 여행은 캘린더,\n수선 이력은 브랜드 내부에 남습니다."],
    ["낡아가는 과정을 아무도 안 보여줍니다", "5년 쓴 가방이 어떻게 생겼는지\n보여주는 브랜드는 없습니다."],
  ];
  items.forEach((it, i) => {
    const x = 1.15 + (i % 2) * 5.55, y = 3.02 + Math.floor(i / 2) * 1.72;
    card(s, x, y, 5.0, 1.5);
    s.addShape(p.ShapeType.ellipse, { x: x + 0.34, y: y + 0.36, w: 0.11, h: 0.11,
      fill: { color: C.cognac }, line: { type: "none" } });
    s.addText(it[0], { x: x + 0.62, y: y + 0.26, w: 4.2, h: 0.34, fontFace: F,
      fontSize: 13.5, bold: true, color: C.white, margin: 0 });
    s.addText(it[1], { x: x + 0.62, y: y + 0.68, w: 4.1, h: 0.7, fontFace: F,
      fontSize: 11, color: C.muted, lineSpacing: 17, margin: 0 });
  });
  foot(s, "특정 브랜드가 아니라 럭셔리 산업 전체의 구조적 공백");
  brandMark(s);
  s.addNotes("브랜드는 구매까지 엄청난 투자를 합니다. 그런데 그 정점 이후는 세일 문자가 전부입니다. 더 근본적인 건 브랜드가 새것 상태만 보여준다는 겁니다.");
}

/* ── 4. 마찰 ─────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHY IT STAYS EMPTY");
  headline(s, [{ t: "기록은 마찰입니다" }], { size: 30 });
  sub(s, "문제는 브랜드가 몰라서가 아니라, 사용자가 기록을 남기지 않는다는 것입니다", 1.98);

  const fields = ["제목을 입력하세요", "날짜를 선택하세요", "장소를 입력하세요", "설명을 입력하세요", "해시태그"];
  fields.forEach((t, i) => {
    const y = 3.06 + i * 0.62;
    s.addShape(p.ShapeType.roundRect, { x: 1.5, y, w: 5.2, h: 0.5, rectRadius: 0.06,
      fill: { color: C.dark }, line: { color: C.line, width: 0.75, dashType: "dash" } });
    s.addText(t, { x: 1.72, y: y + 0.12, w: 4.6, h: 0.28, fontFace: F,
      fontSize: 11.5, color: C.dim, margin: 0 });
  });
  card(s, 7.3, 3.06, 4.65, 3.02);
  s.addText("지금까지의 해법", { x: 7.66, y: 3.36, w: 3.9, h: 0.3, fontFace: F,
    fontSize: 11, color: C.cognac, bold: true, charSpacing: 1.4, margin: 0 });
  s.addText("입력창을 더 준다", { x: 7.66, y: 3.72, w: 3.9, h: 0.4, fontFace: F,
    fontSize: 19, bold: true, color: C.white, margin: 0 });
  s.addText("→ 더 안 합니다", { x: 7.66, y: 4.2, w: 3.9, h: 0.36, fontFace: F,
    fontSize: 16, bold: true, color: C.cognac, margin: 0 });
  s.addText("사진 40장 중 고르고, 날짜 쓰고, 장소 쓰고,\n설명 쓰고. 아무도 하지 않습니다.\n\n여기가 AI가 들어갈 자리입니다.", {
    x: 7.66, y: 4.74, w: 3.95, h: 1.1, fontFace: F, fontSize: 11.5,
    color: C.muted, lineSpacing: 18, margin: 0 });
  brandMark(s);
  s.addNotes("구매 이후를 채우려는 시도는 계속 있었습니다. 전부 사용자에게 입력을 요구했습니다. 아무도 안 합니다.");
}

chapter(2, "흠이 값이 된다", "우리가 세운 가설");

/* ── 5. 가설 ★ ───────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "OUR HYPOTHESIS");
  headline(s, [{ t: "흠이 값이 됩니다" }], { size: 32 });
  sub(s, "같은 사고방식이 세 문화에 각각 있습니다. 그중 하나는 MCM 자신의 역사입니다", 2.04);

  const eras = [
    ["조선", "신사임당의 포도", "얼룩 위에 그림을 그렸다.\n흠이 작품이 된다."],
    ["일본", "킨츠기 金継ぎ", "깨진 자리를 금으로 잇는다.\n흉터를 드러낸다."],
    ["1988 · 할렘", "Dapper Dan", "비세토스를 뜯어 다시 꿰맸다.\nMCM을 아이콘으로 만든 손."],
    ["2026 · MCM", "REMADE", "AI가 시안을 그리고\n장인이 실물을 만든다."],
  ];
  eras.forEach((e, i) => {
    const x = 0.85 + i * 2.95;
    card(s, x, 2.72, 2.72, 1.9);
    if (i >= 2) {
      s.addShape(p.ShapeType.roundRect, { x, y: 2.72, w: 2.72, h: 1.9, rectRadius: 0.09,
        fill: { type: "none" }, line: { color: C.cognac, width: 1.5 } });
    }
    s.addText(e[0], { x: x + 0.26, y: 2.96, w: 2.2, h: 0.28, fontFace: F,
      fontSize: 9.5, color: C.cognac, charSpacing: 1.2, margin: 0 });
    s.addText(e[1], { x: x + 0.26, y: 3.28, w: 2.3, h: 0.36, fontFace: F,
      fontSize: 14, bold: true, color: C.white, margin: 0 });
    s.addText(e[2], { x: x + 0.26, y: 3.74, w: 2.24, h: 0.9, fontFace: F,
      fontSize: 10.5, color: C.muted, lineSpacing: 16, margin: 0 });
  });
  const derive = [
    ["3년 썼다", "충동구매가 아니었다"],
    ["파리에 같이 갔다", "삶에 들어와 있다"],
    ["긁혔고, 고쳤다", "나는 관리하는 사람이다"],
  ];
  derive.forEach((d, i) => {
    const y = 4.92 + i * 0.44;
    s.addText(d[0], { x: 3.55, y, w: 2.5, h: 0.3, align: "right", fontFace: F,
      fontSize: 12.5, color: C.white, margin: 0 });
    s.addText("→", { x: 6.2, y, w: 0.4, h: 0.3, align: "center", fontFace: F,
      fontSize: 12, color: C.dim, margin: 0 });
    s.addText(d[1], { x: 6.7, y, w: 3.2, h: 0.3, fontFace: F,
      fontSize: 12.5, color: C.muted, margin: 0 });
  });
  s.addShape(p.ShapeType.line, { x: 3.55, y: 6.3, w: 6.35, h: 0,
    line: { color: C.line, width: 0.75 } });
  s.addText("= 흠이 곧 서사다", { x: 3.55, y: 6.4, w: 6.35, h: 0.32, align: "center",
    fontFace: F, fontSize: 14, bold: true, color: C.cognac, margin: 0 });
  foot(s, "신사임당은 전해지는 일화 · Dapper Dan은 브랜드 자체 기록 (Highsnobiety)");
  brandMark(s);
  s.addNotes("신사임당이 잔칫상에서 남의 치마에 튄 얼룩 위에 포도를 그린 이야기가 있습니다. 치마는 오히려 팔려 새 치마 값이 됐습니다. 흠이 값이 된 겁니다. 그리고 1988년 할렘에서 같은 일이 일어났습니다. Dapper Dan이 MCM 코냑 비세토스를 뜯어서 무대의상으로 다시 꿰맸고, 그게 이 브랜드를 아이콘으로 만들었습니다. 이건 남의 이야기가 아닙니다. MCM이 이미 겪은 일입니다.");
}

/* ── 6. 페르소나 ─────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHO WE BUILD FOR");
  headline(s, [{ t: "“무리해서 산 거 아니야." }, { t: "3년째 잘 쓰고 있어.”" }], { size: 27, h: 1.7 });

  card(s, 1.15, 3.16, 5.1, 2.5);
  s.addText("서지우 · 28", { x: 1.5, y: 3.44, w: 4.4, h: 0.36, fontFace: F,
    fontSize: 16, bold: true, color: C.white, margin: 0 });
  s.addText("뷰티 브랜드 마케터 4년차 · 서울 1인 가구\nMCM 백팩 1점 · 주 4회 사용", {
    x: 1.5, y: 3.88, w: 4.4, h: 0.62, fontFace: F, fontSize: 11.5, color: C.muted,
    lineSpacing: 18, margin: 0 });
  s.addText("과시하고 싶다.\n그런데 과시로 보이면 안 된다.", {
    x: 1.5, y: 4.62, w: 4.4, h: 0.66, fontFace: F, fontSize: 14, bold: true,
    color: C.cognac, lineSpacing: 22, margin: 0 });
  s.addText("필요한 건 자랑 도구가 아니라 정당화 도구입니다", {
    x: 1.5, y: 5.3, w: 4.5, h: 0.28, fontFace: F, fontSize: 11, color: C.muted, margin: 0 });

  const reads = [
    ["3대장을 샀다면", "“무리했네”", C.dim],
    ["아무것도 안 산다면", "“포기했네”", C.dim],
    ["MCM을 샀다면", "“안목 있네”", C.cognac],
  ];
  reads.forEach((r, i) => {
    const y = 3.16 + i * 0.86;
    card(s, 6.75, y, 5.4, 0.7);
    s.addText(r[0], { x: 7.05, y: y + 0.2, w: 2.6, h: 0.3, fontFace: F,
      fontSize: 12, color: C.muted, margin: 0 });
    s.addText(r[1], { x: 9.5, y: y + 0.17, w: 2.4, h: 0.36, fontFace: F,
      fontSize: 15, bold: true, color: r[2], align: "right", margin: 0 });
  });
  s.addText("흠이 서사가 되면, 흠이 있는 쪽이 더 당당해집니다", {
    x: 6.75, y: 5.82, w: 5.4, h: 0.32, fontFace: F, fontSize: 12,
    bold: true, color: C.cognac, align: "center", margin: 0 });
  brandMark(s);
  s.addNotes("큰 지출을 했을 때 두려운 건 통장이 아니라 평판입니다. 그런데 흠이 서사가 되는 순간 관계가 뒤집힙니다. 새것 같은 가방보다 3년 쓰고 한 번 고친 가방이 더 당당해집니다. 연령대 실측은 미확보이며 페르소나는 가설입니다.");
}

chapter(3, "무엇을 만들었나", "하나의 타임라인, 그리고 AI");

/* ── 7. 해결 ─────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "SOLUTION");
  headline(s, [{ t: "발견부터 다음 소유자까지, 하나의 타임라인" }], { size: 27 });
  sub(s, "내가 남긴 기록과 브랜드가 남긴 기록이 같은 줄에 흐릅니다", 1.98);

  const steps = ["발견", "구매", "사용", "관리", "수선", "물려주기"];
  steps.forEach((t, i) => {
    const x = 1.1 + i * 1.86;
    s.addShape(p.ShapeType.roundRect, { x, y: 3.14, w: 1.62, h: 0.72, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.line, width: 0.75 } });
    s.addText(t, { x, y: 3.36, w: 1.62, h: 0.3, align: "center", fontFace: F,
      fontSize: 13, bold: true, color: C.white, margin: 0 });
    if (i < steps.length - 1) {
      s.addText("→", { x: x + 1.62, y: 3.38, w: 0.24, h: 0.28, align: "center",
        fontFace: F, fontSize: 12, color: C.dim, margin: 0 });
    }
  });
  s.addShape(p.ShapeType.line, { x: 1.1, y: 4.1, w: W - 2.2, h: 0,
    line: { color: C.cognac, width: 1.25 } });
  s.addText("하나의 기록으로 이어집니다", { x: 1.1, y: 4.2, w: W - 2.2, h: 0.3,
    align: "center", fontFace: F, fontSize: 12, color: C.cognac, margin: 0 });

  const notes = [
    ["별도 앱 설치 없음", "제품의 QR·NFC가 곧 진입점입니다."],
    ["브랜드 기록이 함께 흐릅니다", "사진 앱은 수선 이력을 가질 수 없습니다."],
    ["빈 화면을 보여주지 않습니다", "구매 이벤트가 첫 줄로 자동 생성됩니다."],
  ];
  notes.forEach((n, i) => {
    const x = 1.15 + i * 3.7;
    card(s, x, 4.84, 3.4, 1.34);
    s.addText(n[0], { x: x + 0.28, y: 5.08, w: 2.9, h: 0.3, fontFace: F,
      fontSize: 12, bold: true, color: C.white, margin: 0 });
    s.addText(n[1], { x: x + 0.28, y: 5.44, w: 2.9, h: 0.48, fontFace: F,
      fontSize: 10.5, color: C.muted, lineSpacing: 15, margin: 0 });
  });
  brandMark(s);
  s.addNotes("핵심은 내 기록과 브랜드의 기록이 같은 줄에 있다는 점입니다. 사진 앱은 브랜드 기록을 못 갖고 브랜드 시스템은 내 추억을 못 갖습니다. 이 둘이 만나는 곳은 지금 아무 데도 없습니다.");
}

/* ── 8. AI ★ ─────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "HOW WE USE AI");
  headline(s, [
    { t: "AI는 쓰게 하지 않습니다. 대신 써줍니다." },
    { t: "그리고 흠을 지우지 않습니다. 그 자리에 그립니다.", c: C.cognac },
  ], { size: 22, h: 1.4 });

  const hdr = ["단계", "사용자가 하는 일", "AI가 하는 일", "상태"];
  const xs = [1.15, 2.75, 5.5, 11.15];
  hdr.forEach((h, i) => s.addText(h, { x: xs[i], y: 2.78, w: 2.4, h: 0.28,
    fontFace: F, fontSize: 10, color: C.dim, charSpacing: 1.2, margin: 0 }));

  const rows = [
    ["기록", "사진 1장 + 상황 칩 탭", "문장으로 만든다 — 장소·날짜·제품을 엮어", "구현"],
    ["축적", "아무것도 안 함", "Recap 생성 — 흩어진 기록을 하나의 이야기로", "구현"],
    ["수선", "부위 탭 + 사진", "REMADE — 손상 자리에 어울리는 문양 시안 3안", "구현"],
    ["스타일링", "시대 하나 선택", "Archive Style — 내 가방을 MCM 전성기 룩으로", "제안"],
    ["인사이트", "아무것도 안 함", "패턴 도출 — 누가, 어떤 상황에, 어떤 제품을", "구현"],
  ];
  rows.forEach((r, i) => {
    const y = 3.16 + i * 0.66;
    card(s, 1.15, y, W - 2.3, 0.56);
    s.addText(r[0], { x: 1.45, y: y + 0.15, w: 1.4, h: 0.28, fontFace: F,
      fontSize: 12, bold: true, color: C.white, margin: 0 });
    s.addText(r[1], { x: 2.75, y: y + 0.16, w: 2.7, h: 0.26, fontFace: F,
      fontSize: 11, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 5.5, y: y + 0.15, w: 5.5, h: 0.28, fontFace: F,
      fontSize: 11.5, color: r[0] === "수선" ? C.cognac : C.white,
      bold: r[0] === "수선", margin: 0 });
    s.addText(r[3], { x: 11.05, y: y + 0.16, w: 0.95, h: 0.26, align: "right",
      fontFace: F, fontSize: 10, color: r[3] === "구현" ? C.cognac : C.dim, margin: 0 });
  });
  foot(s, "Story·Recap·REMADE 구현 완료 · Archive Style은 다음 단계 · 제품 상태 판정에는 AI를 쓰지 않습니다");
  brandMark(s);
  s.addNotes("기존 서비스는 사용자에게 입력을 요구했습니다. 저희는 반대로 갑니다. 사진 한 장, 칩 세 번, 여덟 초입니다. 문장은 AI가 씁니다. 그리고 수선입니다. 저희는 수선을 되돌리는 일로 보지 않습니다. 그 자리에 그립니다. AI가 시안 세 개를 만들고 실물은 MCM 장인이 만듭니다. AI가 손을 대체하지 않습니다. 시안까지입니다.");
}

/* ── 9. MCM 자산 ★ ───────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "BRAND ASSETS");
  headline(s, [{ t: "새로 만들지 않았습니다. 이미 있는 것을 썼습니다" }], { size: 26 });

  const rows = [
    ["비세토스 마름모", "바이에른 깃발 = 흰-파란 하늘", "배경에서 바람에 흐르고, 로그에서 멈춰 쌓인다"],
    ["로렐", "승리 · 명예의 상징", "정품 인증 배지 · 멤버십 등급"],
    ["스터드", "시그니처 하드웨어", "수선 부위 핀"],
    ["1976 뮌헨 · 여행가방", "창립 품목이 수트케이스", "스토리북의 서사 근거"],
    ["브랜드 아카이브", "1988 Dapper Dan의 해체 · 재조합", "REMADE — 재해석의 전통을 AI로 계승"],
    ["NFC + Aura DPP", "이미 운영 중", "새로 만들지 않는다. 그 위에 얹는다"],
  ];
  rows.forEach((r, i) => {
    const y = 2.5 + i * 0.68;
    const key = i >= 4;
    card(s, 1.15, y, W - 2.3, 0.58);
    if (key) s.addShape(p.ShapeType.roundRect, { x: 1.15, y, w: W - 2.3, h: 0.58,
      rectRadius: 0.09, fill: { type: "none" }, line: { color: C.deep, width: 1.25 } });
    s.addText(r[0], { x: 1.48, y: y + 0.16, w: 2.7, h: 0.28, fontFace: F,
      fontSize: 12, bold: true, color: key ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 4.3, y: y + 0.17, w: 3.5, h: 0.26, fontFace: F,
      fontSize: 11, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 7.9, y: y + 0.16, w: 4.05, h: 0.28, fontFace: F,
      fontSize: 11.5, color: C.white, margin: 0 });
  });
  foot(s, "출처: MCM Heritage · Highsnobiety · MCM Digital Product Passport");
  brandMark(s);
  s.addNotes("브랜드 자산을 장식으로 쓰지 않았습니다. 비세토스의 마름모는 바이에른 깃발에서 왔고 독일어로 흰-파란 하늘이라는 뜻입니다. 그래서 저희 배경에서 이 마름모는 바람에 흐릅니다. 그리고 마지막 두 줄이 가장 중요합니다. MCM의 헤리티지는 뮌헨 럭셔리가 아니라 재해석입니다. 그리고 MCM은 이미 NFC와 블록체인 패스포트를 갖고 있습니다. 저희는 새 시스템을 제안하지 않습니다.");
}

/* ── 10. 데모 ────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "DEMO");
  headline(s, [{ t: "매장에서 산 박스가 서비스의 시작점입니다" }], { size: 27 });

  const steps = [
    ["01", "스캔", "박스 QR·NFC를 찍으면\n스크롤에 따라 박스가 열린다", "Challenge 02"],
    ["02", "등록", "타임라인 첫 줄이 자동 생성.\n빈 화면을 한 번도 보여주지 않는다", ""],
    ["03", "기록", "사진 1장 + 상황 칩 →\nAI가 문장을 쓴다", "Challenge 01"],
    ["04", "수선", "제품 실사 위에서 부위를 직접 탭.\n그 자리에 REMADE 시안이 그려진다", "핵심"],
  ];
  steps.forEach((st, i) => {
    const x = 1.15 + i * 2.78;
    card(s, x, 2.68, 2.56, 3.2);
    if (i === 3) s.addShape(p.ShapeType.roundRect, { x, y: 2.68, w: 2.56, h: 3.2,
      rectRadius: 0.09, fill: { type: "none" }, line: { color: C.cognac, width: 1.5 } });
    s.addText(st[0], { x: x + 0.26, y: 2.94, w: 1, h: 0.34, fontFace: F,
      fontSize: 15, bold: true, color: C.cognac, margin: 0 });
    s.addText(st[1], { x: x + 0.26, y: 3.38, w: 2, h: 0.34, fontFace: F,
      fontSize: 16, bold: true, color: C.white, margin: 0 });
    s.addText(st[2], { x: x + 0.26, y: 3.86, w: 2.08, h: 1.0, fontFace: F,
      fontSize: 11, color: C.muted, lineSpacing: 17, margin: 0 });
    if (st[3]) s.addText(st[3], { x: x + 0.26, y: 5.42, w: 2, h: 0.28, fontFace: F,
      fontSize: 9.5, color: C.dim, charSpacing: 1, margin: 0 });
  });
  foot(s, "박스를 여는 속도는 사용자가 정합니다. 스크롤을 멈추면 애니메이션도 멈춥니다");
  brandMark(s);
  s.addNotes("등록하면 구매 기록이 자동으로 첫 줄에 찍힙니다. 사진 한 장을 올리면 AI가 문장을 씁니다. 그리고 이 화면입니다. 제품 사진 위에서 부위를 직접 누릅니다. 글로 왼쪽 아래 모서리가 까졌어요라고 쓰는 게 아니라 그 자리를 누릅니다.");
}

chapter(4, "왜 지금, 무엇으로 버는가", "데이터 · 경쟁 · 타이밍");

/* ── 11. 데이터 ───────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "DATA ASSET");
  headline(s, [{ t: "기록이 쌓이면, 브랜드가 몰랐던 것이 보입니다" }], { size: 26 });
  sub(s, "브랜드는 무엇이 팔렸는지는 압니다. 언제, 어떤 상황에 쓰이는지는 모릅니다", 1.96);

  const cards = [
    ["상황 분포", "출근 · 여행 · 전시 · 모임 · 데이트", "brand_occasion_usage"],
    ["수선 부위 히트맵", "손잡이 · 스트랩 · 지퍼 · 모서리 · 가죽면", "brand_repair_hotspots"],
    ["도시별 사용", "국가 · 도시 정규화", "brand_city_usage"],
  ];
  cards.forEach((c, i) => {
    const x = 1.15 + i * 3.7;
    card(s, x, 3.0, 3.4, 1.72);
    s.addText(c[0], { x: x + 0.28, y: 3.26, w: 2.9, h: 0.32, fontFace: F,
      fontSize: 14, bold: true, color: C.white, margin: 0 });
    s.addText(c[1], { x: x + 0.28, y: 3.66, w: 2.9, h: 0.5, fontFace: F,
      fontSize: 10.5, color: C.muted, lineSpacing: 15, margin: 0 });
    s.addText(c[2], { x: x + 0.28, y: 4.28, w: 2.9, h: 0.26, fontFace: F,
      fontSize: 9.5, color: C.cognac, margin: 0 });
  });
  card(s, 1.15, 4.98, W - 2.3, 1.02);
  s.addText("집계는 동의한 사용자만 · 5건 미만 그룹 제외(k-익명성) · 관리자만 조회", {
    x: 1.5, y: 5.2, w: 10.5, h: 0.3, fontFace: F, fontSize: 12.5, bold: true,
    color: C.white, margin: 0 });
  s.addText("동의 없이도 개인 기능은 전부 동작합니다. 코드로 보여드릴 수 있습니다.", {
    x: 1.5, y: 5.54, w: 10.5, h: 0.28, fontFace: F, fontSize: 11, color: C.muted, margin: 0 });
  brandMark(s);
  s.addNotes("사용자가 자기 추억을 남기는 과정에서 자연스럽게 얻어집니다. 특히 수선 데이터는 어느 부위가 자주 상하는지를 알려줍니다. 이건 바로 다음 제품 설계에 들어갑니다.");
}

/* ── 12. 경쟁 ────────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "COMPETITIVE POSITION");
  headline(s, [
    { t: "우리는 DPP를 만들지 않습니다." },
    { t: "DPP 위에서 사는 사람을 만듭니다.", c: C.cognac },
  ], { size: 24, h: 1.4 });

  const rows = [
    ["Aura Consortium", "LVMH 주도 · MCM이 이미 소속", "인프라"],
    ["Arianee", "패스포트 340만+ · 브랜드 50+", "인프라"],
    ["EON", "패션 · 텍스타일 DPP", "인프라"],
    ["Coachtopia", "제품 중심 순환 · 자사 서브브랜드 전용", "제품"],
    ["MCM Luxury Book", "DPP 위의 경험 · 행동 레이어", "경험"],
  ];
  rows.forEach((r, i) => {
    const y = 2.92 + i * 0.66;
    const mine = i === 4;
    card(s, 1.15, y, W - 2.3, 0.56);
    if (mine) s.addShape(p.ShapeType.roundRect, { x: 1.15, y, w: W - 2.3, h: 0.56,
      rectRadius: 0.09, fill: { type: "none" }, line: { color: C.cognac, width: 1.5 } });
    s.addText(r[0], { x: 1.48, y: y + 0.15, w: 3.3, h: 0.28, fontFace: F,
      fontSize: 12.5, bold: true, color: mine ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 5.0, y: y + 0.16, w: 5.4, h: 0.26, fontFace: F,
      fontSize: 11, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 10.6, y: y + 0.16, w: 1.35, h: 0.26, align: "right",
      fontFace: F, fontSize: 10.5, color: mine ? C.cognac : C.dim, margin: 0 });
  });
  s.addText("기존 DPP 사업자가 전부 못 하는 것 — 소비자가 두 번째로 앱을 여는 것", {
    x: 1.15, y: 6.32, w: W - 2.3, h: 0.3, align: "center", fontFace: F,
    fontSize: 12, bold: true, color: C.white, margin: 0 });
  brandMark(s);
  s.addNotes("MCM은 이미 Aura에 있습니다. 저희가 인프라 경쟁에 뛰어들면 집니다. 제조 이력은 한 번 보면 다시 볼 이유가 없습니다. Coachtopia도 제품 중심입니다. 저희는 소유자 중심이라 재방문이 생기고 그 재방문이 데이터가 됩니다.");
}

/* ── 13. 왜 지금 ──────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHY NOW");
  headline(s, [{ t: "세 가지가 지금 겹칩니다" }], { size: 30 });

  const cols = [
    ["01", "브랜드가 준비돼 있다", "MCM은 NFC + Aura 블록체인\n패스포트를 이미 운영 중입니다."],
    ["02", "시장이 증명했다", "Coach는 같은 접근으로 FY2025\n북미 신규 120만 명, 2/3가 Gen Z."],
    ["03", "규제가 밀어준다", "EU ESPR 섬유 위임법 2027년 2분기 예상,\n시행 2028~29년 전망."],
  ];
  cols.forEach((c, i) => {
    const x = 1.15 + i * 3.7;
    card(s, x, 2.5, 3.4, 1.94);
    s.addText(c[0], { x: x + 0.28, y: 2.74, w: 1, h: 0.3, fontFace: F,
      fontSize: 13, bold: true, color: C.cognac, margin: 0 });
    s.addText(c[1], { x: x + 0.28, y: 3.12, w: 2.9, h: 0.32, fontFace: F,
      fontSize: 14, bold: true, color: C.white, margin: 0 });
    s.addText(c[2], { x: x + 0.28, y: 3.54, w: 2.94, h: 0.72, fontFace: F,
      fontSize: 10.5, color: C.muted, lineSpacing: 16, margin: 0 });
  });

  card(s, 1.15, 4.68, W - 2.3, 1.42);
  s.addText("“패스포트는 제품의 수명을 지원하고, 보존하고, 연장하기 위한", {
    x: 1.6, y: 4.94, w: 10.4, h: 0.32, fontFace: F, fontSize: 14, color: C.white, margin: 0 });
  s.addText("MCM 커뮤니티 내의 향후 서비스와 경험으로의 접근을 연다.”", {
    x: 1.6, y: 5.26, w: 10.4, h: 0.32, fontFace: F, fontSize: 14, bold: true,
    color: C.cognac, margin: 0 });
  s.addText("MCM 공식 Digital Product Passport 페이지 · us.mcmworldwide.com/en_US/digital-passport", {
    x: 1.6, y: 5.66, w: 10.4, h: 0.26, fontFace: F, fontSize: 9.5, color: C.dim, margin: 0 });
  foot(s, "규제 일정은 2026년 8월 기준 · 위임법 2027, 시행 2028~29");
  brandMark(s);
  s.addNotes("MCM 공식 패스포트 페이지에 이렇게 적혀 있습니다. 저희 제품이 이 문장의 다음 장입니다. 그리고 EU는 섬유 제품에 디지털 패스포트를 요구하는 방향으로 가고 있습니다. 브랜드는 어차피 해야 합니다. 2027년 의무화라고 말하지 말고 위임법 2027, 시행 2028에서 29로 나눠 말할 것.");
}

/* ── 14. 수익모델 ─────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "BUSINESS MODEL");
  headline(s, [{ t: "흠이 값이 되면, 수선이 매출이 됩니다" }], { size: 28 });
  sub(s, "사용자는 무료입니다. 브랜드가 냅니다.", 2.0);

  const rows = [
    ["SaaS 구독", "브랜드", "활성 제품 · 사용자 수 기준 월 이용료 + 인사이트 리포트"],
    ["구축비", "브랜드", "전용 UI/UX · 제품 DB · 관리자 시스템 초기 도입"],
    ["REMADE · Care 중개", "파트너", "리폼 · 세척 · 수선 예약 연결 수수료"],
    ["AI 프리미엄 콘텐츠", "사용자", "고화질 Recap · 기념일 콘텐츠"],
    ["리셀 · 소유권 이전", "파트너", "로드맵"],
  ];
  rows.forEach((r, i) => {
    const y = 3.0 + i * 0.6;
    card(s, 1.15, y, 7.5, 0.5);
    s.addText(r[0], { x: 1.45, y: y + 0.12, w: 2.8, h: 0.26, fontFace: F,
      fontSize: 11.5, bold: true, color: i === 4 ? C.dim : C.white, margin: 0 });
    s.addText(r[1], { x: 4.3, y: y + 0.13, w: 0.9, h: 0.24, fontFace: F,
      fontSize: 10, color: C.dim, margin: 0 });
    s.addText(r[2], { x: 5.25, y: y + 0.13, w: 3.2, h: 0.24, fontFace: F,
      fontSize: 10, color: C.muted, margin: 0 });
  });

  card(s, 8.95, 3.0, 3.2, 3.0);
  s.addText("리셀 가치 역전", { x: 9.25, y: 3.24, w: 2.7, h: 0.3, fontFace: F,
    fontSize: 13, bold: true, color: C.cognac, margin: 0 });
  s.addText("보통 리폼하면 진품성이 흔들려\n리셀가가 떨어집니다.\n\n브랜드 공식 리폼 + DPP 기록이면\n진품성은 유지되고 거기에\n세상에 하나뿐이라는 증명이 붙습니다.", {
    x: 9.25, y: 3.64, w: 2.72, h: 1.5, fontFace: F, fontSize: 10.5,
    color: C.muted, lineSpacing: 16, margin: 0 });
  s.addText("DPP를 가진 브랜드만\n할 수 있습니다", { x: 9.25, y: 5.28, w: 2.7, h: 0.6,
    fontFace: F, fontSize: 12, bold: true, color: C.white, lineSpacing: 19, margin: 0 });
  brandMark(s);
  s.addNotes("사용자는 무료입니다. 브랜드가 냅니다. 그리고 수선이 비용 센터에서 매출과 로열티의 접점으로 바뀝니다. 리셀과 소유권 이전은 로드맵입니다.");
}

/* ── 15. 로드맵 ───────────────────────────── */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "ROADMAP");
  headline(s, [{ t: "한 브랜드에서 깊게 검증하고, 확장합니다" }], { size: 28 });

  const phases = [
    ["Phase 1", "지금", "스토리북 + Care/Repair + REMADE\n기존 DPP 연동"],
    ["Phase 2", "다음", "Archive Style\n상황 데이터 집계 대시보드 (B2B)"],
    ["Phase 3", "확장", "멀티 브랜드\n리셀 · 소유권 이전 연계"],
  ];
  phases.forEach((ph, i) => {
    const x = 1.15 + i * 3.7;
    card(s, x, 2.72, 3.4, 2.1);
    if (i === 0) s.addShape(p.ShapeType.roundRect, { x, y: 2.72, w: 3.4, h: 2.1,
      rectRadius: 0.09, fill: { type: "none" }, line: { color: C.cognac, width: 1.5 } });
    s.addText(ph[0], { x: x + 0.28, y: 2.98, w: 2, h: 0.32, fontFace: F,
      fontSize: 15, bold: true, color: i === 0 ? C.cognac : C.white, margin: 0 });
    s.addText(ph[1], { x: x + 2.3, y: 3.02, w: 0.9, h: 0.26, align: "right",
      fontFace: F, fontSize: 10, color: C.dim, margin: 0 });
    s.addText(ph[2], { x: x + 0.28, y: 3.5, w: 2.94, h: 0.9, fontFace: F,
      fontSize: 11, color: C.muted, lineSpacing: 17, margin: 0 });
  });

  s.addText("MCM은 이미 인프라를 갖고 있습니다. 저희는 그 위에 경험을 얹습니다.", {
    x: 1.15, y: 5.32, w: W - 2.3, h: 0.36, align: "center", fontFace: F,
    fontSize: 16, bold: true, color: C.white, margin: 0 });
  s.addText("감사합니다", { x: 1.15, y: 5.86, w: W - 2.3, h: 0.34, align: "center",
    fontFace: F, fontSize: 12, color: C.cognac, charSpacing: 3, margin: 0 });
  brandMark(s);
  s.addNotes("한 브랜드에서 깊게 검증하고 확장합니다. 감사합니다.");
}

p.writeFile({ fileName: "/Users/home/Desktop/likeGonzi/docs/ir/MCM_Luxury_Book_IR.pptx" })
  .then(f => console.log("written:", f));

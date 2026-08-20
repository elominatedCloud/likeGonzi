const pptxgen = require("pptxgenjs");
const path = require("path");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";                 // 13.3 x 7.5
const W = 13.3, H = 7.5;
const BG = path.join(__dirname, "bg-dark.png");

const C = {
  dark: "12100E", light: "F4F1EC", card: "1E1A16", line: "342B21",
  cognac: "C4915F", deep: "8B5A2B", white: "FFFFFF", ink: "1A1613",
  muted: "9A8F84", dim: "6E6459",
};
const F = "Apple SD Gothic Neo";          // PDF에 임베드된다. PPTX는 맥 기준.

/* 타입 스케일 — 크기 대비가 주 무기다. 색으로 강조하지 않는다. */
const T = { eyebrow: 12, h1: 36, h2: 31, sub: 15, cardTitle: 17, body: 13.5, cap: 11 };

/* ── 프리미티브 ─────────────────────────── */
const dark = s => { s.background = { color: C.dark }; s.addImage({ path: BG, x: 0, y: 0, w: W, h: H }); };

const mark = s => s.addText("MCM LUXURY BOOK", {
  x: W - 3.4, y: H - 0.58, w: 2.9, h: 0.3, align: "right",
  fontFace: F, fontSize: 9.5, color: C.dim, charSpacing: 1.4 });

const eyebrow = (s, t) => s.addText(t, {
  x: 0, y: 0.58, w: W, h: 0.34, align: "center",
  fontFace: F, fontSize: T.eyebrow, bold: true, color: C.cognac, charSpacing: 3.2 });

function headline(s, lines, o = {}) {
  const size = o.size || (lines.length > 1 ? T.h2 : T.h1);
  s.addText(lines.map((l, i) => ({
    text: l.t !== undefined ? l.t : l,
    options: { breakLine: i < lines.length - 1, color: l.c || C.white, bold: true },
  })), {
    x: 0.7, y: o.y || 1.02, w: W - 1.4, h: o.h || (lines.length > 1 ? 1.5 : 0.9),
    align: "center", fontFace: F, fontSize: size, lineSpacing: size * 1.32,
    valign: "top", margin: 0 });
}
const sub = (s, t, y) => s.addText(t, {
  x: 1.1, y: y, w: W - 2.2, h: 0.42, align: "center",
  fontFace: F, fontSize: T.sub, color: C.muted, lineSpacing: 24, margin: 0 });

const foot = (s, t) => s.addText(t, {
  x: 0.8, y: H - 0.72, w: W - 1.6, h: 0.34, align: "center",
  fontFace: F, fontSize: T.cap, color: C.dim, margin: 0 });

const card = (s, x, y, w, h, hi) => {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09,
    fill: { color: C.card }, line: { color: hi ? C.cognac : C.line, width: hi ? 1.5 : 0.75 } });
};

function chapter(n, title, subtitle) {
  const s = p.addSlide();
  s.background = { color: C.light };
  s.addText(`Chapter ${n}`, { x: 1.1, y: 2.78, w: 5, h: 0.36, fontFace: F,
    fontSize: 14, bold: true, color: C.deep, charSpacing: 2.6, margin: 0 });
  s.addText(title, { x: 1.08, y: 3.26, w: 11, h: 0.9, fontFace: F,
    fontSize: 38, bold: true, color: C.ink, margin: 0 });
  s.addText(subtitle, { x: 1.1, y: 4.34, w: 10.5, h: 0.38, fontFace: F,
    fontSize: 15, color: "7A716A", margin: 0 });
  s.addText("MCM LUXURY BOOK", { x: W - 3.4, y: H - 0.58, w: 2.9, h: 0.3,
    align: "right", fontFace: F, fontSize: 9.5, color: "A79E96", charSpacing: 1.4 });
}

/* ══ 01 표지 ══════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  s.addText("MCM LUXURY BOOK", { x: 0.95, y: 0.7, w: 6, h: 0.34, fontFace: F,
    fontSize: 13, bold: true, color: C.white, charSpacing: 2.4, margin: 0 });
  s.addText([
    { text: "흠을 지우지 않습니다.", options: { color: C.white, breakLine: true } },
    { text: "나의 것으로 만듭니다", options: { color: C.cognac } },
  ], { x: 0.95, y: 2.3, w: 11.5, h: 2.1, fontFace: F, fontSize: 48, bold: true,
    lineSpacing: 68, margin: 0 });
  s.addText("매일 쓰는 럭셔리를 위한 기록과 리폼 플랫폼", {
    x: 0.98, y: 4.72, w: 10, h: 0.4, fontFace: F, fontSize: 17, color: C.white, margin: 0 });
  s.addText("Challenge 03 · 360° 고객 경험    |    2026.08 Hackathon", {
    x: 0.98, y: 5.22, w: 11, h: 0.34, fontFace: F, fontSize: 13, color: C.muted, margin: 0 });
  s.addNotes("럭셔리는 새것일 때 가장 비쌉니다. 그래서 사람들은 쓰기를 두려워합니다. 저희는 그 방향을 뒤집었습니다.");
}

/* ══ 02 챌린지 선택 ═══════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHICH CHALLENGE");
  headline(s, ["저희는 03번을 골랐습니다"], { size: T.h1 });

  const ch = [
    ["01", "AI 기반 프로덕트", "AI가 경험 자체로 작동하는\n소프트웨어 솔루션", "부수", "REMADE · AI Storybook"],
    ["02", "인터랙티브 리테일", "온라인의 편리함과 오프라인의\n감각을 잇는 매장 경험", "부수", "박스 QR·NFC → 언박싱"],
    ["03", "360° 고객 경험", "발견부터 구매 이후까지\n끊김 없이 로열티를 만드는 여정", "메인", "구매 → 사용 → 수선 → 이전"],
  ];
  ch.forEach((c, i) => {
    const x = 0.85 + i * 3.95, main = c[3] === "메인";
    card(s, x, 2.34, 3.6, 3.34, main);
    s.addText(c[0], { x: x + 0.3, y: 2.62, w: 1.2, h: 0.5, fontFace: F,
      fontSize: 30, bold: true, color: main ? C.cognac : C.dim, margin: 0 });
    s.addText(c[3], { x: x + 2.3, y: 2.74, w: 1, h: 0.3, align: "right", fontFace: F,
      fontSize: 11, bold: true, color: main ? C.cognac : C.dim, charSpacing: 1.4, margin: 0 });
    s.addText(c[1], { x: x + 0.3, y: 3.24, w: 3.1, h: 0.38, fontFace: F,
      fontSize: T.cardTitle, bold: true, color: C.white, margin: 0 });
    s.addText(c[2], { x: x + 0.3, y: 3.74, w: 3.1, h: 0.8, fontFace: F,
      fontSize: T.body, color: C.muted, lineSpacing: 21, margin: 0 });
    s.addShape(p.ShapeType.line, { x: x + 0.3, y: 4.72, w: 3.0, h: 0,
      line: { color: C.line, width: 0.75 } });
    s.addText(c[4], { x: x + 0.3, y: 4.86, w: 3.1, h: 0.6, fontFace: F,
      fontSize: T.body, color: main ? C.white : C.muted, bold: main, lineSpacing: 20, margin: 0 });
  });
  foot(s, "03을 제대로 풀면 01과 02가 그 안에 들어옵니다");
  mark(s);
  s.addNotes("세 챌린지 중 3번을 메인으로 골랐습니다. 1번과 2번은 특정 순간을 좋게 만들지만 끊긴 경험은 여전히 끊겨 있기 때문입니다. 그리고 3번을 제대로 풀면 1번과 2번이 그 안에 들어옵니다. 매장에서 산 박스의 QR을 찍는 순간이 2번이고, 그 뒤 AI가 기록을 만드는 게 1번입니다.");
}

chapter(1, "MCM은 어디에 서 있나", "가격이 아니라 사용 빈도로 보면 자리가 달라진다");

/* ══ 03 포지셔닝 맵 ★ ═════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "POSITIONING");
  headline(s, ["가격이 아니라 사용 빈도로 보면"], { size: T.h1, y: 0.98 });
  sub(s, "MCM의 자리가 달라집니다", 1.92);

  const X0 = 4.15, Y0 = 6.06, PW = 6.0, PH = 3.2;
  // 매일 쓰는 럭셔리 구간
  const zx = X0 + PW * 0.46, zy = Y0 - PH * 0.80, zw = PW * 0.58, zh = PH * 0.62;
  s.addShape(p.ShapeType.roundRect, { x: zx, y: zy, w: zw, h: zh, rectRadius: 0.08,
    fill: { color: C.deep, transparency: 86 }, line: { color: C.cognac, width: 1 } });
  s.addText("매일 쓰는 럭셔리", { x: zx, y: zy - 0.34, w: zw, h: 0.3, align: "center",
    fontFace: F, fontSize: 12, bold: true, color: C.cognac, charSpacing: 1.2, margin: 0 });

  s.addShape(p.ShapeType.line, { x: X0, y: Y0, w: PW, h: 0, line: { color: C.line, width: 1 } });
  s.addShape(p.ShapeType.line, { x: X0, y: Y0 - PH, w: 0, h: PH, line: { color: C.line, width: 1 } });
  s.addText("일상 사용 빈도  →", { x: X0, y: Y0 + 0.16, w: PW, h: 0.3, align: "center",
    fontFace: F, fontSize: 11.5, color: C.dim, margin: 0 });
  s.addText("↑ 가격", { x: X0 - 0.06, y: Y0 - PH - 0.36, w: 1.4, h: 0.3, align: "left",
    fontFace: F, fontSize: 11.5, color: C.dim, margin: 0 });

  // [x비율, y비율, 라벨, 라벨방향, 강조]
  const dots = [
    [0.14, 0.86, "에르메스 · 샤넬 · 루이비통", "R", false],
    [0.62, 0.42, "Coach · Michael Kors", "R", false],
    [0.80, 0.26, "Longchamp", "R", false],
    [0.76, 0.62, "MCM", "R", true],
    [0.90, 0.08, "매스 브랜드", "R", false],
  ];
  dots.forEach(d => {
    const cx = X0 + PW * d[0], cy = Y0 - PH * d[1], r = d[4] ? 0.2 : 0.13;
    s.addShape(p.ShapeType.ellipse, { x: cx - r / 2, y: cy - r / 2, w: r, h: r,
      fill: { color: d[4] ? C.cognac : C.muted }, line: { type: "none" } });
    const right = d[3] === "R";
    s.addText(d[2], {
      x: right ? cx + 0.16 : cx - 3.16, y: cy - 0.16, w: 3.0, h: 0.32,
      align: right ? "left" : "right", fontFace: F,
      fontSize: d[4] ? 17 : 12, bold: d[4],
      color: d[4] ? C.white : C.muted, margin: 0 });
  });

  const notes = [
    ["아껴 쓰는 물건", "가격이 높을수록 옷장에 머문다.\n상하지 않지만 함께한 시간도 없다."],
    ["매일 쓰는 물건", "MCM은 매일 들 수 있는 가격대다.\n그래서 상한다."],
  ];
  notes.forEach((n, i) => {
    const y = 2.62 + i * 1.72;
    card(s, 0.85, y, 2.9, 1.52, i === 1);
    s.addText(n[0], { x: 1.12, y: y + 0.22, w: 2.4, h: 0.34, fontFace: F,
      fontSize: 15, bold: true, color: i === 1 ? C.cognac : C.white, margin: 0 });
    s.addText(n[1], { x: 1.12, y: y + 0.66, w: 2.4, h: 0.74, fontFace: F,
      fontSize: 12, color: C.muted, lineSpacing: 18, margin: 0 });
  });
  foot(s, "Coach는 접근 가능 럭셔리 1위 · Longchamp $100–250 · Michael Kors $150–800 (2026)");
  mark(s);
  s.addNotes("가격만 보면 MCM은 준명품입니다. 그런데 축을 하나 더 두면 자리가 달라집니다. 일상 사용 빈도입니다. 3대장은 가격이 높아 옷장에 머뭅니다. 매스 브랜드는 매일 쓰지만 애착이 없습니다. 이 구간이 매일 들 수 있으면서 애착이 생기는 유일한 자리이고, MCM은 그중 가장 위에 있습니다.");
}

/* ══ 04 역설 ★ ═══════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "THE PARADOX");
  headline(s, ["매일 쓰면, 상합니다"], { size: T.h1 });
  sub(s, "그리고 이 구간에만 “상한 것을 어떻게 다룰 것인가”라는 문제가 생깁니다", 2.08);

  const cols = [
    ["3대장", "안 씁니다", "그래서 안 상합니다.\n대신 함께한 시간도 없습니다.", C.dim],
    ["매스 브랜드", "상하면 버립니다", "애착이 없어서\n고칠 이유가 없습니다.", C.dim],
    ["MCM", "매일 쓰고, 상합니다", "고칠 만큼 아깝고\n버리기엔 아깝습니다.", C.cognac],
  ];
  cols.forEach((c, i) => {
    const x = 0.85 + i * 3.95, hi = i === 2;
    card(s, x, 2.94, 3.6, 2.5, hi);
    s.addText(c[0], { x: x + 0.32, y: 3.2, w: 3.0, h: 0.36, fontFace: F,
      fontSize: 15, bold: true, color: hi ? C.cognac : C.muted, margin: 0 });
    s.addText(c[1], { x: x + 0.32, y: 3.66, w: 3.1, h: 0.42, fontFace: F,
      fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(c[2], { x: x + 0.32, y: 4.24, w: 3.05, h: 0.8, fontFace: F,
      fontSize: T.body, color: C.muted, lineSpacing: 21, margin: 0 });
  });
  s.addText("지금 이 문제를 풀어주는 브랜드는 없습니다", {
    x: 0.85, y: 5.82, w: W - 1.7, h: 0.42, align: "center", fontFace: F,
    fontSize: 19, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("3대장은 안 쓰니까 안 상합니다. 매스 브랜드는 상하면 버립니다. MCM 구간만 매일 쓰고, 상하고, 그런데 버리기엔 아까운 물건입니다. 이 문제를 지금 풀어주는 브랜드가 없습니다.");
}

chapter(2, "흠이 값이 된다", "상함을 지우지 말고, 나의 것으로");

/* ══ 05 가설 ★ ═══════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "OUR ANSWER");
  headline(s, [
    { t: "고쳐서 원래대로 돌리지 않습니다." },
    { t: "고쳐서 나만의 것으로 만듭니다.", c: C.cognac },
  ], { size: 30, h: 1.6 });

  const flow = [
    ["매일 쓴다", "가격대가 허락한다"],
    ["긁힌다", "쓰면 생기는 일이다"],
    ["그 자리에 그린다", "AI 시안 · 장인 제작"],
    ["나만의 것이 된다", "세상에 하나뿐"],
  ];
  flow.forEach((f, i) => {
    const x = 0.85 + i * 3.15;
    card(s, x, 3.0, 2.85, 1.5, i >= 2);
    s.addText(f[0], { x: x + 0.28, y: 3.28, w: 2.4, h: 0.36, fontFace: F,
      fontSize: 16, bold: true, color: i >= 2 ? C.cognac : C.white, margin: 0 });
    s.addText(f[1], { x: x + 0.28, y: 3.74, w: 2.4, h: 0.4, fontFace: F,
      fontSize: 12, color: C.muted, margin: 0 });
    if (i < 3) s.addText("→", { x: x + 2.85, y: 3.6, w: 0.3, h: 0.32, align: "center",
      fontFace: F, fontSize: 15, color: C.dim, margin: 0 });
  });

  s.addText("흠이 곧 나의 역사가 됩니다", { x: 0.85, y: 5.06, w: W - 1.7, h: 0.5,
    align: "center", fontFace: F, fontSize: 26, bold: true, color: C.white, margin: 0 });
  s.addText("이 서비스가 파는 것은 수선이 아니라 “오래 쓸 이유”입니다", {
    x: 0.85, y: 5.72, w: W - 1.7, h: 0.36, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  mark(s);
  s.addNotes("그래서 저희는 수선을 원래대로 되돌리는 일로 보지 않습니다. 매일 쓰면 긁힙니다. 그 자리에 그립니다. 그러면 세상에 하나뿐인 물건이 됩니다. 흠이 곧 나의 역사가 됩니다.");
}

/* ══ 06 계보 ══════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "THIS IS NOT NEW");
  headline(s, ["같은 생각이 이미 세 번 있었습니다"], { size: T.h1 });

  const eras = [
    ["조선", "신사임당의 포도", "치마 얼룩 위에 포도를 그렸다.\n버려질 옷이 오히려 팔렸다."],
    ["일본", "킨츠기 金継ぎ", "깨진 자리를 금으로 잇는다.\n흉터를 감추지 않고 드러낸다."],
    ["1988 · 할렘", "Dapper Dan", "MCM 코냑 비세토스를 뜯어\n무대의상으로 다시 꿰맸다."],
  ];
  eras.forEach((e, i) => {
    const x = 0.85 + i * 3.95, hi = i === 2;
    card(s, x, 2.34, 3.6, 2.42, hi);
    s.addText(e[0], { x: x + 0.32, y: 2.6, w: 3.0, h: 0.3, fontFace: F,
      fontSize: 11.5, color: C.cognac, charSpacing: 1.4, margin: 0 });
    s.addText(e[1], { x: x + 0.32, y: 2.98, w: 3.1, h: 0.42, fontFace: F,
      fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(e[2], { x: x + 0.32, y: 3.56, w: 3.05, h: 0.86, fontFace: F,
      fontSize: T.body, color: C.muted, lineSpacing: 21, margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: 0.85, y: 5.12, w: W - 1.7, h: 1.14,
    rectRadius: 0.09, fill: { color: C.card }, line: { color: C.cognac, width: 1.5 } });
  s.addText("셋째는 비유가 아닙니다. MCM 자신의 역사입니다.", {
    x: 1.2, y: 5.34, w: 11, h: 0.4, fontFace: F, fontSize: 20, bold: true,
    color: C.cognac, margin: 0 });
  s.addText("Dapper Dan이 뜯어 만든 옷을 Eric B. & Rakim, Salt-N-Pepa, LL Cool J가 입었고, 그것이 이 브랜드를 아이콘으로 만들었습니다.", {
    x: 1.2, y: 5.78, w: 11, h: 0.34, fontFace: F, fontSize: T.body, color: C.muted, margin: 0 });
  foot(s, "신사임당은 전해지는 일화 · Dapper Dan은 브랜드 기록 (Highsnobiety)");
  mark(s);
  s.addNotes("신사임당이 얼룩 위에 포도를 그린 이야기가 있습니다. 일본에는 킨츠기가 있습니다. 그리고 1988년 할렘에서 같은 일이 일어났습니다. 셋째는 비유가 아니라 MCM 자신의 역사입니다. 2020년에는 그 계보의 스타일리스트 Misa Hylton이 글로벌 크리에이티브 파트너가 됐습니다.");
}

/* ══ 07 페르소나 ══════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHO WE BUILD FOR");
  headline(s, [{ t: "“무리해서 산 거 아니야." }, { t: "3년째 잘 쓰고 있어.”" }], { size: 30, h: 1.6 });

  card(s, 0.85, 3.24, 5.6, 2.5);
  s.addText("서지우 · 28", { x: 1.18, y: 3.54, w: 4.8, h: 0.42, fontFace: F,
    fontSize: 22, bold: true, color: C.white, margin: 0 });
  s.addText("뷰티 브랜드 마케터 4년차 · 서울 1인 가구\n첫 자가 구매 명품이 MCM 백팩 · 주 4회 사용", {
    x: 1.18, y: 4.06, w: 4.9, h: 0.72, fontFace: F, fontSize: T.body,
    color: C.muted, lineSpacing: 22, margin: 0 });
  s.addText("과시하고 싶다.\n그런데 과시로 보이면 안 된다.", { x: 1.18, y: 4.9, w: 4.9, h: 0.72,
    fontFace: F, fontSize: 17, bold: true, color: C.cognac, lineSpacing: 26, margin: 0 });

  const reads = [["3대장을 샀다면", "“무리했네”"], ["아무것도 안 산다면", "“포기했네”"], ["MCM을 샀다면", "“안목 있네”"]];
  reads.forEach((r, i) => {
    const y = 3.24 + i * 0.88, hi = i === 2;
    card(s, 6.85, y, 5.6, 0.72, hi);
    s.addText(r[0], { x: 7.18, y: y + 0.2, w: 2.9, h: 0.32, fontFace: F,
      fontSize: T.body, color: C.muted, margin: 0 });
    s.addText(r[1], { x: 9.9, y: y + 0.16, w: 2.3, h: 0.4, align: "right", fontFace: F,
      fontSize: 18, bold: true, color: hi ? C.cognac : C.dim, margin: 0 });
  });
  s.addText("흠이 서사가 되면, 흠이 있는 쪽이 더 당당해집니다", {
    x: 6.85, y: 6.0, w: 5.6, h: 0.36, align: "center", fontFace: F,
    fontSize: 14, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("큰 지출을 했을 때 두려운 건 통장이 아니라 평판입니다. 흠이 서사가 되는 순간 관계가 뒤집힙니다. 연령대 실측은 미확보이며 페르소나는 가설입니다.");
}

chapter(3, "무엇을 만들었나", "하나의 타임라인, 그리고 AI");

/* ══ 08 공백 ══════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "THE GAP");
  headline(s, ["브랜드는 새것만 보여줍니다"], { size: T.h1 });
  sub(s, "그리고 사용자는 기록을 남기지 않습니다. 두 문제가 같이 있습니다.", 2.08);

  const two = [
    ["브랜드 쪽", "구매 이후 접점이 세일 문자뿐", "사진은 SNS, 여행은 캘린더,\n수선 이력은 브랜드 내부.\n제품 하나의 이야기를 아무도 못 본다."],
    ["사용자 쪽", "기록은 마찰이다", "사진 고르고, 날짜 쓰고, 장소 쓰고,\n설명 쓰고 — 아무도 하지 않는다.\n입력창을 더 주면 더 안 한다."],
  ];
  two.forEach((t, i) => {
    const x = 0.85 + i * 6.1;
    card(s, x, 2.86, 5.75, 2.7);
    s.addText(t[0], { x: x + 0.36, y: 3.12, w: 3, h: 0.32, fontFace: F,
      fontSize: 11.5, color: C.cognac, charSpacing: 1.4, margin: 0 });
    s.addText(t[1], { x: x + 0.36, y: 3.5, w: 5.1, h: 0.44, fontFace: F,
      fontSize: 21, bold: true, color: C.white, margin: 0 });
    s.addText(t[2], { x: x + 0.36, y: 4.1, w: 5.1, h: 1.2, fontFace: F,
      fontSize: T.body, color: C.muted, lineSpacing: 22, margin: 0 });
  });
  s.addText("여기가 AI가 들어갈 자리입니다", { x: 0.85, y: 5.92, w: W - 1.7, h: 0.44,
    align: "center", fontFace: F, fontSize: 20, bold: true, color: C.cognac, margin: 0 });
  mark(s);
  s.addNotes("구매 이후를 채우려는 시도는 계속 있었습니다. 전부 사용자에게 입력을 요구했습니다. 아무도 안 합니다.");
}

/* ══ 09 해결 ══════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "SOLUTION");
  headline(s, ["발견부터 다음 소유자까지, 하나의 타임라인"], { size: 32 });

  const steps = ["발견", "구매", "사용", "관리", "수선", "물려주기"];
  steps.forEach((t, i) => {
    const x = 0.85 + i * 2.0;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.72, w: 1.76, h: 0.86, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: i >= 3 ? C.cognac : C.line, width: i >= 3 ? 1.25 : 0.75 } });
    s.addText(t, { x, y: 2.98, w: 1.76, h: 0.34, align: "center", fontFace: F,
      fontSize: 15, bold: true, color: C.white, margin: 0 });
    if (i < 5) s.addText("→", { x: x + 1.76, y: 3.0, w: 0.24, h: 0.3, align: "center",
      fontFace: F, fontSize: 13, color: C.dim, margin: 0 });
  });
  s.addShape(p.ShapeType.line, { x: 0.85, y: 3.86, w: W - 1.7, h: 0, line: { color: C.cognac, width: 1.25 } });
  s.addText("내가 남긴 기록과 브랜드가 남긴 기록이 같은 줄에 흐릅니다", {
    x: 0.85, y: 3.98, w: W - 1.7, h: 0.34, align: "center", fontFace: F,
    fontSize: 14, color: C.cognac, margin: 0 });

  const notes = [
    ["별도 앱 설치 없음", "제품의 QR·NFC가 곧 진입점입니다."],
    ["브랜드 기록이 함께 흐릅니다", "사진 앱은 수선 이력을 가질 수 없습니다."],
    ["빈 화면을 보여주지 않습니다", "구매 이벤트가 첫 줄로 자동 생성됩니다."],
  ];
  notes.forEach((n, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 4.66, 3.6, 1.52);
    s.addText(n[0], { x: x + 0.32, y: 4.92, w: 3.1, h: 0.36, fontFace: F,
      fontSize: 15, bold: true, color: C.white, margin: 0 });
    s.addText(n[1], { x: x + 0.32, y: 5.36, w: 3.05, h: 0.6, fontFace: F,
      fontSize: 12.5, color: C.muted, lineSpacing: 19, margin: 0 });
  });
  mark(s);
  s.addNotes("핵심은 내 기록과 브랜드의 기록이 같은 줄에 있다는 점입니다. 사진 앱은 브랜드 기록을 못 갖고, 브랜드 시스템은 내 추억을 못 갖습니다.");
}

/* ══ 10 AI ★ ═════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "HOW WE USE AI");
  headline(s, ["AI는 쓰게 하지 않습니다. 대신 써줍니다"], { size: 32 });

  const rows = [
    ["기록", "사진 1장 + 상황 칩 탭", "장소·날짜·제품을 엮어 문장으로 만든다", "구현"],
    ["축적", "아무것도 안 함", "흩어진 기록을 하나의 Recap으로 묶는다", "구현"],
    ["수선", "부위 탭 + 사진", "손상 자리에 어울리는 리폼 시안 3안", "구현"],
    ["인사이트", "아무것도 안 함", "누가, 어떤 상황에, 어떤 제품을 쓰는가", "구현"],
  ];
  s.addText("사용자가 하는 일", { x: 3.15, y: 2.32, w: 3, h: 0.3, fontFace: F,
    fontSize: 11, color: C.dim, charSpacing: 1.2, margin: 0 });
  s.addText("AI가 하는 일", { x: 6.5, y: 2.32, w: 3, h: 0.3, fontFace: F,
    fontSize: 11, color: C.dim, charSpacing: 1.2, margin: 0 });
  rows.forEach((r, i) => {
    const y = 2.72 + i * 0.86, hi = r[0] === "수선";
    card(s, 0.85, y, W - 1.7, 0.74, hi);
    s.addText(r[0], { x: 1.2, y: y + 0.2, w: 1.8, h: 0.34, fontFace: F,
      fontSize: 16, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 3.15, y: y + 0.22, w: 3.2, h: 0.3, fontFace: F,
      fontSize: T.body, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 6.5, y: y + 0.21, w: 4.8, h: 0.32, fontFace: F,
      fontSize: 14.5, color: C.white, bold: hi, margin: 0 });
    s.addText(r[3], { x: 11.4, y: y + 0.22, w: 0.75, h: 0.3, align: "right", fontFace: F,
      fontSize: 11, color: C.cognac, margin: 0 });
  });
  s.addText("사진 한 장, 칩 세 번, 여덟 초. 문장은 AI가 씁니다.", {
    x: 0.85, y: 6.32, w: W - 1.7, h: 0.4, align: "center", fontFace: F,
    fontSize: 18, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("기존 서비스는 사용자에게 입력을 요구했습니다. 저희는 반대로 갑니다. 제품 상태 판정에는 AI를 쓰지 않습니다. 그건 규칙 기반 계산입니다.");
}

/* ══ 11 REMADE ★ ═════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "REMADE");
  headline(s, [
    { t: "흠을 지우지 않습니다." },
    { t: "그 자리에 그립니다.", c: C.cognac },
  ], { size: 32, h: 1.6 });

  const steps = [
    ["01", "긁혔다", "제품 실사 위에서\n부위를 직접 탭한다"],
    ["02", "AI가 그린다", "그 자리에 어울리는\n문양 시안 3안 생성"],
    ["03", "장인이 만든다", "AI는 시안까지.\n실물은 MCM 매장이 제작"],
    ["04", "기록된다", "전후 사진이 타임라인에.\n리폼 이력이 DPP에 남는다"],
  ];
  steps.forEach((st, i) => {
    const x = 0.85 + i * 3.15, hi = i === 2;
    card(s, x, 3.0, 2.85, 2.14, hi);
    s.addText(st[0], { x: x + 0.28, y: 3.24, w: 1, h: 0.34, fontFace: F,
      fontSize: 14, bold: true, color: C.cognac, margin: 0 });
    s.addText(st[1], { x: x + 0.28, y: 3.64, w: 2.4, h: 0.4, fontFace: F,
      fontSize: 18, bold: true, color: C.white, margin: 0 });
    s.addText(st[2], { x: x + 0.28, y: 4.16, w: 2.4, h: 0.76, fontFace: F,
      fontSize: 12.5, color: C.muted, lineSpacing: 19, margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: 0.85, y: 5.42, w: W - 1.7, h: 1.02,
    rectRadius: 0.09, fill: { color: C.card }, line: { color: C.cognac, width: 1.5 } });
  s.addText("리폼하면 보통 리셀가가 떨어집니다. 브랜드 공식 리폼 + DPP 기록이면 오히려 오릅니다.", {
    x: 1.2, y: 5.62, w: 11, h: 0.36, fontFace: F, fontSize: 16, bold: true,
    color: C.white, margin: 0 });
  s.addText("진품성이 유지되고, 거기에 세상에 하나뿐이라는 증명이 붙기 때문입니다.", {
    x: 1.2, y: 6.02, w: 11, h: 0.32, fontFace: F, fontSize: T.body, color: C.muted, margin: 0 });
  mark(s);
  s.addNotes("AI가 손상 부위에 어울리는 문양 시안 세 개를 만들고 실물은 MCM 장인이 만듭니다. AI가 손을 대체하지 않습니다. 시안까지입니다. 그리고 브랜드 공식 리폼에 DPP 기록이 붙으면 리셀 가치가 오히려 오릅니다.");
}

/* ══ 12 MCM 자산 ★ ═══════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "BRAND ASSETS");
  headline(s, ["새로 만들지 않았습니다. 이미 있는 것을 썼습니다"], { size: 31 });

  const rows = [
    ["비세토스 마름모", "바이에른 깃발 = 흰-파란 하늘", "배경에서 바람에 흐르고, 로그에서 멈춰 쌓인다"],
    ["로렐", "승리 · 명예의 상징", "정품 인증 배지 · 멤버십 등급"],
    ["1976 뮌헨 · 여행가방", "창립 품목이 수트케이스", "스토리북의 서사 근거"],
    ["브랜드 아카이브", "1988 Dapper Dan의 해체 · 재조합", "REMADE — 재해석의 전통을 잇는다"],
    ["NFC + Aura DPP", "이미 운영 중", "새로 만들지 않는다. 그 위에 얹는다"],
  ];
  rows.forEach((r, i) => {
    const y = 2.42 + i * 0.82, hi = i >= 3;
    card(s, 0.85, y, W - 1.7, 0.7, hi);
    s.addText(r[0], { x: 1.2, y: y + 0.19, w: 3.1, h: 0.32, fontFace: F,
      fontSize: 15, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 4.5, y: y + 0.2, w: 3.6, h: 0.3, fontFace: F,
      fontSize: 12.5, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 8.3, y: y + 0.19, w: 3.9, h: 0.32, fontFace: F,
      fontSize: T.body, color: C.white, margin: 0 });
  });
  s.addText("저희는 새 시스템을 제안하지 않습니다. 이미 산 것을 쓰게 만듭니다.", {
    x: 0.85, y: 6.42, w: W - 1.7, h: 0.4, align: "center", fontFace: F,
    fontSize: 18, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("비세토스의 마름모는 바이에른 깃발에서 왔고 독일어로 흰-파란 하늘이라는 뜻입니다. 그래서 배경에서 바람에 흐릅니다. 그리고 MCM은 이미 NFC와 블록체인 패스포트를 갖고 있습니다.");
}

/* ══ 13 데모 ═════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "DEMO");
  headline(s, ["매장에서 산 박스가 서비스의 시작점입니다"], { size: 32 });

  const steps = [
    ["01", "스캔", "박스 QR·NFC를 찍으면\n스크롤에 따라 박스가 열린다", "Challenge 02"],
    ["02", "등록", "타임라인 첫 줄이 자동 생성.\n빈 화면을 보여주지 않는다", ""],
    ["03", "기록", "사진 1장 + 상황 칩 →\nAI가 문장을 쓴다", "Challenge 01"],
    ["04", "REMADE", "부위를 탭하면 그 자리에\n리폼 시안이 그려진다", "핵심"],
  ];
  steps.forEach((st, i) => {
    const x = 0.85 + i * 3.15, hi = i === 3;
    card(s, x, 2.6, 2.85, 3.5, hi);
    s.addText(st[0], { x: x + 0.3, y: 2.86, w: 1, h: 0.36, fontFace: F,
      fontSize: 17, bold: true, color: C.cognac, margin: 0 });
    s.addText(st[1], { x: x + 0.3, y: 3.32, w: 2.3, h: 0.42, fontFace: F,
      fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(st[2], { x: x + 0.3, y: 3.92, w: 2.4, h: 0.9, fontFace: F,
      fontSize: T.body, color: C.muted, lineSpacing: 21, margin: 0 });
    if (st[3]) s.addText(st[3], { x: x + 0.3, y: 5.56, w: 2.3, h: 0.3, fontFace: F,
      fontSize: 10.5, color: C.dim, charSpacing: 1, margin: 0 });
  });
  foot(s, "박스를 여는 속도는 사용자가 정합니다. 스크롤을 멈추면 애니메이션도 멈춥니다");
  mark(s);
  s.addNotes("등록하면 구매 기록이 자동으로 첫 줄에 찍힙니다. 그리고 이 화면입니다. 제품 사진 위에서 부위를 직접 누릅니다.");
}

chapter(4, "왜 지금, 무엇으로 버는가", "데이터 · 경쟁 · 타이밍");

/* ══ 14 데이터 ═══════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "DATA ASSET");
  headline(s, ["브랜드가 몰랐던 것이 보입니다"], { size: T.h1 });
  sub(s, "브랜드는 무엇이 팔렸는지는 압니다. 언제, 어떤 상황에 쓰이는지는 모릅니다.", 2.08);

  const cards = [
    ["상황 분포", "출근 · 여행 · 전시 · 모임 · 데이트"],
    ["수선 부위 히트맵", "어느 부위가 자주 상하는가\n→ 다음 제품 설계로"],
    ["도시별 사용", "국가 · 도시 정규화"],
  ];
  cards.forEach((c, i) => {
    const x = 0.85 + i * 3.95, hi = i === 1;
    card(s, x, 2.86, 3.6, 1.94, hi);
    s.addText(c[0], { x: x + 0.32, y: 3.14, w: 3.1, h: 0.4, fontFace: F,
      fontSize: 18, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(c[1], { x: x + 0.32, y: 3.66, w: 3.05, h: 0.8, fontFace: F,
      fontSize: 12.5, color: C.muted, lineSpacing: 19, margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: 0.85, y: 5.1, w: W - 1.7, h: 1.16,
    rectRadius: 0.09, fill: { color: C.card }, line: { color: C.line, width: 0.75 } });
  s.addText("집계는 동의한 사용자만 · 5건 미만 그룹 제외 · 관리자만 조회", {
    x: 1.2, y: 5.34, w: 11, h: 0.38, fontFace: F, fontSize: 16, bold: true,
    color: C.white, margin: 0 });
  s.addText("동의 없이도 개인 기능은 전부 동작합니다. 코드로 보여드릴 수 있습니다.", {
    x: 1.2, y: 5.76, w: 11, h: 0.32, fontFace: F, fontSize: T.body, color: C.muted, margin: 0 });
  mark(s);
  s.addNotes("사용자가 자기 추억을 남기는 과정에서 자연스럽게 얻어집니다. 수선 데이터는 어느 부위가 자주 상하는지를 알려주고 이건 바로 다음 제품 설계에 들어갑니다.");
}

/* ══ 15 경쟁 ═════════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "COMPETITIVE POSITION");
  headline(s, [
    { t: "우리는 DPP를 만들지 않습니다." },
    { t: "DPP 위에서 사는 사람을 만듭니다.", c: C.cognac },
  ], { size: 30, h: 1.6 });

  const rows = [
    ["Aura Consortium", "LVMH 주도 · MCM이 이미 소속", "인프라"],
    ["Arianee", "패스포트 340만+ · 브랜드 50+", "인프라"],
    ["Coachtopia", "제품 중심 순환 · 자사 전용", "제품"],
    ["MCM Luxury Book", "DPP 위의 경험 · 행동 레이어", "경험"],
  ];
  rows.forEach((r, i) => {
    const y = 3.16 + i * 0.82, hi = i === 3;
    card(s, 0.85, y, W - 1.7, 0.7, hi);
    s.addText(r[0], { x: 1.2, y: y + 0.19, w: 3.6, h: 0.32, fontFace: F,
      fontSize: 15, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 5.0, y: y + 0.2, w: 5.4, h: 0.3, fontFace: F,
      fontSize: T.body, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 10.7, y: y + 0.2, w: 1.5, h: 0.3, align: "right", fontFace: F,
      fontSize: 12, color: hi ? C.cognac : C.dim, margin: 0 });
  });
  s.addText("기존 DPP 사업자가 전부 못 하는 것 — 소비자가 두 번째로 앱을 여는 것", {
    x: 0.85, y: 6.5, w: W - 1.7, h: 0.4, align: "center", fontFace: F,
    fontSize: 17, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("MCM은 이미 Aura에 있습니다. 인프라 경쟁에 뛰어들면 집니다. 제조 이력은 한 번 보면 다시 볼 이유가 없습니다. 저희는 소유자 중심이라 재방문이 생깁니다.");
}

/* ══ 16 왜 지금 ══════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "WHY NOW");
  headline(s, ["세 가지가 지금 겹칩니다"], { size: T.h1 });

  const cols = [
    ["01", "브랜드가 준비돼 있다", "MCM은 NFC + Aura 블록체인\n패스포트를 이미 운영 중"],
    ["02", "시장이 증명했다", "Coach는 같은 접근으로 FY2025\n북미 신규 120만 명, 2/3가 Gen Z"],
    ["03", "규제가 밀어준다", "EU ESPR 섬유 위임법 2027년 2분기,\n시행 2028~29년 전망"],
  ];
  cols.forEach((c, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.28, 3.6, 2.04);
    s.addText(c[0], { x: x + 0.32, y: 2.52, w: 1, h: 0.34, fontFace: F,
      fontSize: 15, bold: true, color: C.cognac, margin: 0 });
    s.addText(c[1], { x: x + 0.32, y: 2.92, w: 3.1, h: 0.4, fontFace: F,
      fontSize: 17, bold: true, color: C.white, margin: 0 });
    s.addText(c[2], { x: x + 0.32, y: 3.44, w: 3.05, h: 0.8, fontFace: F,
      fontSize: 12.5, color: C.muted, lineSpacing: 19, margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: 0.85, y: 4.6, w: W - 1.7, h: 1.72,
    rectRadius: 0.09, fill: { color: C.card }, line: { color: C.cognac, width: 1.5 } });
  s.addText("“패스포트는 제품의 수명을 지원하고, 보존하고, 연장하기 위한", {
    x: 1.25, y: 4.86, w: 11, h: 0.38, fontFace: F, fontSize: 18, color: C.white, margin: 0 });
  s.addText("MCM 커뮤니티 내의 향후 서비스와 경험으로의 접근을 연다.”", {
    x: 1.25, y: 5.28, w: 11, h: 0.38, fontFace: F, fontSize: 18, bold: true,
    color: C.cognac, margin: 0 });
  s.addText("MCM 공식 Digital Product Passport 페이지 — 저희 제품이 이 문장의 다음 장입니다", {
    x: 1.25, y: 5.78, w: 11, h: 0.32, fontFace: F, fontSize: 12.5, color: C.muted, margin: 0 });
  foot(s, "규제 일정은 2026년 8월 기준 · 위임법 2027, 시행 2028~29");
  mark(s);
  s.addNotes("MCM 공식 패스포트 페이지에 이렇게 적혀 있습니다. 저희 제품이 이 문장의 다음 장입니다. 2027년 의무화라고 말하지 말고 위임법 2027, 시행 2028에서 29로 나눠 말할 것.");
}

/* ══ 17 수익모델 ═════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "BUSINESS MODEL");
  headline(s, ["흠이 값이 되면, 수선이 매출이 됩니다"], { size: 32 });
  sub(s, "사용자는 무료입니다. 브랜드가 냅니다.", 2.06);

  const rows = [
    ["SaaS 구독", "브랜드", "활성 제품 · 사용자 수 기준 월 이용료 + 인사이트 리포트"],
    ["구축비", "브랜드", "전용 UI/UX · 제품 DB · 관리자 시스템"],
    ["REMADE · Care 중개", "파트너", "리폼 · 세척 · 수선 예약 연결 수수료"],
    ["AI 프리미엄 콘텐츠", "사용자", "고화질 Recap · 기념일 콘텐츠"],
    ["리셀 · 소유권 이전", "파트너", "로드맵"],
  ];
  rows.forEach((r, i) => {
    const y = 2.82 + i * 0.74, hi = i === 2;
    card(s, 0.85, y, W - 1.7, 0.62, hi);
    s.addText(r[0], { x: 1.2, y: y + 0.15, w: 3.3, h: 0.32, fontFace: F,
      fontSize: 15, bold: true, color: i === 4 ? C.dim : (hi ? C.cognac : C.white), margin: 0 });
    s.addText(r[1], { x: 4.7, y: y + 0.17, w: 1.2, h: 0.28, fontFace: F,
      fontSize: 12, color: C.dim, margin: 0 });
    s.addText(r[2], { x: 6.1, y: y + 0.16, w: 6.0, h: 0.3, fontFace: F,
      fontSize: T.body, color: C.muted, margin: 0 });
  });
  s.addText("수선이 비용 센터에서 매출과 로열티의 접점으로 바뀝니다", {
    x: 0.85, y: 6.56, w: W - 1.7, h: 0.4, align: "center", fontFace: F,
    fontSize: 17, bold: true, color: C.white, margin: 0 });
  mark(s);
  s.addNotes("사용자는 무료입니다. 브랜드가 냅니다. 리셀과 소유권 이전은 로드맵입니다.");
}

/* ══ 18 로드맵 ═══════════════════════════ */
{
  const s = p.addSlide(); dark(s);
  eyebrow(s, "ROADMAP");
  headline(s, ["한 브랜드에서 깊게 검증하고, 확장합니다"], { size: 32 });

  const phases = [
    ["Phase 1", "지금", "스토리북 · Care/Repair\nREMADE · 기존 DPP 연동"],
    ["Phase 2", "다음", "Archive Style\n상황 데이터 집계 대시보드"],
    ["Phase 3", "확장", "멀티 브랜드\n리셀 · 소유권 이전 연계"],
  ];
  phases.forEach((ph, i) => {
    const x = 0.85 + i * 3.95, hi = i === 0;
    card(s, x, 2.7, 3.6, 2.24, hi);
    s.addText(ph[0], { x: x + 0.32, y: 2.98, w: 2.2, h: 0.4, fontFace: F,
      fontSize: 19, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(ph[1], { x: x + 2.4, y: 3.04, w: 0.9, h: 0.3, align: "right",
      fontFace: F, fontSize: 12, color: C.dim, margin: 0 });
    s.addText(ph[2], { x: x + 0.32, y: 3.6, w: 3.05, h: 0.9, fontFace: F,
      fontSize: T.body, color: C.muted, lineSpacing: 21, margin: 0 });
  });
  s.addText("MCM은 이미 인프라를 갖고 있습니다.\n저희는 그 위에 경험을 얹습니다.", {
    x: 0.85, y: 5.34, w: W - 1.7, h: 0.9, align: "center", fontFace: F,
    fontSize: 24, bold: true, color: C.white, lineSpacing: 38, margin: 0 });
  s.addText("감사합니다", { x: 0.85, y: 6.5, w: W - 1.7, h: 0.36, align: "center",
    fontFace: F, fontSize: 13, color: C.cognac, charSpacing: 4, margin: 0 });
  s.addNotes("한 브랜드에서 깊게 검증하고 확장합니다. 감사합니다.");
}

p.writeFile({ fileName: "/Users/home/Desktop/likeGonzi/docs/ir/MCM_Luxury_Book_IR.pptx" })
  .then(f => console.log("written:", f));

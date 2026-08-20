const pptxgen = require("pptxgenjs");
const path = require("path");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";                 // 13.3 x 7.5
const W = 13.3, H = 7.5;
const BG = path.join(__dirname, "bg-dark.png");

const C = {
  dark: "12100E", light: "F4F1EC", line: "3A3025",
  cognac: "C4915F", deep: "8B5A2B", white: "FFFFFF", ink: "1A1613",
  muted: "9A8F84", dim: "6E6459",
};
const F = "Apple SD Gothic Neo";

/* ── 프리미티브 ─────────────────────────────
   박스를 쓰지 않는다. 여백과 헤어라인으로만 구분한다. */

const dark = s => { s.background = { color: C.dark }; s.addImage({ path: BG, x: 0, y: 0, w: W, h: H }); };

const mark = s => s.addText("MCM LUXURY BOOK", {
  x: W - 3.4, y: H - 0.55, w: 2.9, h: 0.3, align: "right",
  fontFace: F, fontSize: 9, color: "4A423A", charSpacing: 1.4 });

const eyebrow = (s, t) => s.addText(t, {
  x: 0, y: 0.62, w: W, h: 0.34, align: "center",
  fontFace: F, fontSize: 11.5, bold: true, color: C.cognac, charSpacing: 3.4 });

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
  s.addText("MCM LUXURY BOOK", { x: W - 3.4, y: H - 0.55, w: 2.9, h: 0.3,
    align: "right", fontFace: F, fontSize: 9, color: "B3ABA3", charSpacing: 1.4 });
}

/* ═══ 01 표지 ═══ */
{
  const s = p.addSlide(); dark(s);
  s.addText("MCM LUXURY BOOK", { x: 0.95, y: 0.72, w: 6, h: 0.34, fontFace: F,
    fontSize: 12.5, bold: true, color: C.white, charSpacing: 2.6, margin: 0 });
  s.addText([
    { text: "흠을 지우지 않습니다.", options: { color: C.white, breakLine: true } },
    { text: "나의 것으로 만듭니다", options: { color: C.cognac } },
  ], { x: 0.95, y: 2.5, w: 11.6, h: 2.2, fontFace: F, fontSize: 52, bold: true,
    lineSpacing: 74, margin: 0 });
  s.addText("Challenge 03 · 360° 고객 경험        2026.08", {
    x: 0.98, y: 5.4, w: 11, h: 0.34, fontFace: F, fontSize: 13, color: C.dim, margin: 0 });
  s.addNotes("럭셔리는 새것일 때 가장 비쌉니다. 그래서 사람들은 쓰기를 두려워합니다. 저희는 그 방향을 뒤집었습니다.");
}

/* ═══ 02 챌린지 ═══ */
{
  const s = p.addSlide();
  head(s, "WHICH CHALLENGE", ["저희는 03번을 골랐습니다"], { size: 40 });
  s.addText("360° 고객 경험", { x: 1.0, y: 3.3, w: W - 2, h: 0.6, align: "center",
    fontFace: F, fontSize: 30, bold: true, color: C.cognac, margin: 0 });
  s.addText("발견부터 구매 이후까지, 끊김 없이 로열티를 만드는 여정", {
    x: 1.0, y: 4.0, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 16, color: C.muted, margin: 0 });
  rule(s, 3.6, 4.94, 6.1);
  s.addText("01 AI 기반 프로덕트        02 인터랙티브 리테일", {
    x: 1.0, y: 5.2, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 15, color: C.white, margin: 0 });
  s.addText("03을 제대로 풀면 두 개가 그 안에 들어옵니다", {
    x: 1.0, y: 5.64, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 13, color: C.dim, margin: 0 });
  s.addNotes("세 챌린지 중 3번을 메인으로 골랐습니다. 1번과 2번은 특정 순간을 좋게 만들지만 끊긴 경험은 여전히 끊겨 있습니다. 매장에서 산 박스의 QR을 찍는 순간이 2번이고, 그 뒤 AI가 기록을 만드는 게 1번입니다.");
}

chapter(1, "MCM은 어디에 서 있나", "가격이 아니라 사용 빈도로 보면 자리가 달라진다");

/* ═══ 03 진술 ═══ */
{
  const s = p.addSlide();
  statement(s, ["럭셔리는 새것일 때 가장 비쌉니다"]);
  s.addNotes("모든 럭셔리 브랜드의 광고와 매장은 새것 상태를 보여줍니다.");
}

/* ═══ 04 진술 ═══ */
{
  const s = p.addSlide();
  statement(s, [{ t: "그래서 사람들은" }, { t: "쓰지 않습니다", c: C.cognac }]);
  s.addNotes("비 오는 날 안 들고 나가고, 긁힐까 봐 조심하고, 결국 옷장에 둡니다.");
}

/* ═══ 05 포지셔닝 맵 ═══ */
{
  const s = p.addSlide();
  head(s, "POSITIONING", ["가격이 아니라 사용 빈도로 보면"], { size: 34 });

  const X0 = 2.3, Y0 = 6.35, PW = 8.9, PH = 3.7;
  const zx = X0 + PW * 0.46, zy = Y0 - PH * 0.82, zw = PW * 0.6, zh = PH * 0.64;
  s.addShape(p.ShapeType.roundRect, { x: zx, y: zy, w: zw, h: zh, rectRadius: 0.08,
    fill: { color: C.deep, transparency: 88 }, line: { color: C.cognac, width: 1 } });
  s.addText("매일 쓰는 럭셔리", { x: zx, y: zy - 0.36, w: zw, h: 0.3, align: "center",
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
  statement(s, [{ t: "MCM은 매일 쓸 수 있습니다" }],
    { note: "그것이 이 브랜드가 가진 가장 큰 자산입니다" });
  s.addNotes("가격대가 그걸 허락합니다. 3대장은 못 하는 일입니다.");
}

/* ═══ 07 진술 ═══ */
{
  const s = p.addSlide();
  statement(s, [{ t: "매일 쓰면," }, { t: "상합니다", c: C.cognac }]);
  s.addNotes("쓰면 생기는 일입니다. 그리고 이건 이 구간에만 생기는 문제입니다.");
}

/* ═══ 08 3열 ═══ */
{
  const s = p.addSlide();
  head(s, "THE PARADOX", ["상함을 다루는 방식이 다릅니다"], { size: 34 });
  columns(s, [
    ["3대장", "안 씁니다", "그래서 안 상합니다.\n대신 함께한 시간도 없습니다.", false],
    ["매스 브랜드", "버립니다", "애착이 없어서\n고칠 이유가 없습니다.", false],
    ["MCM", "고칩니다", "버리기엔 아깝고,\n고쳐 쓸 만한 값입니다.", true],
  ], 3.42);
  s.addNotes("3대장은 안 쓰니까 안 상합니다. 매스 브랜드는 상하면 버립니다. MCM 구간만 매일 쓰고, 상하고, 버리기엔 아까운 물건입니다.");
}

/* ═══ 10 실제 불편 ═══ */
{
  const s = p.addSlide();
  head(s, "WHAT ACTUALLY HURTS", ["기록이 없으면, 값을 잃습니다"], { size: 36 });
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
    x: 1.0, y: 5.34, w: W - 2, h: 0.42, align: "center", fontFace: F,
    fontSize: 18, bold: true, color: C.white, margin: 0 });
  s.addText("트렌비 감정센터 · 명품 플랫폼 소비자 조사 · 한국소비자원 (2025)", {
    x: 0.8, y: H - 0.5, w: W - 1.6, h: 0.34, align: "center", fontFace: F,
    fontSize: 11, color: C.dim, margin: 0 });
  s.addNotes("불편은 감성이 아니라 돈입니다. 같은 제품도 구성품과 이력이 있느냐에 따라 리셀 가격이 30에서 40퍼센트 갈립니다. 명품 플랫폼에 소비자가 요구한 개선점 1위가 정품 보증 시스템이었고, 감정에서 걸러진 가품이 50개 중 1개입니다. 그런데 그 증빙을 지금은 각자 종이로 보관합니다. 보증서를 잃어버리는 순간 값도 사라집니다.");
}

/* ═══ 09 진술 ═══ */
{
  const s = p.addSlide();
  statement(s, ["지금 이 문제를 푸는 브랜드는 없습니다"], { size: 40 });
  s.addNotes("수선은 있지만 원래대로 되돌려주는 것뿐입니다.");
}

chapter(2, "그래서 만들었습니다", "하나의 타임라인, 그리고 흠을 다루는 방식");

/* ═══ 16 타임라인 ═══ */
{
  const s = p.addSlide();
  head(s, "SOLUTION", ["하나의 타임라인"], { size: 40 });
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
  s.addText("사진 앱은 수선 이력을 가질 수 없고, 브랜드 시스템은 내 추억을 가질 수 없습니다", {
    x: 1.0, y: 5.76, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  s.addNotes("별도 앱 설치가 없습니다. 제품의 QR·NFC가 진입점입니다. 등록하면 구매 기록이 첫 줄로 자동 생성돼 빈 화면을 보여주지 않습니다.");
}

/* ═══ 14 제품 개요 ═══ */
{
  const s = p.addSlide();
  head(s, "WHAT WE BUILT", ["타임라인 위에 세 가지가 얹힙니다"], { size: 34 });
  columns(s, [
    ["기록", "쌓인다", "사진 한 장을 올리면\nAI가 문장으로 남긴다.", false],
    ["케어 · 수선", "이어진다", "제품 실사 위에서 부위를 눌러\n접수하고, 이력이 그대로 남는다.", false],
    ["REMADE", "값이 된다", "긁힌 자리를 나만의 무늬로.\nAI 시안, 장인 제작.", true],
  ], 3.42);
  s.addNotes("타임라인 하나 위에 세 가지가 얹힙니다. 기록, 케어와 수선, 그리고 REMADE입니다. 이 뒤로는 왜 이렇게 만들었는지와 어떻게 동작하는지를 말씀드립니다.");
}

/* ═══ 10 진술 ★ ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "흠을 지우지 않습니다." },
    { t: "그 자리에 그립니다.", c: C.cognac },
  ], { size: 44 });
  s.addNotes("저희는 수선을 되돌리는 일로 보지 않습니다. 그 자리에 그립니다. 그러면 세상에 하나뿐인 물건이 됩니다.");
}

/* ═══ 11 3열 계보 ═══ */
{
  const s = p.addSlide();
  head(s, "THIS IS NOT NEW", ["같은 생각이 이미 세 번 있었습니다"], { size: 34 });
  columns(s, [
    ["조선", "신사임당의 포도", "치마 얼룩 위에 포도를 그렸다.\n버려질 옷이 오히려 팔렸다.", false],
    ["일본", "킨츠기 金継ぎ", "깨진 자리를 금으로 잇는다.\n흉터를 감추지 않고 드러낸다.", false],
    ["1988 · 할렘", "Dapper Dan", "MCM 코냑 비세토스를 뜯어\n무대의상으로 다시 꿰맸다.", true],
  ], 3.42);
  s.addText("신사임당은 전해지는 일화 · Dapper Dan은 브랜드 기록 (Highsnobiety)", {
    x: 0.8, y: H - 0.78, w: W - 1.6, h: 0.34, align: "center", fontFace: F,
    fontSize: 11, color: C.dim, margin: 0 });
  s.addNotes("신사임당이 얼룩 위에 포도를 그린 이야기가 있습니다. 일본에는 킨츠기가 있습니다. 그리고 1988년 할렘에서 같은 일이 일어났습니다.");
}

/* ═══ 12 진술 ★ ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "앞의 둘은 비유입니다." },
    { t: "셋째는 MCM 자신의 역사입니다.", c: C.cognac },
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
  s.addText("흠이 서사가 되면, 흠이 있는 쪽이 더 당당해집니다", {
    x: 1.0, y: 6.06, w: W - 2, h: 0.34, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, margin: 0 });
  mark(s);
  s.addNotes("큰 지출을 했을 때 두려운 건 통장이 아니라 평판입니다. 연령대 실측은 미확보이며 페르소나는 가설입니다.");
}

chapter(3, "어떻게 동작하나", "AI가 마찰을 없애고, 흠을 무늬로 바꾼다");

/* ═══ 22 마찰 ═══ */
{
  const s = p.addSlide();
  head(s, "THE FRICTION", ["기록은 흩어지고, 사라집니다"], { size: 36 });
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

/* ═══ 17 진술 ★ ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "AI는 쓰게 하지 않습니다." },
    { t: "대신 써줍니다.", c: C.cognac },
  ], { size: 44 });
  s.addNotes("사진 한 장, 상황 칩 세 번, 여덟 초. 문장은 AI가 씁니다.");
}

/* ═══ 18 AI 3열 ═══ */
{
  const s = p.addSlide();
  head(s, "HOW WE USE AI", ["사용자는 사진 한 장만 올립니다"], { size: 34 });
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

/* ═══ 19 REMADE ═══ */
{
  const s = p.addSlide();
  head(s, "REMADE", ["긁힌 자리가 나만의 무늬가 됩니다"], { size: 34 });
  const steps = [["01", "긁혔다"], ["02", "AI가 그린다"], ["03", "장인이 만든다"], ["04", "기록된다"]];
  const gap = (W - 2.4) / steps.length;
  steps.forEach((st, i) => {
    const x = 1.2 + gap * i;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 3.36, w: 0, h: 1.1,
      line: { color: C.line, width: 0.75 } });
    s.addText(st[0], { x: x + 0.36, y: 3.4, w: 1, h: 0.34, fontFace: F,
      fontSize: 13, bold: true, color: C.cognac, margin: 0 });
    s.addText(st[1], { x: x + 0.36, y: 3.82, w: gap - 0.7, h: 0.44, fontFace: F,
      fontSize: 22, bold: true, color: i === 2 ? C.cognac : C.white, margin: 0 });
  });
  s.addText("AI는 시안까지입니다. 실물은 MCM 장인이 만듭니다.", {
    x: 1.0, y: 5.08, w: W - 2, h: 0.42, align: "center", fontFace: F,
    fontSize: 20, bold: true, color: C.white, margin: 0 });
  rule(s, 4.4, 5.76, 4.5);
  s.addText("리폼하면 보통 리셀가가 떨어집니다.\n브랜드 공식 리폼 + DPP 기록이면 오히려 오릅니다.", {
    x: 1.0, y: 6.02, w: W - 2, h: 0.8, align: "center", fontFace: F,
    fontSize: 14, color: C.muted, lineSpacing: 23, margin: 0 });
  s.addNotes("AI가 손상 부위에 어울리는 문양 시안 세 개를 만들고 실물은 MCM 장인이 만듭니다. AI가 손을 대체하지 않습니다. 진품성이 유지되고 세상에 하나뿐이라는 증명이 붙기 때문에 값이 오릅니다.");
}

/* ═══ 20 진술 ★ ═══ */
{
  const s = p.addSlide();
  statement(s, [{ t: "새로 만들지 않았습니다." }, { t: "이미 있는 것을 썼습니다.", c: C.cognac }],
    { size: 40 });
  s.addNotes("MCM은 이미 NFC와 Aura 블록체인 패스포트를 갖고 있습니다.");
}

/* ═══ 21 자산 목록 ═══ */
{
  const s = p.addSlide();
  head(s, "BRAND ASSETS", ["브랜드 자산을 장식으로 쓰지 않았습니다"], { size: 32 });
  const list = [
    ["비세토스 마름모", "바이에른 깃발 = 흰-파란 하늘", "배경에서 바람에 흐른다"],
    ["로렐", "승리 · 명예의 상징", "정품 인증 배지"],
    ["1988 Dapper Dan", "해체하고 다시 꿰맨 역사", "REMADE"],
    ["NFC + Aura DPP", "이미 운영 중", "그 위에 얹는다"],
  ];
  list.forEach((r, i) => {
    const y = 3.1 + i * 0.9, hi = i >= 2;
    if (i > 0) rule(s, 1.2, y - 0.12, W - 2.4);
    s.addText(r[0], { x: 1.3, y: y + 0.1, w: 3.4, h: 0.38, fontFace: F,
      fontSize: 18, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 5.0, y: y + 0.14, w: 4.0, h: 0.34, fontFace: F,
      fontSize: 14, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 9.3, y: y + 0.12, w: 2.7, h: 0.36, align: "right", fontFace: F,
      fontSize: 15, color: C.white, margin: 0 });
  });
  s.addNotes("비세토스의 마름모는 바이에른 깃발에서 왔고 독일어로 흰-파란 하늘이라는 뜻입니다. 그래서 배경에서 바람에 흐릅니다.");
}

/* ═══ 22 데모 ═══ */
{
  const s = p.addSlide();
  head(s, "DEMO", ["매장에서 산 박스가 시작점입니다"], { size: 36 });
  const steps = [["스캔", "박스를 열면"], ["등록", "첫 줄이 찍히고"], ["기록", "AI가 쓰고"], ["REMADE", "그 자리에 그린다"]];
  const gap = (W - 2.4) / steps.length;
  steps.forEach((st, i) => {
    const x = 1.2 + gap * i, hi = i === 3;
    if (i > 0) s.addShape(p.ShapeType.line, { x, y: 3.6, w: 0, h: 1.3,
      line: { color: C.line, width: 0.75 } });
    s.addText(st[0], { x: x + 0.36, y: 3.7, w: gap - 0.7, h: 0.46, fontFace: F,
      fontSize: 24, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(st[1], { x: x + 0.36, y: 4.32, w: gap - 0.7, h: 0.36, fontFace: F,
      fontSize: 14, color: C.muted, margin: 0 });
  });
  s.addText("박스를 여는 속도는 사용자가 정합니다", {
    x: 1.0, y: 5.5, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 18, color: C.white, margin: 0 });
  s.addNotes("스크롤을 멈추면 애니메이션도 멈춥니다. 수선은 제품 사진 위에서 부위를 직접 누릅니다.");
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
  s.addText("집계는 동의한 사용자만 · 5건 미만 그룹 제외", {
    x: 1.0, y: 6.14, w: W - 2, h: 0.36, align: "center", fontFace: F,
    fontSize: 14, color: C.white, margin: 0 });
  s.addNotes("사용자가 자기 추억을 남기는 과정에서 자연스럽게 얻어집니다. 동의 없이도 개인 기능은 전부 동작합니다. 코드로 보여드릴 수 있습니다.");
}

/* ═══ 24 진술 ★ ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "우리는 DPP를 만들지 않습니다." },
    { t: "DPP 위에서 사는 사람을 만듭니다.", c: C.cognac },
  ], { size: 36 });
  s.addNotes("MCM은 이미 Aura에 있습니다. 인프라 경쟁에 뛰어들면 집니다.");
}

/* ═══ 25 경쟁 ═══ */
{
  const s = p.addSlide();
  head(s, "COMPETITIVE POSITION", ["기존 DPP가 못 하는 것 하나"], { size: 36 });
  s.addText("소비자가 두 번째로 앱을 여는 것", {
    x: 1.0, y: 2.62, w: W - 2, h: 0.5, align: "center", fontFace: F,
    fontSize: 28, bold: true, color: C.cognac, margin: 0 });
  const list = [
    ["Aura Consortium", "LVMH 주도 · MCM이 이미 소속", "인프라"],
    ["Arianee", "패스포트 340만+ · 브랜드 50+", "인프라"],
    ["Coachtopia", "제품 중심 순환 · 자사 전용", "제품"],
    ["MCM Luxury Book", "DPP 위의 경험 · 행동 레이어", "경험"],
  ];
  list.forEach((r, i) => {
    const y = 3.72 + i * 0.84, hi = i === 3;
    if (i > 0) rule(s, 1.4, y - 0.1, W - 2.8);
    s.addText(r[0], { x: 1.5, y: y + 0.1, w: 3.6, h: 0.36, fontFace: F,
      fontSize: 17, bold: true, color: hi ? C.cognac : C.white, margin: 0 });
    s.addText(r[1], { x: 5.3, y: y + 0.13, w: 5.0, h: 0.32, fontFace: F,
      fontSize: 13.5, color: C.muted, margin: 0 });
    s.addText(r[2], { x: 10.4, y: y + 0.13, w: 1.4, h: 0.32, align: "right", fontFace: F,
      fontSize: 13, color: hi ? C.cognac : C.dim, margin: 0 });
  });
  s.addNotes("제조 이력은 한 번 보면 다시 볼 이유가 없습니다. 저희는 소유자 중심이라 재방문이 생기고, 그 재방문이 데이터가 됩니다.");
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
    ["REMADE · Care 중개", "리폼 · 세척 · 수선 예약 연결 수수료"],
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
  s.addText("수선이 비용 센터에서 로열티의 접점으로 바뀝니다", {
    x: 1.0, y: 6.72, w: W - 2, h: 0.4, align: "center", fontFace: F,
    fontSize: 16, color: C.white, margin: 0 });
  s.addNotes("리셀과 소유권 이전은 로드맵입니다.");
}

/* ═══ 28 마무리 ═══ */
{
  const s = p.addSlide();
  statement(s, [
    { t: "MCM은 이미 인프라를 갖고 있습니다." },
    { t: "저희는 그 위에 경험을 얹습니다.", c: C.cognac },
  ], { size: 34 });
  s.addText("감사합니다", { x: 1.0, y: 6.1, w: W - 2, h: 0.4, align: "center",
    fontFace: F, fontSize: 14, color: C.dim, charSpacing: 4, margin: 0 });
  s.addNotes("Phase 1은 스토리북과 Care/Repair, REMADE, 기존 DPP 연동입니다. Phase 2는 Archive Style과 B2B 대시보드, Phase 3은 멀티 브랜드와 리셀 연계입니다. 감사합니다.");
}

p.writeFile({ fileName: "/Users/home/Desktop/likeGonzi/docs/ir/MCM_Luxury_Book_IR.pptx" })
  .then(f => console.log("written:", f));

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PptxGenJS = require('pptxgenjs');
const sharp = require('sharp');

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'output', 'presentations');
const TMP_DIR = path.join(ROOT, 'tmp', 'ir-assets');
const PPTX_PATH = path.join(OUT_DIR, 'MCM_Storybook_IR_2026.pptx');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

const ASSETS = {
  cover: path.join(ROOT, 'public', 'camera', 'record-stark.png'),
  logo: path.join(ROOT, 'public', 'camera', 'mcm-logo.png'),
  home: path.join(ROOT, 'docs', 'figma-audit-2026-08-15', '03-home.png'),
  product: path.join(ROOT, 'docs', 'figma-audit-2026-08-15', '04-product.png'),
  care: path.join(ROOT, 'docs', 'figma-audit-2026-08-15', 'figma-05-care.png'),
  storybook: path.join(ROOT, 'docs', 'figma-audit-2026-08-15', '06-storybook.png'),
  timeline: path.join(ROOT, 'docs', 'figma-audit-2026-08-15', '07-timeline.png'),
};

for (const [name, assetPath] of Object.entries(ASSETS)) {
  if (!fs.existsSync(assetPath)) throw new Error(`Missing asset: ${name} (${assetPath})`);
}

async function cropPhone(source, name, top = 0) {
  const output = path.join(TMP_DIR, `${name}.png`);
  const meta = await sharp(source).metadata();
  const width = Math.min(393, meta.width ?? 393);
  const height = Math.min(852, (meta.height ?? 852) - top);
  await sharp(source)
    .extract({ left: 0, top, width, height })
    .resize(393, 852, { fit: 'cover', position: 'top' })
    .png()
    .toFile(output);
  return output;
}

ASSETS.homeTop = await cropPhone(ASSETS.home, 'home-top');
ASSETS.productTop = await cropPhone(ASSETS.product, 'product-top');
ASSETS.storybookTop = await cropPhone(ASSETS.storybook, 'storybook-top');
ASSETS.timelineTop = await cropPhone(ASSETS.timeline, 'timeline-top');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'MCM Storybook Prototype Team';
pptx.company = 'MCM Storybook';
pptx.subject = 'MCM Storybook Digital Life Platform IR';
pptx.title = 'MCM Storybook IR 2026';
pptx.lang = 'ko-KR';
pptx.theme = {
  headFontFace: 'Apple SD Gothic Neo',
  bodyFontFace: 'Apple SD Gothic Neo',
  lang: 'ko-KR',
};
pptx.defineLayout({ name: 'WIDE_CUSTOM', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE_CUSTOM';

const S = pptx.ShapeType;
const C = {
  ink: '1C1917',
  paper: 'FAF8F5',
  white: 'FFFFFF',
  cognac: '8B5A2B',
  cognacLight: 'C9945A',
  taupe: 'A48F7A',
  sand: 'E9E0D6',
  cream: 'F3EEE8',
  muted: '77706A',
  lightMuted: 'B7ADA4',
  navy: '17324D',
  navySoft: '274A69',
  green: '436B5A',
  red: 'A6473C',
};

const FONT = 'Apple SD Gothic Neo';
const SERIF = 'Times New Roman';

function addText(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: FONT,
    fontSize: 16,
    color: C.ink,
    margin: 0,
    valign: 'mid',
    breakLine: false,
    fit: 'shrink',
    ...options,
  });
}

function addRule(slide, x, y, w, color = C.sand, width = 1) {
  slide.addShape(S.line, { x, y, w, h: 0, line: { color, width } });
}

function addDiamond(slide, x, y, size, color, transparency = 0) {
  slide.addShape(S.rect, {
    x, y, w: size, h: size,
    rotate: 45,
    fill: { color, transparency },
    line: { color, transparency: Math.min(100, transparency + 8), width: 0.5 },
  });
}

function addPattern(slide, dark = false, density = 7) {
  const color = dark ? C.cognacLight : C.cognac;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < density; col += 1) {
      const x = 8.8 + col * 0.65 + (row % 2 ? 0.32 : 0);
      const y = 0.45 + row * 0.65;
      addDiamond(slide, x, y, 0.12, color, dark ? 82 : 90);
    }
  }
}

function addFooter(slide, page, dark = false, label = 'MCM · STORYBOOK') {
  const color = dark ? C.lightMuted : C.muted;
  addText(slide, label, 0.72, 7.08, 2.5, 0.2, {
    fontSize: 8.5,
    color,
    charSpacing: 1.4,
  });
  addText(slide, String(page).padStart(2, '0'), 12.2, 7.08, 0.42, 0.2, {
    fontSize: 8.5,
    color,
    align: 'right',
  });
}

function baseSlide({ dark = false, page, eyebrow, title, subtitle, pattern = true }) {
  const slide = pptx.addSlide();
  slide.background = { color: dark ? C.ink : C.paper };
  if (pattern) addPattern(slide, dark);
  const main = dark ? C.white : C.ink;
  const sub = dark ? C.lightMuted : C.muted;
  if (eyebrow) addText(slide, eyebrow.toUpperCase(), 0.75, 0.45, 3.2, 0.22, {
    fontSize: 9,
    bold: true,
    color: dark ? C.cognacLight : C.cognac,
    charSpacing: 2.1,
  });
  if (title) addText(slide, title, 0.75, 0.82, 11.8, 0.92, {
    fontSize: 26,
    bold: true,
    color: main,
    breakLine: true,
    valign: 'top',
    lineSpacingMultiple: 0.88,
  });
  if (subtitle) addText(slide, subtitle, 0.76, 1.73, 10.8, 0.38, {
    fontSize: 11.5,
    color: sub,
    valign: 'top',
  });
  addFooter(slide, page, dark);
  return slide;
}

function roundedCard(slide, x, y, w, h, { fill, line = fill, radius = 0.14, transparency = 0, shadow = false } = {}) {
  slide.addShape(S.roundRect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill ?? C.white, transparency },
    line: { color: line ?? C.sand, width: 0.8 },
    shadow: shadow ? { type: 'outer', color: C.ink, opacity: 0.13, blur: 2, angle: 45, distance: 1 } : undefined,
  });
}

function numberedCard(slide, x, y, w, h, number, title, body, dark = false) {
  roundedCard(slide, x, y, w, h, {
    fill: dark ? '24201E' : C.white,
    line: dark ? '3A3330' : C.sand,
  });
  addText(slide, number, x + 0.28, y + 0.22, 0.4, 0.25, {
    fontSize: 9.5,
    bold: true,
    color: dark ? C.cognacLight : C.cognac,
  });
  addText(slide, title, x + 0.28, y + 0.58, w - 0.56, 0.42, {
    fontSize: 15,
    bold: true,
    color: dark ? C.white : C.ink,
  });
  addText(slide, body, x + 0.28, y + 1.1, w - 0.56, h - 1.32, {
    fontSize: 10.5,
    color: dark ? C.lightMuted : C.muted,
    valign: 'top',
    breakLine: true,
    lineSpacingMultiple: 1.06,
  });
}

function addPhone(slide, imagePath, x, y, w, h, caption) {
  slide.addShape(S.roundRect, {
    x, y, w, h,
    fill: { color: C.ink },
    line: { color: '55483E', width: 1 },
    shadow: { type: 'outer', color: '000000', opacity: 0.24, blur: 3, angle: 45, distance: 1.5 },
  });
  slide.addImage({
    path: imagePath,
    x: x + 0.09,
    y: y + 0.11,
    w: w - 0.18,
    h: h - 0.22,
    sizing: { type: 'cover', w: w - 0.18, h: h - 0.22 },
  });
  if (caption) addText(slide, caption, x, y + h + 0.16, w, 0.26, {
    fontSize: 9.5,
    color: C.lightMuted,
    align: 'center',
  });
}

function addCheckDot(slide, x, y, active, dark = false) {
  slide.addShape(S.ellipse, {
    x, y, w: 0.13, h: 0.13,
    fill: { color: active ? (dark ? C.cognacLight : C.cognac) : (dark ? '4C4643' : 'D8D0C9') },
    line: { color: active ? (dark ? C.cognacLight : C.cognac) : (dark ? '4C4643' : 'D8D0C9'), width: 0.4 },
  });
}

// 01. Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addImage({ path: ASSETS.cover, x: 6.4, y: 0, w: 6.93, h: 7.5, sizing: { type: 'cover', w: 6.93, h: 7.5 } });
  slide.addShape(S.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.ink, transparency: 20 }, line: { transparency: 100 } });
  slide.addShape(S.rect, { x: 0, y: 0, w: 7.4, h: 7.5, fill: { color: C.ink, transparency: 2 }, line: { transparency: 100 } });
  slide.addShape(S.rect, { x: 6.2, y: 0, w: 2.2, h: 7.5, fill: { color: C.ink, transparency: 34 }, line: { transparency: 100 } });
  slide.addImage({ path: ASSETS.logo, x: 0.72, y: 0.58, w: 0.55, h: 0.42, transparency: 0 });
  addText(slide, 'MCM · STORYBOOK', 1.45, 0.66, 3.8, 0.25, { fontSize: 10, color: C.white, charSpacing: 2.4 });
  addText(slide, '제품의 이력을 넘어,\n제품과 함께한 삶까지', 0.78, 2.02, 6.1, 1.42, {
    fontSize: 30,
    bold: true,
    color: C.white,
    breakLine: true,
    valign: 'top',
    lineSpacingMultiple: 0.88,
  });
  addText(slide, 'MCM 디지털 라이프 플랫폼', 0.8, 3.65, 4.8, 0.34, { fontSize: 16, color: C.cognacLight, bold: true });
  addText(slide, 'Digital Product Passport 위에 Story · Care · Ownership을 연결하는 반응형 웹 프로토타입', 0.8, 4.2, 5.35, 0.68, {
    fontSize: 11.5,
    color: C.lightMuted,
    breakLine: true,
    valign: 'top',
  });
  addText(slide, 'PROTOTYPE IR  ·  2026.08', 0.8, 6.66, 3.8, 0.25, { fontSize: 9, color: C.lightMuted, charSpacing: 1.7 });
  slide.addNotes('구매 이후의 브랜드 경험을 제품별 Storybook으로 이어가는 MCM 디지털 라이프 플랫폼입니다. 제품 정보만 관리하는 것이 아니라, 제품과 함께한 시간과 관리 이력을 하나의 이야기로 연결합니다.');
}

// 02. Problem
{
  const slide = baseSlide({
    dark: true,
    page: 2,
    eyebrow: 'Problem',
    title: '구매는 끝났지만,\n제품의 이야기는 시작되지 못합니다',
    subtitle: '고객 문제와 해커톤 구현 제약을 분리해 정의했습니다.',
  });
  const cards = [
    ['01', '브랜드 경험의 단절', '구매 이후 접점이 안내·프로모션·A/S에 머물러 관계가 이어지지 않습니다.'],
    ['02', '기록과 이력의 파편화', '사진·장소·추억·관리·수선 정보가 서로 다른 서비스와 시스템에 흩어집니다.'],
    ['03', '제품 정보만 있는 DPP', '진품성과 출처는 증명하지만, 고객이 왜 오래 간직했는지는 남기기 어렵습니다.'],
  ];
  cards.forEach((card, index) => numberedCard(slide, 0.78 + index * 4.17, 2.45, 3.75, 2.55, ...card, true));
  addRule(slide, 0.8, 5.42, 11.72, '3A3330', 0.8);
  addText(slide, 'TEAM CONSTRAINTS', 0.82, 5.68, 1.7, 0.22, { fontSize: 8.5, bold: true, color: C.cognacLight, charSpacing: 1.5 });
  addText(slide, '브랜드 내부 데이터 접근 · 직접 시스템 연동 · 제한된 개발 기간 · Vision AI 범위', 2.42, 5.65, 8.7, 0.28, { fontSize: 10.5, color: C.lightMuted });
  addText(slide, '※ 구현 제약은 고객 문제로 과장하지 않고 MVP 범위 판단 기준으로 사용합니다.', 0.82, 6.15, 8.6, 0.25, { fontSize: 9.5, color: '827A75' });
  slide.addNotes('핵심 고객 문제는 두 가지입니다. 구매 이후 브랜드 관계가 끊기고, 제품과 함께한 기억과 관리 이력이 흩어집니다. 데이터와 AI 범위는 고객 문제가 아니라 팀의 구현 제약이므로 별도로 관리했습니다.');
}

// 03. User insight
{
  const slide = baseSlide({
    page: 3,
    eyebrow: 'User Insight',
    title: '가격보다 시간을 기록할 때,\n소비는 관계가 됩니다',
    subtitle: 'Primary persona hypothesis · 서지우, 28세, 경험 중심 소비자',
  });
  roundedCard(slide, 0.78, 2.42, 3.25, 3.72, { fill: C.white, line: C.sand, shadow: true });
  addText(slide, 'PRIMARY PERSONA', 1.08, 2.75, 2.5, 0.23, { fontSize: 8.5, bold: true, color: C.cognac, charSpacing: 1.6 });
  addText(slide, '서지우 · 28', 1.08, 3.2, 2.5, 0.46, { fontSize: 22, bold: true });
  addText(slide, '뷰티 브랜드 마케터\n첫 자가 구매 MCM 백팩\n주 4회 사용 · 앱 설치에 인색', 1.08, 3.9, 2.45, 1.1, { fontSize: 12, color: C.muted, breakLine: true, valign: 'top', lineSpacingMultiple: 1.08 });
  addText(slide, '“무리해서 산 게 아니라\n오래 잘 쓰고 있어요.”', 1.08, 5.2, 2.48, 0.62, { fontSize: 14, color: C.cognac, bold: true, breakLine: true, valign: 'top' });

  const moments = [
    ['3년 썼다', '충동구매가 아니라는 증거'],
    ['파리에 같이 갔다', '제품이 삶에 들어왔다는 기록'],
    ['수선을 받았다', '나는 관리하는 사람이라는 태도'],
  ];
  moments.forEach(([title, body], index) => {
    const y = 2.62 + index * 1.17;
    addDiamond(slide, 4.72, y + 0.12, 0.16, C.cognac, 0);
    if (index < moments.length - 1) slide.addShape(S.line, { x: 4.8, y: y + 0.36, w: 0, h: 0.86, line: { color: C.taupe, width: 1 } });
    addText(slide, title, 5.2, y, 2.2, 0.38, { fontSize: 17, bold: true });
    addText(slide, body, 7.45, y + 0.03, 4.25, 0.34, { fontSize: 11, color: C.muted });
  });
  roundedCard(slide, 4.67, 5.92, 7.35, 0.72, { fill: C.ink, line: C.ink });
  addText(slide, 'Storybook은 자랑 도구가 아니라, 오래 쓴 시간을 증명하는 관계의 기록입니다.', 5.02, 6.08, 6.7, 0.33, { fontSize: 13.5, bold: true, color: C.white, align: 'center' });
  slide.addNotes('Primary persona는 실제 조사 결과가 아니라 이번 프로토타입의 의사결정을 위한 가설입니다. 이 사용자는 가격이 아니라 오래 쓴 시간, 여행, 수선 이력으로 자신의 소비를 정당화합니다.');
}

// 04. Solution layers
{
  const slide = baseSlide({
    dark: true,
    page: 4,
    eyebrow: 'Solution',
    title: 'DPP가 제품을 증명하고,\nStorybook이 관계를 증명합니다',
    subtitle: '기존 Digital Product Passport를 대체하지 않고 고객 경험 레이어를 확장합니다.',
  });
  roundedCard(slide, 0.82, 2.4, 5.6, 3.58, { fill: '24201E', line: '3B3430' });
  addText(slide, 'OFFICIAL DPP LAYER', 1.15, 2.76, 3, 0.22, { fontSize: 8.5, bold: true, color: C.cognacLight, charSpacing: 1.7 });
  addText(slide, '제품이 어디서 왔는가', 1.15, 3.15, 4.55, 0.42, { fontSize: 20, bold: true, color: C.white });
  ['진품성·소유권', '소재·제조·유통', '환경 영향·인증'].forEach((item, index) => {
    addCheckDot(slide, 1.18, 3.97 + index * 0.53, true, true);
    addText(slide, item, 1.48, 3.88 + index * 0.53, 3.6, 0.3, { fontSize: 11.5, color: C.lightMuted });
  });
  addText(slide, 'MCM 기존 자산', 1.15, 5.48, 2.2, 0.24, { fontSize: 9.5, color: '817973' });

  roundedCard(slide, 6.85, 2.4, 5.65, 3.58, { fill: C.cognac, line: C.cognac });
  addText(slide, 'MEMORY GRAPH LAYER', 7.2, 2.76, 3, 0.22, { fontSize: 8.5, bold: true, color: C.white, charSpacing: 1.7 });
  addText(slide, '제품과 어떻게 살아왔는가', 7.2, 3.15, 4.65, 0.42, { fontSize: 20, bold: true, color: C.white });
  ['사진·날짜·장소·메모', '케어·수선 전후 이력', 'Story·Recap·소유권 이전'].forEach((item, index) => {
    addCheckDot(slide, 7.23, 3.97 + index * 0.53, true, true);
    addText(slide, item, 7.53, 3.88 + index * 0.53, 3.9, 0.3, { fontSize: 11.5, color: C.white });
  });
  addText(slide, 'Storybook 확장 레이어', 7.2, 5.48, 2.7, 0.24, { fontSize: 9.5, color: 'F2DCC7' });
  slide.addShape(S.chevron, { x: 6.36, y: 3.76, w: 0.58, h: 0.74, fill: { color: C.paper }, line: { transparency: 100 } });
  addText(slide, 'Source: MCM 공식 Digital Product Passport · Aura Blockchain Consortium (확인 2026.08.15)', 0.84, 6.42, 9.3, 0.22, { fontSize: 8, color: '77706A' });
  slide.addNotes('MCM은 일부 제품에 NFC 기반 Digital Product Passport를 운영하고 있습니다. Storybook은 진품성과 소유권을 증명하는 DPP 위에 사진, 기억, 케어, 수선, 리캡을 연결하는 고객 경험 레이어입니다.');
}

// 05. Journey
{
  const slide = baseSlide({
    page: 5,
    eyebrow: 'Customer Journey',
    title: '한 번의 터치에서 시작해,\n제품의 다음 소유자까지 이어집니다',
    subtitle: '앱 설치 없이 제품 페이지에서 구매·사용·관리·수선·리캡·이전을 연결합니다.',
  });
  const journey = [
    ['01', 'TOUCH', 'QR / NFC', '제품 태그·패키지'],
    ['02', 'ACTIVATE', '제품 등록', '개인 Storybook 시작'],
    ['03', 'RECORD', '사진 기록', '날짜·장소·메모'],
    ['04', 'CARE', '관리·수선', '전후 사진·작업 내용'],
    ['05', 'RECAP', 'AI Story', '누적 경험 재구성'],
    ['06', 'CONTINUE', '소유권 이전', '다음 생애주기 연결'],
  ];
  journey.forEach(([num, kicker, title, body], index) => {
    const x = 0.72 + index * 2.08;
    if (index < journey.length - 1) slide.addShape(S.line, { x: x + 1.68, y: 3.47, w: 0.45, h: 0, line: { color: C.taupe, width: 1.2, beginArrowType: 'none', endArrowType: 'triangle' } });
    slide.addShape(S.ellipse, { x: x + 0.58, y: 2.73, w: 0.68, h: 0.68, fill: { color: index < 2 ? C.ink : C.cognac }, line: { color: index < 2 ? C.ink : C.cognac } });
    addText(slide, num, x + 0.58, 2.87, 0.68, 0.24, { fontSize: 9.5, bold: true, color: C.white, align: 'center' });
    addText(slide, kicker, x, 3.76, 1.85, 0.2, { fontSize: 8, bold: true, color: C.cognac, charSpacing: 1.2, align: 'center' });
    addText(slide, title, x, 4.12, 1.85, 0.34, { fontSize: 15, bold: true, align: 'center' });
    addText(slide, body, x + 0.03, 4.58, 1.8, 0.52, { fontSize: 9.5, color: C.muted, align: 'center', breakLine: true, valign: 'top' });
  });
  roundedCard(slide, 2.55, 5.73, 8.23, 0.63, { fill: C.white, line: C.sand });
  addText(slide, 'Golden Path  ·  제품 접점 → 첫 기록 → 반복 관리 → 브랜드 재방문', 2.85, 5.9, 7.64, 0.26, { fontSize: 12, bold: true, color: C.cognac, align: 'center' });
  addText(slide, '※ NFC·브랜드 시스템 직접 연동은 파일럿 단계의 제안 범위입니다.', 0.8, 6.58, 6.5, 0.22, { fontSize: 8.5, color: C.muted });
  slide.addNotes('사용자는 제품 태그나 패키지의 QR 또는 NFC에서 시작합니다. 제품을 등록하고 사진을 남기며, 관리와 수선 기록을 축적합니다. 이후 리캡과 소유권 이전까지 같은 제품 페이지에서 이어집니다.');
}

// 06. Product demo
{
  const slide = baseSlide({
    dark: true,
    page: 6,
    eyebrow: 'Product Demo',
    title: '이미 동작하는 화면으로\n핵심 경험을 검증합니다',
    subtitle: '현재 프로토타입의 실제 UI 캡처입니다.',
    pattern: false,
  });
  addText(slide, '01', 0.82, 2.66, 0.42, 0.24, { fontSize: 9.5, bold: true, color: C.cognacLight });
  addText(slide, '내 제품 아카이브', 1.34, 2.55, 2.3, 0.38, { fontSize: 15, bold: true, color: C.white });
  addText(slide, '제품을 소유 단위로 모으고\n케어 알림과 기록으로 연결', 0.84, 3.1, 2.78, 0.78, { fontSize: 10.5, color: C.lightMuted, breakLine: true, valign: 'top' });
  addRule(slide, 0.83, 4.13, 2.7, '403936', 0.8);
  addText(slide, '02', 0.82, 4.46, 0.42, 0.24, { fontSize: 9.5, bold: true, color: C.cognacLight });
  addText(slide, '제품별 Storybook', 1.34, 4.35, 2.3, 0.38, { fontSize: 15, bold: true, color: C.white });
  addText(slide, '구매 정보·상태·추억 수를\n제품 카드에서 한눈에 확인', 0.84, 4.9, 2.78, 0.78, { fontSize: 10.5, color: C.lightMuted, breakLine: true, valign: 'top' });
  addPhone(slide, ASSETS.homeTop, 4.22, 1.75, 2.18, 4.72, 'HOME');
  addPhone(slide, ASSETS.productTop, 7.1, 1.75, 2.18, 4.72, 'PRODUCT');
  addPhone(slide, ASSETS.storybookTop, 9.98, 1.75, 2.18, 4.72, 'STORYBOOK');
  slide.addNotes('현재 프로토타입에서는 내 제품 아카이브, 제품 상세, 제품별 Storybook을 실제 화면으로 확인할 수 있습니다. 이 장의 이미지는 모두 현재 저장소의 실제 구현 캡처입니다.');
}

// 07. Timeline and care
{
  const slide = baseSlide({
    page: 7,
    eyebrow: 'Core Experience',
    title: '개인의 추억과 제품 이력을\n같은 타임라인에 쌓습니다',
    subtitle: '기억과 관리가 분리되지 않을 때 제품의 생애주기가 하나의 이야기로 보입니다.',
    pattern: false,
  });
  roundedCard(slide, 0.78, 2.36, 4.3, 3.78, { fill: C.white, line: C.sand, shadow: true });
  addText(slide, 'MY MEMORY', 1.12, 2.78, 2.2, 0.24, { fontSize: 9, bold: true, color: C.cognac, charSpacing: 1.6 });
  addText(slide, '사진 · 여행 · 장소 · 메모', 1.12, 3.2, 3.15, 0.36, { fontSize: 16, bold: true });
  addRule(slide, 1.12, 3.78, 3.45, C.sand, 0.8);
  addText(slide, 'PRODUCT HISTORY', 1.12, 4.14, 2.5, 0.24, { fontSize: 9, bold: true, color: C.cognac, charSpacing: 1.6 });
  addText(slide, '구매 · 케어 · 수선 · 이전', 1.12, 4.56, 3.15, 0.36, { fontSize: 16, bold: true });
  addText(slide, '두 흐름을 제품 고유 ID로 연결해\nMemory Graph를 만듭니다.', 1.12, 5.2, 3.22, 0.6, { fontSize: 11.5, color: C.muted, breakLine: true, valign: 'top' });
  addPhone(slide, ASSETS.timelineTop, 6.13, 1.65, 2.25, 4.87, 'TIMELINE');
  addPhone(slide, ASSETS.care, 9.23, 1.65, 2.25, 4.87, 'CARE · DESIGN TARGET');
  slide.addShape(S.line, { x: 5.15, y: 4.11, w: 0.78, h: 0, line: { color: C.cognac, width: 1.5, endArrowType: 'triangle' } });
  slide.addNotes('차별점은 새로운 기능 하나가 아니라 데이터의 연결 방식입니다. 사진과 추억은 My Memory, 구매와 케어와 수선은 Product History로 쌓고, 제품 고유 ID를 기준으로 하나의 타임라인에 합칩니다. 오른쪽 Care 화면은 구현 캡처가 아니라 Figma 목표 화면입니다.');
}

// 08. Competitive whitespace
{
  const slide = baseSlide({
    dark: true,
    page: 8,
    eyebrow: 'Unfair Advantage',
    title: '기존 서비스는 제품의\n한 조각만 관리합니다',
    subtitle: 'Storybook은 제품 정체성·개인 기억·관리 이력·소유 연속성을 동시에 연결합니다.',
    pattern: false,
  });
  const x0 = 0.85;
  const y0 = 2.42;
  const colWidths = [3.1, 2.0, 2.0, 2.0, 2.35];
  const headers = ['비교 기준', '사진 앱', '기존 DPP', '수선 서비스', 'MCM Storybook'];
  let cursor = x0;
  headers.forEach((header, index) => {
    const active = index === headers.length - 1;
    roundedCard(slide, cursor, y0, colWidths[index] - 0.08, 0.58, { fill: active ? C.cognac : '2B2624', line: active ? C.cognac : '403936' });
    addText(slide, header, cursor + 0.08, y0 + 0.12, colWidths[index] - 0.24, 0.26, { fontSize: 10, bold: true, color: C.white, align: index === 0 ? 'left' : 'center' });
    cursor += colWidths[index];
  });
  const rows = [
    ['제품 정체성·진품성', false, true, false, true],
    ['사진·장소·개인 기억', true, false, false, true],
    ['관리·수선 이력', false, false, true, true],
    ['소유권 이전 연속성', false, true, false, true],
  ];
  rows.forEach((row, r) => {
    const y = y0 + 0.78 + r * 0.72;
    addText(slide, row[0], x0 + 0.18, y + 0.11, 2.72, 0.26, { fontSize: 10.5, color: C.lightMuted });
    let x = x0 + colWidths[0];
    row.slice(1).forEach((active, c) => {
      const finalCol = c === 3;
      if (finalCol) slide.addShape(S.rect, { x: x, y: y - 0.06, w: colWidths[c + 1] - 0.08, h: 0.59, fill: { color: C.cognac, transparency: 78 }, line: { transparency: 100 } });
      addCheckDot(slide, x + colWidths[c + 1] / 2 - 0.07, y + 0.16, active, true);
      x += colWidths[c + 1];
    });
    addRule(slide, x0, y + 0.55, 11.42, '352F2C', 0.6);
  });
  roundedCard(slide, 2.6, 6.08, 8.15, 0.58, { fill: '292321', line: '433A36' });
  addText(slide, 'Memory Graph  =  Product Identity  ×  Personal Memory  ×  Care History', 2.9, 6.24, 7.55, 0.24, { fontSize: 12.5, bold: true, color: C.cognacLight, align: 'center' });
  slide.addNotes('사진 앱은 추억을, DPP는 정체성을, 수선 서비스는 관리 이력을 각각 다룹니다. Storybook은 이 세 흐름과 소유권 이전을 제품 ID 하나로 묶습니다. 이 표는 정량 시장조사가 아닌 기능 범위의 정성 비교입니다.');
}

// 09. Business Model Canvas
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  addText(slide, 'BUSINESS MODEL CANVAS', 0.55, 0.35, 4.2, 0.25, { fontSize: 10, bold: true, color: C.white, charSpacing: 1.8 });
  addText(slide, 'MCM Storybook', 10.2, 0.35, 2.55, 0.25, { fontSize: 10, color: 'BCD0E1', align: 'right' });
  const topY = 0.86;
  const topH = 4.7;
  const gap = 0.12;
  const cols = [0.48, 2.93, 5.38, 7.83, 10.28];
  const width = 2.33;
  cols.forEach((x, index) => roundedCard(slide, x, topY, width, topH, { fill: C.white, line: index === 2 ? 'A9C0D2' : 'D7E2EA', shadow: true }));
  const bmcText = [
    ['KEY PARTNERS', '잠재 파트너', ['MCM · DPP 운영', 'Care & Repair', '리셀·소유권 이전', 'AI·Cloud 인프라']],
    ['KEY ACTIVITIES', '핵심 활동', ['Storybook 운영', '제품·기억 데이터 연결', 'Care Journey 설계', 'Recap 템플릿']],
    ['VALUE PROPOSITION', '핵심 가치', ['제품의 이력보다', '함께한 삶까지 기록', 'DPP + Memory Graph', '관계·수명·재방문 확장']],
    ['RELATIONSHIP / CHANNELS', '관계·채널', ['매장 활성화', 'QR·NFC 제품 접점', '공식 웹·구매 메일', 'Care·SNS 재유입']],
    ['CUSTOMER SEGMENTS', '고객', ['25-35 경험 소비자', '컬렉터·Early Adopter', '제품을 물려받은 고객', '럭셔리 브랜드·파트너']],
  ];
  bmcText.forEach(([kicker, title, bullets], index) => {
    const x = cols[index] + 0.22;
    addText(slide, kicker, x, 1.12, width - 0.44, 0.2, { fontSize: 7.5, bold: true, color: C.navySoft, charSpacing: 1.1 });
    addText(slide, title, x, 1.48, width - 0.44, 0.34, { fontSize: 16, bold: true, color: index === 2 ? C.cognac : C.navy });
    bullets.forEach((bullet, b) => {
      addDiamond(slide, x + 0.02, 2.14 + b * 0.67, 0.09, index === 2 ? C.cognac : C.navySoft, 0);
      addText(slide, bullet, x + 0.24, 2.04 + b * 0.67, width - 0.72, 0.36, { fontSize: index === 2 && b < 2 ? 12.5 : 10.5, bold: index === 2 && b < 2, color: C.ink });
    });
    if (index === 1) {
      addRule(slide, x, 4.83, width - 0.44, 'D9E3EA', 0.7);
      addText(slide, 'KEY RESOURCES', x, 5.0, width - 0.44, 0.18, { fontSize: 7.5, bold: true, color: C.navySoft, charSpacing: 1.1 });
      addText(slide, '제품 DB · QR/NFC · Story/Care 데이터', x, 5.25, width - 0.44, 0.24, { fontSize: 8.5, color: C.muted });
    }
    if (index === 2) {
      roundedCard(slide, x, 4.72, width - 0.44, 0.62, { fill: 'EEF3F7', line: 'D0DDE7' });
      addText(slide, 'UNFAIR ADVANTAGE', x + 0.12, 4.82, width - 0.68, 0.16, { fontSize: 7, bold: true, color: C.navySoft, charSpacing: 1 });
      addText(slide, '제품 생애주기 통합', x + 0.12, 5.07, width - 0.68, 0.2, { fontSize: 9.5, bold: true, color: C.cognac });
    }
  });
  roundedCard(slide, 0.48, 5.72, 6.02, 1.2, { fill: C.white, line: 'D7E2EA', shadow: true });
  addText(slide, 'COST STRUCTURE', 0.7, 5.93, 2.1, 0.2, { fontSize: 7.5, bold: true, color: C.navySoft, charSpacing: 1.1 });
  addText(slide, '개발·유지보수  ·  AI API  ·  Cloud/Storage  ·  QR/NFC 운영  ·  디자인·콘텐츠', 0.7, 6.29, 5.55, 0.34, { fontSize: 10, color: C.ink });
  roundedCard(slide, 6.63, 5.72, 6.02, 1.2, { fill: C.white, line: 'D7E2EA', shadow: true });
  addText(slide, 'REVENUE STREAMS', 6.85, 5.93, 2.1, 0.2, { fontSize: 7.5, bold: true, color: C.navySoft, charSpacing: 1.1 });
  addText(slide, '브랜드 SaaS  ·  맞춤 구축  ·  AI Premium  ·  Care/Repair  ·  Resale/Transfer', 6.85, 6.29, 5.55, 0.34, { fontSize: 10, color: C.ink });
  addText(slide, '09', 12.42, 7.12, 0.35, 0.16, { fontSize: 8, color: 'A8BED0', align: 'right' });
  slide.addNotes('사업모델은 브랜드 도입형 B2B2C입니다. 핵심 파트너와 자원을 바탕으로 Storybook을 운영하고, 브랜드 SaaS와 구축비를 중심으로 시작해 AI 프리미엄, Care, 소유권 이전으로 수익원을 확장합니다.');
}

// 10. Customers and channels
{
  const slide = baseSlide({
    page: 10,
    eyebrow: 'Go To Market',
    title: '고객이 제품을 만나는 순간이\n곧 서비스의 채널입니다',
    subtitle: '새로운 앱을 알리는 대신 기존 구매·관리·공유 동선에 Storybook을 심습니다.',
  });
  roundedCard(slide, 0.78, 2.4, 5.7, 3.85, { fill: C.white, line: C.sand, shadow: true });
  addText(slide, 'CUSTOMER SEGMENTS', 1.1, 2.75, 3, 0.22, { fontSize: 8.5, bold: true, color: C.cognac, charSpacing: 1.6 });
  const segments = [
    ['CORE', '25-35 경험 중심 MCM 고객'],
    ['EARLY', '패션·여행 공유 사용자 / 컬렉터'],
    ['NEXT', '제품을 물려받는 다음 소유자'],
    ['B2B', 'MCM·럭셔리 브랜드 / Care·Resale 파트너'],
  ];
  segments.forEach(([tag, text], index) => {
    const y = 3.25 + index * 0.62;
    roundedCard(slide, 1.08, y, 0.78, 0.34, { fill: index === 0 ? C.cognac : C.cream, line: index === 0 ? C.cognac : C.sand });
    addText(slide, tag, 1.08, y + 0.08, 0.78, 0.14, { fontSize: 7.5, bold: true, color: index === 0 ? C.white : C.cognac, align: 'center' });
    addText(slide, text, 2.08, y + 0.02, 3.83, 0.28, { fontSize: 11, color: C.ink });
  });

  roundedCard(slide, 6.85, 2.4, 5.7, 3.85, { fill: C.ink, line: C.ink });
  addText(slide, 'CHANNELS', 7.18, 2.75, 3, 0.22, { fontSize: 8.5, bold: true, color: C.cognacLight, charSpacing: 1.6 });
  const channels = [
    ['01', '오프라인 매장', '구매 직후 Storybook 활성화'],
    ['02', '제품 태그·패키지', 'QR/NFC로 개인 제품 페이지 연결'],
    ['03', '공식 온라인', '구매 완료 메일·홈페이지 재진입'],
    ['04', 'Care & Repair', '접수·완료 안내에서 기록으로 복귀'],
    ['05', 'SNS 공유', 'Recap 콘텐츠로 자연스러운 노출'],
  ];
  channels.forEach(([num, title, body], index) => {
    const y = 3.2 + index * 0.55;
    addText(slide, num, 7.18, y, 0.34, 0.2, { fontSize: 8.5, bold: true, color: C.cognacLight });
    addText(slide, title, 7.65, y - 0.04, 1.55, 0.28, { fontSize: 10.5, bold: true, color: C.white });
    addText(slide, body, 9.15, y - 0.04, 2.9, 0.28, { fontSize: 9.5, color: C.lightMuted });
  });
  slide.addNotes('핵심 고객은 MCM 제품을 오래 사용하고 기억과 관리 이력을 함께 남기고 싶은 25-35세 경험 중심 소비자입니다. 유통은 별도 앱 마케팅보다 매장, 제품 태그, 공식 온라인, Care 서비스, SNS 공유라는 기존 접점을 활용합니다.');
}

// 11. Revenue and cost
{
  const slide = baseSlide({
    dark: true,
    page: 11,
    eyebrow: 'Business Model',
    title: '초기 구축 매출에서 시작해,\n사용량 기반 반복 매출로 확장합니다',
    subtitle: '금액은 파일럿 범위와 실제 운영 비용을 확인한 뒤 산정합니다.',
    pattern: false,
  });
  const revenue = [
    ['01', '브랜드 맞춤 구축비', '전용 UI·제품 DB·DPP·관리자 연동'],
    ['02', '브랜드 SaaS 구독', '활성 제품·사용자 기준 월 이용료'],
    ['03', 'AI Story Premium', '고화질 Recap·기념일 콘텐츠'],
    ['04', 'Care & Repair 수수료', '세척·수선·복원 파트너 연결'],
    ['05', 'Resale / Transfer 수수료', 'DPP·관리 이력 기반 거래·이전'],
  ];
  revenue.forEach(([num, title, body], index) => {
    const x = 0.82 + index * 2.47;
    const y = 2.35 + index * 0.17;
    roundedCard(slide, x, y, 2.19, 2.35, { fill: index < 2 ? C.cognac : '272220', line: index < 2 ? C.cognac : '413936' });
    addText(slide, num, x + 0.24, y + 0.23, 0.35, 0.2, { fontSize: 8.5, bold: true, color: index < 2 ? C.white : C.cognacLight });
    addText(slide, title, x + 0.24, y + 0.62, 1.72, 0.52, { fontSize: 13, bold: true, color: C.white, breakLine: true, valign: 'top' });
    addText(slide, body, x + 0.24, y + 1.4, 1.72, 0.55, { fontSize: 9.2, color: index < 2 ? 'F0DDCB' : C.lightMuted, breakLine: true, valign: 'top' });
  });
  addText(slide, 'COST STRUCTURE', 0.85, 5.43, 2.2, 0.22, { fontSize: 8.5, bold: true, color: C.cognacLight, charSpacing: 1.5 });
  const costs = ['개발·유지보수', 'AI API·렌더링', 'Cloud·Storage·보안', 'QR/NFC·시스템 연동', 'UI/UX·콘텐츠'];
  costs.forEach((cost, index) => {
    const x = 0.84 + index * 2.45;
    addRule(slide, x, 5.88, 2.08, index < 2 ? C.cognacLight : '4D4541', 2.2);
    addText(slide, cost, x, 6.11, 2.08, 0.28, { fontSize: 9.5, color: C.lightMuted, align: 'center' });
  });
  slide.addNotes('초기에는 브랜드별 UI, 제품 DB, DPP 연동에 대한 구축비와 SaaS 구독이 중심입니다. 이후 검증된 사용 패턴을 기반으로 AI 콘텐츠, Care 연결, Resale과 소유권 이전 수수료를 확장합니다. 현재는 실제 원가와 파일럿 범위가 없으므로 가격을 제시하지 않습니다.');
}

// 12. MVP scope
{
  const slide = baseSlide({
    page: 12,
    eyebrow: 'MVP Scope',
    title: '보여주는 기능과\n실제로 동작하는 기능을 구분했습니다',
    subtitle: '현재 구현 상태를 기준으로 작성한 검증 가능한 범위입니다.',
    pattern: false,
  });
  const columns = [
    {
      x: 0.78,
      fill: 'EEF3EF',
      line: 'C9D8CF',
      kicker: 'IMPLEMENTED',
      title: '지금 구현',
      items: ['Next.js 반응형 웹', '제품 아카이브·상세', 'Storybook·통합 타임라인', 'Care 가이드', '사진 촬영·기록 작성'],
      color: C.green,
    },
    {
      x: 4.48,
      fill: 'F4EFE9',
      line: 'DDD0C2',
      kicker: 'SIMULATED',
      title: '데모 시뮬레이션',
      items: ['가상 제품·구매 데이터', '가상 Care·수선 이력', '제품별 고유 ID 흐름', '스토리·AI 추천 화면', 'Supabase 스키마 준비'],
      color: C.cognac,
    },
    {
      x: 8.18,
      fill: 'EEF2F6',
      line: 'C9D6E0',
      kicker: 'NEXT INTEGRATION',
      title: '다음 연동',
      items: ['공식 DPP·NFC·QR', '제품·구매·수선 시스템', '전문가 Care 검토', 'LLM Story·Recap', '리셀·소유권 이전'],
      color: C.navy,
    },
  ];
  columns.forEach((col) => {
    roundedCard(slide, col.x, 2.36, 3.35, 3.82, { fill: col.fill, line: col.line });
    addText(slide, col.kicker, col.x + 0.3, 2.7, 2.75, 0.2, { fontSize: 8, bold: true, color: col.color, charSpacing: 1.25 });
    addText(slide, col.title, col.x + 0.3, 3.07, 2.75, 0.38, { fontSize: 18, bold: true, color: C.ink });
    col.items.forEach((item, index) => {
      addCheckDot(slide, col.x + 0.32, 3.74 + index * 0.45, true);
      addText(slide, item, col.x + 0.59, 3.65 + index * 0.45, 2.35, 0.28, { fontSize: 10.5, color: C.ink });
    });
  });
  roundedCard(slide, 2.52, 6.39, 8.3, 0.48, { fill: 'F7EAE8', line: 'E9C4BE' });
  addText(slide, '현재 MVP는 Vision AI 손상 판정을 구현 완료로 주장하지 않습니다.', 2.84, 6.5, 7.68, 0.22, { fontSize: 10.5, bold: true, color: C.red, align: 'center' });
  slide.addNotes('현재 동작하는 기능과 데모 데이터, 다음 연동 범위를 명확히 나눴습니다. 특히 Vision AI 손상 판정은 구현되어 있지 않으며, 현재 카메라는 사진 촬영과 기록 작성에 집중합니다.');
}

// 13. Pilot
{
  const slide = baseSlide({
    dark: true,
    page: 13,
    eyebrow: 'Pilot Proposal',
    title: '한 제품 라인, 한 진입점,\n한 개의 Golden Path로 시작합니다',
    subtitle: '큰 플랫폼보다 측정 가능한 작은 파일럿을 먼저 제안합니다.',
    pattern: false,
  });
  const phases = [
    ['01', 'CONNECT', '제품 라인 선정', 'DPP 샌드박스·제품 ID·데이터 항목을 합의합니다.'],
    ['02', 'EXPERIENCE', 'Storybook 활성화', '매장 또는 패키지 진입점에서 첫 기록과 Care 흐름을 운영합니다.'],
    ['03', 'LEARN', '행동 데이터 검증', '활성화·첫 기록·재방문·Care 전환·공유 흐름을 확인합니다.'],
  ];
  phases.forEach(([num, kicker, title, body], index) => {
    const x = 0.84 + index * 4.15;
    roundedCard(slide, x, 2.5, 3.68, 3.28, { fill: index === 1 ? C.cognac : '272220', line: index === 1 ? C.cognac : '433B37' });
    addText(slide, num, x + 0.3, 2.8, 0.42, 0.22, { fontSize: 9, bold: true, color: index === 1 ? C.white : C.cognacLight });
    addText(slide, kicker, x + 0.9, 2.8, 2.0, 0.22, { fontSize: 8.5, bold: true, color: index === 1 ? C.white : C.cognacLight, charSpacing: 1.5 });
    addText(slide, title, x + 0.3, 3.42, 3.02, 0.42, { fontSize: 18, bold: true, color: C.white });
    addText(slide, body, x + 0.3, 4.2, 3.02, 0.82, { fontSize: 10.5, color: index === 1 ? 'F6E3D0' : C.lightMuted, breakLine: true, valign: 'top', lineSpacingMultiple: 1.04 });
  });
  addText(slide, 'PILOT METRICS', 0.86, 6.17, 1.55, 0.2, { fontSize: 8, bold: true, color: C.cognacLight, charSpacing: 1.5 });
  addText(slide, 'Activation  ·  First Record  ·  Repeat Visit  ·  Care Conversion  ·  Recap Share', 2.48, 6.1, 8.75, 0.28, { fontSize: 10.5, color: C.lightMuted });
  slide.addNotes('파일럿은 한 제품 라인, 한 진입점, 한 Golden Path로 작게 시작합니다. DPP와 제품 ID를 연결하고 Storybook을 활성화한 뒤, 활성화율과 첫 기록, 재방문, Care 전환, 공유 행동을 측정합니다.');
}

// 14. Closing
{
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  addPattern(slide, true, 8);
  slide.addImage({ path: ASSETS.logo, x: 0.78, y: 0.64, w: 0.54, h: 0.42 });
  addText(slide, 'MCM · STORYBOOK', 1.46, 0.71, 3.2, 0.22, { fontSize: 9.5, color: C.white, charSpacing: 2 });
  addText(slide, 'DPP가 증명하는 진품성 위에,\n기억이 증명하는 관계를 쌓겠습니다', 0.82, 2.02, 8.1, 1.35, { fontSize: 29, bold: true, color: C.white, breakLine: true, valign: 'top', lineSpacingMultiple: 0.87 });
  addText(slide, '제품의 이력을 넘어, 제품과 함께한 삶까지 기록하는 디지털 라이프 플랫폼', 0.84, 3.72, 7.3, 0.4, { fontSize: 13.5, color: C.cognacLight, bold: true });
  roundedCard(slide, 8.9, 1.78, 3.55, 3.72, { fill: '272220', line: '463D38' });
  addText(slide, 'PARTNERSHIP ASK', 9.25, 2.15, 2.7, 0.22, { fontSize: 8.5, bold: true, color: C.cognacLight, charSpacing: 1.6 });
  const asks = [
    'DPP·제품 데이터 샌드박스',
    'Care & Repair 운영 데이터',
    '단일 제품 라인 파일럿 협업',
  ];
  asks.forEach((ask, index) => {
    addText(slide, `0${index + 1}`, 9.25, 2.75 + index * 0.72, 0.38, 0.2, { fontSize: 8.5, bold: true, color: C.cognacLight });
    addText(slide, ask, 9.78, 2.66 + index * 0.72, 2.2, 0.34, { fontSize: 11.5, bold: true, color: C.white });
  });
  addText(slide, 'OFFICIAL SOURCES', 0.84, 5.83, 1.65, 0.18, { fontSize: 7.5, bold: true, color: C.cognacLight, charSpacing: 1.25 });
  addText(slide, 'MCM Digital Product Passport · kr.mcmworldwide.com/ko_KR/digital-passport', 0.84, 6.17, 5.8, 0.22, { fontSize: 8.5, color: C.lightMuted, hyperlink: { url: 'https://kr.mcmworldwide.com/ko_KR/digital-passport' } });
  addText(slide, 'Aura Blockchain Consortium · MCM DPP Use Case', 0.84, 6.49, 5.8, 0.22, { fontSize: 8.5, color: C.lightMuted, hyperlink: { url: 'https://auraconsortium.com/use-cases/mcm-joins-aura-blockchain-consortium-launching-inaugural-dpp' } });
  addText(slide, 'Prototype IR  ·  2026.08', 9.35, 6.52, 3.05, 0.22, { fontSize: 8.5, color: '746D68', align: 'right' });
  slide.addNotes('Storybook은 MCM의 기존 DPP 자산 위에 기억과 관리 데이터를 연결하는 제안입니다. 다음 단계로 DPP와 제품 데이터 샌드박스, Care 운영 데이터, 단일 제품 라인 파일럿 협업을 요청드립니다.');
}

await pptx.writeFile({ fileName: PPTX_PATH });
console.log(PPTX_PATH);

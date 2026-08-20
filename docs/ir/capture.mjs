import { chromium } from 'playwright';
import fs from 'fs';

const OUT = '/Users/home/Desktop/likeGonzi/docs/ir';
const BASE = 'http://localhost:3000';
const ctx = await chromium.launchPersistentContext('/tmp/mcm-cap-profile', {
  channel: 'chrome', headless: false,
  viewport: { width: 414, height: 896 }, deviceScaleFactor: 3,
});
const p = ctx.pages()[0] ?? await ctx.newPage();

const hide = () => p.addStyleTag({ content:
  'nextjs-portal,[data-next-badge-root],[data-nextjs-toast]{display:none!important}' }).catch(()=>{});

await p.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
console.log('LOGIN_WINDOW_OPEN');

// 로그인될 때까지 기다린다(최대 8분).
// 페이지를 옮기지 않고 localStorage만 들여다본다 — 옮기면 입력이 끊긴다.
const deadline = Date.now() + 8 * 60_000;
let ok = false;
while (Date.now() < deadline) {
  await p.waitForTimeout(1500);
  const signed = await p.evaluate(() =>
    Object.keys(localStorage).some(k => /^sb-.*-auth-token$/.test(k))
  ).catch(() => false);
  if (signed) { ok = true; break; }
}
if (!ok) { console.log('TIMEOUT_NO_LOGIN'); await ctx.close(); process.exit(1); }
await p.waitForTimeout(1500);
console.log('LOGGED_IN');

async function shot(name, url, prep) {
  await p.goto(BASE + url, { waitUntil: 'networkidle' }).catch(()=>{});
  await hide();
  await p.waitForTimeout(1200);
  if (prep) { try { await prep(); } catch (e) { console.log('  prep skip:', e.message.slice(0,60)); } }
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${name}` });
  console.log('  ✓', name);
}

// 1. 여권
await shot('shot-passport.png', '/products/stark', async () => {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('인증 정보'));
    if (b) b.click();
  });
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 260));
});

// 2. 수선 접수 (부위 탭)
await shot('shot-repair.png', '/products/stark/repairs/new', async () => {
  await p.evaluate(() => window.scrollTo(0, 320));
});

// 3. 스캔
await shot('shot-scan.png', '/camera');

// 4. 타임라인
await shot('shot-register.png', '/log/stark/timeline');

// 5. 기록 작성 (상황 칩)
await shot('shot-record.png', '/log/stark/record/new', async () => {
  await p.evaluate(() => {
    const el = [...document.querySelectorAll('label')].find(x => x.textContent.includes('OCCASION'));
    if (el) el.scrollIntoView({ block: 'center' });
  });
});

// 6. REMADE — 수선 이력이 있는 제품을 찾는다
for (const slug of ['stark', 'ella', 'pina']) {
  await p.goto(`${BASE}/products/${slug}/repairs`, { waitUntil: 'networkidle' }).catch(()=>{});
  const href = await p.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find(x => /\/repairs\/[0-9a-f-]{8,}/.test(x.getAttribute('href')||''));
    return a ? a.getAttribute('href') : null;
  });
  if (href) { await shot('shot-remade.png', href, async () => {
      await p.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('REMADE'));
        if (b) b.scrollIntoView({ block: 'center' });
      });
    }); break; }
}
console.log('DONE');
await ctx.close();

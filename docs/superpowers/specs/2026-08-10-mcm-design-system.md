# MCM Luxury Book — 디자인 시스템 "Vitrine"

**작성일** 2026-08-10
**대상** 안정(시안) · 정운(FE)
**관련 문서** [IA & 스토리보드](2026-08-10-mcm-luxury-book-ia-design.md) · [페르소나](2026-08-10-mcm-persona.md)

---

## 0. 테마 — Vitrine (진열장)

> **움직이는 비세토스 하늘 위에, 유리 패널이 떠 있고, 그 사이에 제품이 놓인다.**

세 겹이 전부다.

```
전경   유리 패널 · 타이포        ← 고정. 안 움직인다
중경   제품 (음영 + 부유)         ← 느리게 뜬다
배경   비세토스 3D 타일 격자      ← 바람이 지나간다
```

### 왜 유리인가 — 4가지가 한 점에서 만난다

| 근거 | 내용 |
|---|---|
| **구조** | 글래스는 배경이 복잡할수록 좋아진다. 우리는 움직이는 패턴이 있다 |
| **기능** | "패턴 위 본문 금지" 규칙이 사라진다. 패턴은 비치고 글자는 읽힌다 |
| **페르소나** | 서지우의 **은근한 과시** = 보이되 가리는 것. 유리가 그 행동 |
| **헤리티지** | 매장 디스플레이 = 진열장 = 유리. 뮌헨 신고전주의 박물관까지 이어짐 |

### 기각된 대안

- **뉴모피즘** — 바탕과 패널이 같은 색이어야 성립. 그 조건이 곧 "배경에 아무것도 없어야 한다"는 뜻이라 비세토스를 통째로 지운다. 대비 낮아 접근성 위반. 2020년 트렌드
- **에디토리얼 미니멀** — 럭셔리 정석이고 안전하지만 기억에 안 남는다. 심사에서 다른 팀과 구분 불가

---

## 1. 컬러 토큰

> ⚠ 아래 값은 **제안치**다. 안정이 MCM 공식 컬러로 교체할 것.

```css
:root {
  --mcm-cognac:      #8B5A2B;   /* 비세토스 기준색 */
  --mcm-cognac-rgb:  139, 90, 43;
  --mcm-ink:         #1C1917;   /* 로고·본문 */
  --mcm-paper:       #FAF8F5;   /* 페이지 바탕 */
  --mcm-glass-rgb:   255, 255, 255;
  --mcm-glass-a:     0.62;
}

@media (prefers-color-scheme: dark) {
  :root {
    --mcm-cognac:      #C9945A;   /* 어두운 바탕에서 코냑은 밝게 올린다 */
    --mcm-cognac-rgb:  201, 148, 90;
    --mcm-ink:         #F5F2EE;
    --mcm-paper:       #17150F;
    --mcm-glass-rgb:   38, 35, 32;
    --mcm-glass-a:     0.55;
  }
}
```

**다크모드에서 코냑을 그대로 쓰면 안 된다.** `#8B5A2B`는 어두운 바탕에서 진흙색으로 죽는다. 반드시 밝은 쪽으로 올린 값을 따로 둔다.

---

## 2. 타이포

| 용도 | 크기 | 굵기 | 비고 |
|---|---|---|---|
| 아이브로우 | 9–10px | 400 | `letter-spacing: .10em`, 대문자 |
| 제품명 (히어로) | 20–24px | 500 | 줄바꿈 허용 |
| 화면 제목 | 17px | 500 | |
| 본문 | 13–14px | 400 | `line-height: 1.6` |
| 메타·캡션 | 10–11px | 400 | secondary 색 |

**굵기는 400과 500만.** 700을 쓰면 럭셔리가 아니라 커머스가 된다.
**가격은 어디에도 표시하지 않는다.** (페르소나 §9.3)

---

## 3. 비세토스 레이어 — 3D 타일 격자

### 3.1 원리

마름모는 **모노그램 격자에 고정**되어 있고, 각각이 **입체 판**으로 제자리에서 Y축 회전한다.
정면일 때 넓고 옆으로 서면 얇아진다. 이 **폭 변화가 격자를 타고 번지는 것**이 바람이다.

흘려보내면(파티클) 패턴이 아니라 먼지가 된다. 격자는 절대 무너뜨리지 않는다.

### 3.2 스펙

| 항목 | 값 |
|---|---|
| 타일 크기 | 12 × 17px (가로:세로 ≈ 0.7, 바이에른 마름모 비율) |
| 격자 간격 | 24–26px, 홀수 행 `step/2` 오프셋 |
| 행 높이 | `step × 0.86` |
| 회전축 | `rotateY −72° ↔ +72°` |
| 보조축 | `rotateX ±7°` |
| 깊이 | `perspective(260px)`, `translateZ 0→4px` |
| 주기 | 4.2s `ease-in-out` |
| 면 음영 | `linear-gradient 135°`, alpha 0.72 → 0.16 |
| 바람 딜레이 | `−(x × 0.007 + row × 0.11)s` |

**±72°인 이유** — 90°면 완전히 사라져 격자에 구멍이 뚫린다. 72°에서 멈춰야 얇은 선으로 남아 패턴이 끊기지 않는다.

**그라디언트가 3D를 만든다** — 회전만 하면 종잇장이다. 면에 명암이 있어야 판으로 읽힌다.

**딜레이 기울기 = 바람 방향.** x 계수가 크면 가로바람, row 계수가 크면 세로바람. 지금은 대각선.

### 3.3 코드

```css
.veil { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }

.tile {
  position: absolute;
  width: 12px; height: 17px;
  margin: -8.5px 0 0 -6px;                    /* 좌표를 중심으로 */
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: linear-gradient(135deg,
              rgba(var(--mcm-cognac-rgb), .72) 0%,
              rgba(var(--mcm-cognac-rgb), .40) 46%,
              rgba(var(--mcm-cognac-rgb), .16) 100%);
  transform-origin: 50% 50%;
  animation: flip 4.2s ease-in-out infinite;
}
.veil.soft .tile { opacity: .5; }             /* 홈 상단 등 배경으로 물러날 때 */

@keyframes flip {
  0%   { transform: perspective(260px) rotateY(-72deg) rotateX( 7deg) }
  50%  { transform: perspective(260px) rotateY( 72deg) rotateX(-7deg) translateZ(4px) }
  100% { transform: perspective(260px) rotateY(-72deg) rotateX( 7deg) }
}

@media (prefers-reduced-motion: reduce) { .tile { animation: none } }
```

```js
// 격자 생성. 애니메이션은 CSS가 전담 — JS는 DOM만 만든다.
function veil(el, step) {
  step = step || 24;
  const w = el.clientWidth, h = el.clientHeight;
  if (!w || !h) return;
  const rowH = step * 0.86;
  const cols = Math.ceil(w / step) + 2;
  const rows = Math.ceil(h / rowH) + 2;
  const f = document.createDocumentFragment();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * step + (r % 2 ? step / 2 : 0);
      const d = document.createElement('i');
      d.className = 'tile';
      d.style.left = x + 'px';
      d.style.top  = r * rowH + 'px';
      // 바람 경로: x가 클수록 위상이 앞서 → 파도가 오른쪽으로 흐른다
      d.style.animationDelay = (-(x * 0.007 + r * 0.11)).toFixed(2) + 's';
      f.appendChild(d);
    }
  }
  el.replaceChildren(f);
}
```

리사이즈 시 180ms 디바운스로 재생성.

---

## 4. 유리 — Vitrine 패널

```css
.glass {
  background: rgba(var(--mcm-glass-rgb), var(--mcm-glass-a));
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
          backdrop-filter: blur(16px) saturate(1.3);
  border: 0.5px solid rgba(255, 255, 255, .35);
  border-radius: 12px;
}

/* 폴백 — 블러 미지원 or 저사양 */
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: var(--mcm-paper); border-color: rgba(var(--mcm-cognac-rgb), .2); }
}
```

| 규칙 | 값 |
|---|---|
| **화면당 최대** | **3장** (성능 예산 §9) |
| 블러 | 16px, `saturate(1.3)` |
| 테두리 | `0.5px` 흰색 35% — 유리 모서리의 빛 |
| 라운드 | 12px |
| 중첩 | **금지.** 유리 위에 유리 올리면 블러가 두 번 돌고 탁해진다 |

패턴이 안 비쳐도 레이아웃은 그대로 산다. 폴백은 시각적 손실일 뿐 기능 손실이 아니다.

---

## 5. 제품 렌더링

```css
.product {
  box-shadow: 0 16px 24px -11px rgba(var(--mcm-cognac-rgb), .60),
              0  2px  3px      rgba(var(--mcm-cognac-rgb), .22);
  animation: bob 6s ease-in-out infinite;
}
.product-shadow {                              /* 바닥 그림자, 별도 요소 */
  filter: blur(4px);
  background: rgba(var(--mcm-cognac-rgb), .30);
  animation: shade 6s ease-in-out infinite;
}

@keyframes bob   { 0%,100% { transform: translateY(0)    } 50% { transform: translateY(-9px) } }
@keyframes shade { 0%,100% { transform: scaleX(1); opacity:.38 }
                   50%     { transform: scaleX(.86); opacity:.22 } }
```

**그림자는 제품과 반대 위상으로 움직여야 한다.** 제품이 뜰 때 그림자가 작아지고 옅어져야 공중에 뜬 것으로 읽힌다. 같이 움직이면 그냥 스티커다.

그림자 색은 검정이 아니라 **코냑**. 검정 그림자는 바닥에 구멍을 낸다.

---

## 6. 패턴 용법 2종

같은 마름모가 화면에 따라 다른 의미를 갖는다. **이 대비가 이 디자인의 서사다.**

| | 하늘 (Sky) | 노드 (Node) |
|---|---|---|
| **상태** | 흐른다 · 회전한다 | 멈춘다 · 굳는다 |
| **의미** | 브랜드 · 환경 · 바이에른 하늘 | 내 기록 · 소유 |
| **어디** | 언박싱, 제품 히어로, 홈 상단 | 로그 타임라인, 스토리북 |
| **채움** | 그라디언트 반투명 | 채움 = 기록 있음 / 외곽선 = 빈 슬롯 |

### 6.1 "올해의 비세토스" 게이지

```
◆ ◆ ◆ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇      3 / 12
```

12칸 = 12개월. 기록 1개 = 마름모 1개 채움. 한 행이 차면 1년이 완성된다.
**기록이 곧 패턴이 된다**는 걸 눈으로 확인시키는 장치.

> 로그 탭에는 배경 패턴을 깔지 않는다. 의도적이다.
> 하늘에서 흐르던 마름모가 여기서 멈추고 내 것이 된다. **하늘 → 소유.**

---

## 7. 모션 원칙

| # | 원칙 |
|---|---|
| 1 | **전경은 고정.** 배경이 흐르고 제품이 뜨는 동안 타이포는 안 움직인다. 모션의 기준점이 없으면 멀미가 난다 |
| 2 | **레이어마다 다른 속도.** 배경 4.2s / 제품 6s / 전경 0. 이 차이가 깊이다 |
| 3 | **사용자가 속도의 주인.** 언박싱은 스크롤 구동 — 멈추면 애니메이션도 멈춘다 |
| 4 | **자동재생 비디오 금지.** iOS Safari 스크럽 버벅임 + 반응형에서 비율 깨짐 |
| 5 | `prefers-reduced-motion: reduce` 에서 **모든 루프 애니메이션 정지.** 정지 상태도 완성된 그림이어야 함 |

---

## 8. MCM 자산 배치

| 자산 | 사실 | 어디에 | 왜 |
|---|---|---|---|
| **비세토스 마름모** | 바이에른 깃발 lozenge, *weiß-blauer Himmel*(흰-파란 하늘) | 배경 3D 격자 · 타임라인 노드 | **어원이 하늘.** 바람 모션이 장식이 아니라 원래 의미로의 복귀 |
| **로렐(월계관)** | 승리·용맹·명예. 루트비히 1세 신고전주의 오마주 | 정품 인증 배지 · 멤버십 등급 | 의미가 그대로 맞는다 |
| **스터드** | 시그니처 하드웨어 | **수선 부위 핀** (S-11 · S-12) | 스터드가 곧 "박힌 점" |
| **코냑** | 비세토스 바탕색 | 프라이머리 · 그림자 색 | |
| **1976 · München** | 창립. 초기 품목이 **여행 가방** | 언박싱 0% 화면 | 여행 헤리티지 = 스토리북의 서사 근거 |
| **박스 패키지** | — | 언박싱 3D (코드 생성) | 색·비율·패턴만 교체 |

출처는 [페르소나 문서 §10](2026-08-10-mcm-persona.md) 참조.

---

## 9. 성능 예산

| 항목 | 한도 | 넘으면 |
|---|---|---|
| 타일 DOM 노드 | **200개** | 히어로 영역에만 사용. 전체 화면에 깔면 700개 넘어감 |
| 유리 패널 | 화면당 **3장** | 블러가 GPU를 먹는다 |
| 유리 중첩 | **0** | 블러 2회 = 탁해짐 |

**타일 200개 초과 시**: canvas 2D로 전환. 지금 구조(격자 좌표 + 위상 딜레이)가 그대로 옮겨진다.
**블러가 버벅이면**: `@supports` 폴백을 강제 적용하는 저사양 플래그를 둔다.

---

## 10. 접근성

- `prefers-reduced-motion: reduce` → 모든 루프 애니메이션 정지 (§7-5)
- 본문 텍스트는 **반드시 유리 위 또는 무지 위**. 패턴 위 직접 배치 금지
- 유리 폴백이 적용된 상태에서도 대비 기준을 만족할 것 — 폴백은 불투명이라 오히려 안전
- 타일은 `pointer-events: none`. 스크린리더에 노출되지 않도록 `aria-hidden`

---

## 11. 카피 톤

| 금지 | 대체 |
|---|---|
| "자랑하세요" | **"기록하세요"** |
| "명품", "럭셔리" | **"오래 쓰는"**, "함께한" |
| 가격 · 시세 | **사용 기간 · 동행 횟수** |
| "구매 인증" | **"정품 확인"** |

근거는 [페르소나 §2 핵심 긴장](2026-08-10-mcm-persona.md).

---

## 12. 미결정

| # | 항목 | 담당 |
|---|---|---|
| 1 | MCM 공식 컬러 코드로 §1 교체 | 안정 |
| 2 | 비세토스 패턴 공식 에셋 확보 (뚜껑 겉면 텍스처) | 안정 |
| 3 | 로렐 사용 범위 — 상표 이슈 확인 | 팀 |
| 4 | 데스크톱 브레이크포인트에서 타일 밀도·유리 폭 | 정운 |
| 5 | 저사양 기기 판별 기준 | 정운 |

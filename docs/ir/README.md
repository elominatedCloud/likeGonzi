# MCM Luxury Book — IR 덱

| 파일 | 용도 |
|---|---|
| `MCM_Luxury_Book_IR.pdf` | **발표·제출용.** 32장 |
| `MCM_Luxury_Book_IR.pptx` | 편집용 |
| `build_deck.js` | 생성 스크립트 (pptxgenjs) |
| `bg-dark.png` · `bg-light.png` | 배경 |
| `damage.jpg` · `remade-1~3.jpg` | **REMADE 실제 생성 결과** (gpt-image-1-mini) |
| `product.png` | 제품 실사 (투명 PNG) |

카피 원본은 [../superpowers/specs/2026-08-10-mcm-ir-deck-copy.md](../superpowers/specs/2026-08-10-mcm-ir-deck-copy.md).
근거는 [../superpowers/specs/2026-08-10-mcm-ir-evidence.md](../superpowers/specs/2026-08-10-mcm-ir-evidence.md).

## 구성 (32장)

**솔루션이 맨 앞이다.** 처음 보는 사람이 "뭘 만드는 거지?"로 헤매지 않게 했다.

```
01  표지
02  ★ 하나의 타임라인       ← 솔루션 먼저. Challenge 03 배지는 여기에만
03  ★ 세 가지가 얹힙니다     기록 / 케어·수선 / REMADE
04  ★ REMADE 실물          긁힌 자리 + 시안 3안 (실제 생성 이미지)
─── Chapter 1  왜 이걸 만들었나
06  럭셔리는 새것일 때 가장 비쌉니다
07  그래서 사람들은 쓰지 않습니다
08  포지셔닝 맵             가격 × 일상 사용 빈도
09  ★ MCM은 매일 드는 가방입니다  (제품 실사)
10  매일 쓰면 상합니다
11  3대장 안 씀 / 매스 버림 / MCM 고침
12  근거                   30–40% · 1위 · 50개 중 1개
13  지금 이 문제를 푸는 브랜드는 없습니다
─── Chapter 2  흠이 역사가 된다
15  신사임당 / 킨츠기 / Dapper Dan
16  ★ 내 가방의 역사이자, MCM의 역사입니다
17  페르소나
─── Chapter 3  어떻게 동작하나
19  기록은 흩어졌다가 사라집니다
20  ★ 사진을 올리면 AI가 알아서 기록합니다
21  AI가 하는 일
22  ★ REMADE — MCM이 직접 만드는 수선 상품 (이미지 포함)
23  MCM이 이미 가진 것을 그대로 씁니다
24  브랜드 자산
25  데모
─── Chapter 4  왜 지금, 무엇으로 버는가
27  데이터 · 28 DPP 위층 · 29 경쟁 · 30 왜 지금 · 31 수익모델 · 32 마무리
```

### REMADE는 실제로 돕니다

```
모델    gpt-image-1-mini
        gpt-image-1 / 1.5 / 2 는 이 조직에서 한도 0 (429)
n       3장 · 약 15초
포맷    webp 압축 70 → 장당 150~300KB (png는 2.3MB)
```

덱 04·22번의 이미지는 **목업이 아니라 이 파이프라인의 실제 출력**이다.
한도가 풀리면 `lib/ai.ts`의 `IMAGE_MODEL` 한 줄만 되돌리면 된다.

**논증 사슬** — 이게 척추다.

```
가격대가 중간이다  →  매일 쓸 수 있다  →  매일 쓰면 상한다
                 →  3대장은 안 상하고, 매스는 버린다
                 →  이 구간에만 "상함을 어떻게 다룰까"가 남는다
                 →  지우지 말고 나의 것으로  →  킨츠기 · Dapper Dan
                 →  REMADE
```

킨츠기를 문화 비유로 먼저 꺼내지 않는다. **포지셔닝에서 문제를 도출한 다음** 답으로 꺼낸다.

**진술 슬라이드는 절대 줄이지 않는다.** 그게 논증의 관절이다.
넘치면 15 · 21 · 31을 줄인다.

## 발표 노트

각 슬라이드의 발표 멘트가 **PPT 슬라이드 노트**에 들어 있다.
Keynote·PowerPoint 발표자 표시에서 그대로 보인다.

## 디자인

레퍼런스(2Planner IR)의 구조를 따르되 팔레트를 MCM으로 옮겼다.

- 본문 다크 `#12100E` + 코냑 글로우, 챕터 구분은 라이트 `#F4F1EC`
- 액센트 코냑 `#C4915F`
- 반투명 도형으로 글로우를 만들면 경계가 보인다. 그래서 배경은 **이미지**다
- 폰트 **Apple SD Gothic Neo**. 웨이트가 9단계라 한글 대비가 산다.
  PDF에 임베드되므로 배포는 문제없다. PPTX 편집은 맥 기준
- **박스를 쓰지 않는다.** 카드·테두리 대신 여백과 0.75pt 헤어라인으로만 나눈다.
  잡스 덱에 사각형 카드가 없는 이유와 같다 — 테두리가 늘면 시선이 갈 곳을 잃는다
- **강조는 색이 아니라 크기로 한다.** 48pt Bold 옆의 15pt Regular는 색을 바꿀 필요가 없다
- 타입 스케일 — 진술 48 / 헤드라인 34 / 항목 24 / 본문 14 / 캡션 11

### 참고한 원칙

- **한 슬라이드에 큰 생각 하나.** 잡스의 2008 Macworld 슬라이드에는 단어가 한두 개뿐인 것도 있었다("2007", "Thank you")
- **Duarte: 슬라이드는 빌보드다. 3초 안에 처리돼야 한다**
- **불릿을 쓰지 않는다.** 텍스트는 말할 거리로 옮기고 화면에는 결론만 남긴다

## 재생성

```bash
cd docs/ir
npm install pptxgenjs        # 최초 1회
node build_deck.js
```

PDF 변환 (이 환경엔 LibreOffice가 없어 Keynote를 쓴다):

```bash
osascript -e 'tell application "Keynote"
  set d to open POSIX file "'$PWD'/MCM_Luxury_Book_IR.pptx"
  delay 2
  export d to POSIX file "'$PWD'/MCM_Luxury_Book_IR.pdf" as PDF
  close d saving no
end tell'
```

## 발표 전 확인

- [ ] 시장 규모를 물으면 **"산정 중"**이라고 답한다. 숫자를 지어내지 않는다
- [ ] "2027년 의무화"라고 말하지 않는다. **위임법 2027, 시행 2028~29**
- [ ] 신사임당은 **전해지는 일화**다. 사료처럼 말하지 않는다
- [ ] **"AI가 장인을 대체한다"로 읽히지 않게** 먼저 선을 긋는다. AI는 시안까지
- [ ] `care_score`는 규칙 기반 계산이다. **"AI 상태 분석"이라 말하지 않는다**
- [ ] MCM 실적 하락 수치를 **먼저 꺼내지 않는다**
- [ ] Archive Style은 **미구현**. "다음 단계"로 말한다

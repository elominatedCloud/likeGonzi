# MCM Luxury Book — IR 덱

| 파일 | 용도 |
|---|---|
| `MCM_Luxury_Book_IR.pdf` | **발표·제출용.** 22장 |
| `MCM_Luxury_Book_IR.pptx` | 편집용 |
| `build_deck.js` | 생성 스크립트 (pptxgenjs) |
| `bg-dark.png` · `bg-light.png` | 배경 |

카피 원본은 [../superpowers/specs/2026-08-10-mcm-ir-deck-copy.md](../superpowers/specs/2026-08-10-mcm-ir-deck-copy.md).
근거는 [../superpowers/specs/2026-08-10-mcm-ir-evidence.md](../superpowers/specs/2026-08-10-mcm-ir-evidence.md).

## 구성 (22장)

```
01  표지            흠을 지우지 않습니다. 나의 것으로 만듭니다
02  ★ 챌린지 선택    01·02·03을 나란히 놓고 03을 메인으로 명시
─── Chapter 1  MCM은 어디에 서 있나
04  ★ 포지셔닝 맵    가격 × 일상 사용 빈도. 매일 쓰는 럭셔리 구간
05  ★ 역설          매일 쓰면 상한다. 이 구간에만 생기는 문제
─── Chapter 2  흠이 값이 된다
07  ★ 우리의 답      고쳐서 원래대로가 아니라, 고쳐서 나만의 것으로
08  계보            신사임당 · 킨츠기 · Dapper Dan
09  페르소나         서지우 28
─── Chapter 3  무엇을 만들었나
11  공백            브랜드는 새것만 · 기록은 마찰
12  해결            하나의 타임라인
13  ★ AI            쓰게 하지 않는다. 대신 써준다
14  ★ REMADE        흠을 지우지 않고 그 자리에 그린다
15  ★ MCM 자산      새로 만들지 않았다
16  데모
─── Chapter 4  왜 지금, 무엇으로 버는가
18  데이터 자산
19  경쟁            DPP를 만들지 않는다
20  왜 지금
21  수익모델
22  로드맵
```

**논증 사슬** — 이게 이 덱의 척추다.

```
가격대가 중간이다  →  매일 쓸 수 있다  →  매일 쓰면 상한다
                 →  3대장은 안 상하고, 매스는 버린다
                 →  이 구간에만 "상함을 어떻게 다룰까"가 남는다
                 →  지우지 말고 나의 것으로  →  킨츠기 · Dapper Dan
                 →  REMADE
```

킨츠기를 문화 비유로 먼저 꺼내지 않는다. **포지셔닝에서 문제를 도출한 다음**에 답으로 꺼낸다.

**시간 넘치면 09 · 12 · 21을 줄인다. 04 · 05 · 07 · 13 · 14 · 15는 줄이지 않는다.**

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
- 타입 스케일 — 헤드라인 36 / 카드 제목 17 / 본문 13.5 / 캡션 11.
  **강조는 색이 아니라 크기로 한다.** 44pt Bold 옆의 20pt Regular는 빨간색일 필요가 없다

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

# MCM Luxury Book — IR 덱

| 파일 | 용도 |
|---|---|
| `MCM_Luxury_Book_IR.pdf` | **발표·제출용.** 19장 |
| `MCM_Luxury_Book_IR.pptx` | 편집용 |
| `build_deck.js` | 생성 스크립트 (pptxgenjs) |
| `bg-dark.png` · `bg-light.png` | 배경 |

카피 원본은 [../superpowers/specs/2026-08-10-mcm-ir-deck-copy.md](../superpowers/specs/2026-08-10-mcm-ir-deck-copy.md).
근거는 [../superpowers/specs/2026-08-10-mcm-ir-evidence.md](../superpowers/specs/2026-08-10-mcm-ir-evidence.md).

## 구성 (19장)

```
01  표지            AI는 흠을 지우지 않습니다. 값으로 바꿉니다
02  챌린지 선택      Challenge 03 · 360° 고객 경험
03  Chapter 1       럭셔리 경험은 어디서 끊기는가
04  공백            브랜드는 새것만 보여줍니다
05  마찰            기록은 마찰입니다
06  Chapter 2       흠이 값이 된다
07  가설 ★          신사임당 → 킨츠기 → Dapper Dan → REMADE
08  페르소나         서지우 28
09  Chapter 3       무엇을 만들었나
10  해결            하나의 타임라인
11  AI ★            쓰게 하지 않는다. 대신 써준다
12  MCM 자산 ★      새로 만들지 않았습니다
13  데모            매장에서 산 박스가 시작점
14  Chapter 4       왜 지금, 무엇으로 버는가
15  데이터          브랜드가 몰랐던 것
16  경쟁            DPP를 만들지 않는다
17  왜 지금         세 가지가 겹친다
18  수익모델        수선이 매출이 된다
19  로드맵          한 브랜드에서 깊게
```

**시간 넘치면 08 · 10 · 18을 줄인다. 07 · 11 · 12는 줄이지 않는다.**
07은 척추, 11은 주제 응답, 12는 받은 피드백에 대한 답이다.

## 발표 노트

각 슬라이드의 발표 멘트가 **PPT 슬라이드 노트**에 들어 있다.
Keynote·PowerPoint 발표자 표시에서 그대로 보인다.

## 디자인

레퍼런스(2Planner IR)의 구조를 따르되 팔레트를 MCM으로 옮겼다.

- 본문 슬라이드 다크 `#12100E` + 코냑 글로우, 챕터 구분은 라이트 `#F4F1EC`
- 액센트 코냑 `#C4915F`
- 반투명 도형으로 글로우를 만들면 경계가 보인다. 그래서 배경은 **이미지**다

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

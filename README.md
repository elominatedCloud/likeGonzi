# MCM · STORYBOOK

Next.js + TypeScript + Supabase 기반 MCM 제품 아카이브 앱입니다.

## 화면 범위

1. **스플래시 / 시작 / 로그인** (`/`, `/start`, `/login`) — 기존 팀 구현
2. **홈** (`/home`) — 내 제품, 케어 알림, 생일 혜택, ESG 카드, 라이프스타일 제안
3. **제품 상세** (`/products/[id]`) — 누끼→라이프스타일 슬라이드, 메뉴(삭제/이름수정/소유권이전), AI 수선, 가죽 점검
4. **케어 가이드** (`/products/[id]/care`) — 케어 점수, 클리닉 tip / 수선 기록
5. **로그 경험** (`/log/...`) — FE(namjun) 타임라인·스토리북
6. **Story API** — 남준 명세 2.1/2.2 (`docs/STORY_API.md`)
7. **전체 API** — IA 명세 엔드포인트 (`docs/API.md`)

수선 접수·진행 플로우는 미확정이라 제외했습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)

## Supabase

1. `.env.local.example`을 참고해 `.env.local` 작성 (`.env*`는 gitignore)
2. `supabase/schema.sql`을 Supabase SQL Editor에서 실행
3. 홈·제품 상세 UI는 현재 `lib/data.ts` 목 데이터로 동작합니다

## 페르소나 키워드

합리적인 럭셔리 · 아카이브 · 케어로 수명 연장(ESG Circular Care) · 비세토스 · 소유권 스토리

# FE(namjun)

장남준 담당 Next.js/TypeScript 프론트엔드 화면입니다. Figma의 393px 모바일 프레임을 기준으로 구현했습니다.

## 상품별 데모

- 전체 제품 타임라인: `/log/timeline`
- Storybook: `/log/storybook`
- Stark: `/log/stark/timeline`, `/log/stark/record/seongsu-inspiration`, `/log/stark/record/new`, `/log/stark/ai-recommendation`
- Ella: `/log/ella/timeline`, `/log/ella/record/jazz-evening`, `/log/ella/record/new`, `/log/ella/ai-recommendation`
- Pina: `/log/pina/timeline`, `/log/pina/record/bookstore-afternoon`, `/log/pina/record/new`, `/log/pina/ai-recommendation`

바텀 바의 로그는 전체 제품 타임라인으로 이동합니다. 각 상품 타임라인 뒤에 `/my`, `/product`를 붙이면 내 기록/제품 이력 탭을 직접 확인할 수 있습니다. 기록 작성은 각 타임라인의 `+ 기록 추가` 또는 중앙 카메라로 진입하며 다른 보유 상품을 함께 선택할 수 있습니다. 루트 `/`는 전체 데모 링크 모음입니다.

## 구조

- `LogExperience.tsx`: 상품 데이터, 화면, 상호작용
- `log-experience.module.css`: 반응형 스타일
- `design-reference/`: 제공받은 SVG 원본
- `public/FE-namjun/assets/`: 상품 및 생성 이미지
- `public/FE-namjun/icons/`: Figma 원본 하단바 아이콘

실행: `npm run dev`

## Story API (멋사 엔드포인트)

명세 2.1 / 2.2는 Next API로 구현되어 있습니다. 상세는 [`docs/STORY_API.md`](../docs/STORY_API.md).

- `POST /api/products/{product_id}/stories`
- `GET /api/products/{product_id}/stories/{story_id}`
- `PATCH /api/products/{product_id}/stories/{story_id}`
- `DELETE /api/products/{product_id}/stories/{story_id}`

`product_id` 예: `stark`, `ella`, `pina`

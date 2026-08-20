# API 연동 점검 — 2026-08-20

## 점검 범위

- Lena 커밋: 홈·제품·Story·수선·인증·QR API, 스캔 3상태, 수선 UI
- ahnjung513 커밋: 스플래시·시작·로그인 화면과 하단 내비게이션
- 이후 Supabase 실연동/타임라인 커밋이 위 변경을 덮거나 우회하지 않는지 확인
- MCM StoryBook API 명세의 Core Path와 FE 호출 경로 대조

## Core Path 결과

| 기능 | FE 호출 | 서버/DB 호출 | 상태 |
|---|---|---|---|
| 이메일 로그인·가입 | `/api/auth/login`, `/api/auth/signup` | Supabase Auth | 연동 |
| 카카오·Google 로그인 | `signInWithOAuth` | Supabase Auth provider | 이번 점검에서 추가 |
| QR 스캔 | `/api/products/scan/{tag}` | `scan_product(p_tag_code)` | 연동 |
| 제품 등록 | `/api/products/my/{tag}` | `claim_product(p_tag_code)` | 연동 |
| 타인 소유 안내 | 스캔 결과 dialog | `owned_by_other` | 연동 |
| 내 제품 목록 | `/api/home`, `/api/products/my` | `my_products_view` | 연동 |
| 제품 상세 | `/api/products/{id}` | `my_products_view` + Story/수선 | 연동 |
| Story 목록·상세 | Story API GET | `stories` + `story_products` | 연동 |
| Story 생성 | Story API POST | `create_story_with_products` 또는 insert | 직접 RPC 우회 제거 |
| Story 수정 | Story API PATCH | `stories` update | 이번 점검에서 UI 추가 |
| Story 삭제 | Story API DELETE | `stories` delete | 연동, 오류 처리 보강 |

## 결정 사항

- FE 작성 본문은 `stories.memo`를 사용한다.
- `stories.story`는 서버가 생성한 선택적 Story Note로만 사용한다.
- MVP Story 작성은 제품 1개 기준이다. FE의 복수 제품 선택 UI는 제거했다.
- OAuth 복귀 주소는 `/login`이며 기존 `returnTo`와 QR 등록 `intent=claim`을 보존한다.

## 검증 결과

- `npm run lint`: 오류 0 (기존 `<img>` 최적화 경고만 존재)
- `npm run build`: 성공
- HTTP Story CRUD: 목록/생성/수정/단건/삭제 모두 성공
- `/login`: 200, 카카오·Google 버튼 서버 렌더링 확인

## 외부 설정이 필요한 검증

로컬에는 `.env.local`이 없으므로 실제 Supabase 프로젝트 대상의 OAuth 리디렉션,
`auth.users` metadata, `profiles` 자동 생성, QR RPC와 `my_products_view` 실데이터는
이번 로컬 실행에서 검증할 수 없다. 아래 설정 후 제공자 계정으로 확인해야 한다.

1. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Supabase Auth의 Kakao/Google provider 활성화 및 client secret
3. Supabase Redirect URL 허용 목록에 로컬/배포 `/login` 추가
4. Kakao/Google 콘솔에는 Supabase가 안내한 callback URL 등록
5. 최초 로그인 뒤 `auth.users.raw_user_meta_data`와 같은 UUID의 `profiles` row 확인

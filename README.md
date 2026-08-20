# MCM · STORYBOOK

Next.js + TypeScript + Supabase 기반 MCM 제품 아카이브 앱입니다.

QR/NFC 태그로 실물 제품과 디지털 기록을 연결하고, 구매 → 사용 → 관리 → 수선 → 리캡까지
제품의 생애주기를 하나의 여정으로 남깁니다.

## 화면 범위

1. **스플래시 / 시작 / 로그인** (`/`, `/start`, `/login`)
2. **홈** (`/home`) — 내 제품 캐러셀, 케어 알림, 멤버십 혜택, AI Recap, ESG 카드
3. **제품 상세** (`/products/[id]`) — 누끼→라이프스타일 슬라이드, 제품 관리(이름 수정 / 연동 해제), 수선 이력, 기록
4. **케어 가이드** (`/products/[id]/care`) — 케어 점수, 클리닉 tip, 수선 기록
5. **수선 접수·진행** (`/products/[id]/repairs`) — 부위 선택, 접수, 진행 상태 조회
6. **로그 경험** (`/log/...`) — FE(namjun) 타임라인·스토리북·기록 작성
7. **운영 도구** (`/admin`) — 브랜드 인사이트, 개체 발급, QR 시트 출력 (운영자 전용)
8. **API 명세** — Story API (`docs/STORY_API.md`), 전체 API (`docs/API.md`)

## 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)

## 환경 변수

`.env.local`에 아래 값을 넣습니다. `.env*`는 gitignore 대상입니다.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...            # 없어도 앱은 동작합니다(아래 AI 항목 참고)
```

> `OPENAI_API_KEY`에 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다. 브라우저 번들에 그대로 실립니다.
> 서버 라우트(`lib/ai.ts`)에서만 읽습니다.

## Supabase 세팅

1. `supabase/schema.sql`을 SQL Editor에서 실행
2. `supabase/seed.sql` 실행 (데모 제품 + IR용 상황 데이터)
3. 운영자 지정 — 계정을 만든 뒤 아래를 실행합니다. 계정을 지웠다 다시 만들면
   uuid가 바뀌므로 이메일 기준으로 부여합니다.

```sql
update public.profiles set is_admin = true
 where id in (select id from auth.users where email = '운영자_이메일');
```

`schema.sql`은 실제 Supabase 프로젝트의 스냅샷입니다. 스키마를 바꿀 때는 이 파일을
직접 고치지 말고 **마이그레이션을 적용한 뒤 다시 뽑아** 파일과 DB가 갈라지지 않게 합니다.

---

# 구현 내용

## 1. 데이터 연동 — mock-db 제거

`lib/mock-db.ts` 기반으로 동작하던 API를 전부 Supabase로 옮겼습니다.
홈·제품 상세·케어·수선·기록 화면도 정적 데이터가 아니라 실제 API를 읽습니다.

- `/api/home`, `/api/repairs`, 수선 목록·상세·접수, `/api/transfers`
- 화면 전환: `lib/use-product-detail.ts` 훅 하나로 통일, 공통 로딩·에러 화면(`ProductLoadState`)

**공통 인증 클라이언트** (`lib/api-client.ts`)
브라우저에서 `/api/*`를 부를 때 Supabase access token을 자동으로 싣습니다.
401이 오면 `/login?returnTo=현재경로`로 보냅니다.

**제품 식별자** — FE는 slug(`stark`)를, DB는 `product_units` UUID를 씁니다.
`resolveOwnedProductRef`가 둘 다 받아 소유 중인 개체로 해석합니다.
소유 여부는 **RLS가 아니라 `user_id`로 직접 거릅니다** — 운영자는 RLS상 모든 개체가
보이기 때문에 RLS에만 의존하면 남의 개체가 잡힙니다.

## 2. QR 제품 등록

- **실물 태그 QR** → `https://앱/start?tag={tag_code}` → 스캔 결과에 따라
  내 제품 이동 / 등록 / 타인 소유 안내로 분기. 로그인 후 자동 등록(`claim=1`)까지 이어집니다.
- **앱 내 QR 인식** (`/camera?mode=qr`) — 카메라 탭에서 `BarcodeDetector`로 인식합니다.
  로그인이 필요하며, 미지원 브라우저(Safari)는 **태그 코드 직접 입력**으로 폴백합니다.
- **QR 생성** (`/admin/tags`) — 가운데 MCM 로고를 넣습니다. 로고가 모듈을 가리므로
  오류 정정 레벨을 자동으로 H(30% 복구)로 올립니다. 인쇄/PDF, SVG 저장 지원.
- **개체 발급** (`/admin/units`) — 제품·매장·연도·수량을 넣으면 `tag_code`/`serial_no`를
  자동 채번합니다. 동시 발급 시 번호가 겹치지 않도록 `issue_product_units` RPC가
  `products` 행을 잠그고 DB 안에서 처리합니다.

> QR을 뽑을 때 **주소를 배포 주소로 바꿔야** 합니다. localhost로 만든 QR은 다른 기기에서 열리지 않습니다.

## 3. AI (OpenAI)

`lib/ai.ts` — 서버 전용 래퍼. **키가 없으면 규칙 기반 문구로 폴백**하므로
키 없이도 데모가 멈추지 않습니다.

- **Story 생성** — 기록 저장 시 사용자가 직접 쓴 글이 없으면 태그·장소·메모·날짜로 문장을 만듭니다.
- **Recap** (`/api/products/{id}/recap`) — 쌓인 기록·수선을 요약합니다.
  생성 시점의 기록 수를 `product_recaps`에 같이 저장해 **건수가 바뀔 때만 재생성**합니다.

프롬프트(`lib/ai-prompts.ts`)에는 "적지 않은 사실(장소·동행·날씨·감정)을 지어내지 말 것",
"제품을 칭찬·평가하지 말 것", "총평으로 끝내지 말 것" 제약이 들어 있습니다.
또한 **재료가 없으면 API를 아예 부르지 않습니다** — 장소·메모가 둘 다 없는 기록,
기록·수선이 0건인 Recap은 모델이 빈칸을 지어내므로 기본 문구로 폴백합니다.

## 4. 상황 데이터 구조화 (IR 핵심)

`stories.tag`는 자유 텍스트 **제목**("성수에서 만난 새로운 영감")이고 `location`도
"서울 성수동" / "프랑스 파리"가 섞여 있어 집계가 불가능했습니다.
원문은 그대로 두고 집계 가능한 축을 따로 추가했습니다.

| 컬럼 | 내용 |
|---|---|
| `occasion text[]` | 출근·여행·전시·모임·데이트·운동·일상 (다중, GIN 인덱스) |
| `companion text` | 혼자·친구·가족·연인·동료 (단일, CHECK 제약) |
| `city` / `country` | 정규화된 도시명 / ISO 3166-1 alpha-2 (복합 인덱스) |

기록 작성 화면에서 **칩 선택**으로 받습니다(자유 입력 아님).
도시·국가는 `lib/place-normalize.ts`의 시드 도시 표로 매칭합니다 —
**지오코딩 API를 붙이지 않았습니다.** 표에 없는 장소는 비워 두고 원문만 남깁니다.

## 5. B2B 집계 뷰

| 뷰 | 내용 |
|---|---|
| `brand_occasion_usage` | 제품 모델 × 상황별 기록 수 |
| `brand_repair_hotspots` | 제품 모델 × 수선 부위/증상별 건수 |
| `brand_city_usage` | 제품 모델 × 국가/도시별 기록 수 |

세 뷰 모두 **개인 식별자를 반환하지 않고 집계 수치만** 내보냅니다.

- **k-익명성** — 5건 미만 그룹은 제외합니다. 소수 그룹은 특정 개인의 행동으로 역추적될 수 있습니다.
- **동의** — `analytics_consent = true`인 사용자만 집계합니다. 철회하면 다음 조회부터 즉시 빠집니다.
- **접근 통제** — 뷰에는 RLS 정책을 걸 수 없고(정책은 기반 테이블에만 붙습니다),
  `security_invoker`를 켜면 `stories` RLS가 "본인 것만"이라 집계 자체가 불가능해집니다.
  그래서 **뷰 본문에 `is_admin()` 조건**을 넣고 anon 권한을 회수했습니다.

## 5-1. 운영 인사이트 화면

`/admin/insights` — 위 세 뷰를 막대 그래프로 보여줍니다. 차트 라이브러리를 쓰지 않고
최댓값 대비 상대 길이만 계산합니다(의존성 0).

화면 상단에 **통계 참여 인원수와 k-익명성 기준을 같이 표시**합니다. 표본이 몇 명인지
모른 채 집계 수치만 보면 과대 해석되기 때문입니다.

참여 인원은 `analytics_consent_stats()` 함수로 가져옵니다 — `profiles`를 직접 세면
RLS 때문에 본인 1건만 잡히는데, 그렇다고 프로필 전체 조회를 열면 개인정보가 노출되므로
집계 수치만 돌려주는 함수로 막았습니다.

## 6. 동의 모델

`profiles.analytics_consent` / `analytics_consent_at`. 기본값 `false`이며
상태와 시각이 어긋나지 않도록 CHECK 제약이 걸려 있습니다.
**동의 없이도 앱의 모든 개인 기능은 정상 동작합니다.** 집계 대상에서만 빠집니다.

- **가입 시** — 회원가입 폼의 `[선택]` 체크박스. 필수 약관과 분리돼 있습니다.
- **철회** — 마이 화면의 토글. 끄면 다음 조회부터 집계에서 빠집니다.
- **API** — `GET/PATCH /api/me` (프로필 조회·수정, 동의 포함)

## 7. 이벤트 로깅

`product_events` — `scan`, `unbox_complete`, `register`, `story_create`,
`repair_submit`, `recap_view`, `share`.

서버에서 발생하는 것(`scan`, `register`, `story_create`, `repair_submit`, `recap_view`)은
해당 라우트에서 바로 넣고, 화면에서 발생하는 것(`unbox_complete`, `share`)은
`POST /api/events`로 받습니다. 알 수 없는 타입은 조용히 무시합니다.
스캔은 비로그인도 가능하므로 `user_id`가 `null`인 행이 들어갑니다.
읽기는 운영자만 가능합니다.

배치·큐를 쓰지 않고 발생 시점에 단순 insert 합니다.
`logProductEvent`는 **절대 throw하지 않습니다** — 로깅 실패로 등록이나 기록 저장이
실패하면 안 되기 때문입니다.

## 7-1. 통합 타임라인

`GET /api/timeline` — 내 제품 전체의 **등록 · 사진 기록 · 수선**을 한 줄기로 합칩니다.
`?product={slug|uuid}`로 제품 하나만 볼 수도 있습니다.

로그 화면(`/log/timeline`)은 예전에도 있었지만 데이터 출처가 섞여 있었습니다 —
기록만 API에서 읽고, 제품 이력은 하드코딩된 배열, 케어 기록은 localStorage였습니다.
그래서 **수선을 접수해도 타임라인에 나타나지 않고, 기기를 바꾸면 기록이 사라졌습니다.**
지금은 세 종류 모두 DB에서 옵니다. 화면 레이아웃은 그대로입니다.

## 8. 소유권 — 이전 대신 연동 해제

이메일 기반 소유권 이전은 수락 플로우·알림·만료 처리가 필요합니다.
같은 결과를 이미 있는 API 두 개로 얻을 수 있어 **연동 해제** 방식으로 바꿨습니다.

내 계정에서 해제 → 태그가 다시 미등록 상태 → 다음 소유자가 스캔해서 등록.
**사진 기록과 수선 이력은 제품에 그대로 남습니다.**

`ownership_transfers` 테이블과 API는 남아 있지만 **FE에서 사용하지 않습니다.**

## 9. 사진 저장

사용자가 찍은 사진(기록·수선)은 private Storage 버킷 `story-photos`에 저장하고,
읽을 때 임시 서명 URL을 발급합니다(`lib/supabase-photo-url.ts`).
경로 첫 폴더가 `auth.uid()`여야 하는 RLS가 걸려 있습니다.

제품 목업 이미지는 Storage에 올리지 않고 `/public`에서 서빙합니다 —
CDN 캐시가 되고 egress 비용이 들지 않습니다.

## 9-1. 인증 제공자와 Story 필드

- 로그인 화면은 Supabase Auth의 `kakao`, `google` OAuth를 직접 호출합니다. Supabase의
  Redirect URL 허용 목록에는 배포 주소의 `/login`을 등록해야 합니다.
- FE에서 사용자가 작성·수정하는 본문 필드는 **`stories.memo`** 로 통일합니다.
  `stories.story`는 사용자가 따로 입력하지 않으며, 서버가 기록 재료를 바탕으로 생성한
  선택적 Story Note를 보관하는 용도로만 사용합니다.
- 해커톤 MVP의 기록 작성은 제품 1개 기준입니다. API/DB의 다중 연결 호환성은 남겨 두지만
  FE에서는 현재 타임라인의 제품 하나만 전송합니다.

## 10. 반응형

앱 화면은 모바일 프레임을 씁니다. **폰에서는 항상 화면을 꽉 채우고**,
태블릿 이상(640px~)에서만 430px 프레임을 가운데 세웁니다.

큰 폰(갤럭시 480px, 아이폰 Pro Max 440px)까지 430px로 묶으면 양옆에 죽은 여백이
생기기 때문에, `--app-frame` 변수를 미디어 쿼리로 전환합니다.
바텀바·카메라 프레임·플로팅바가 모두 이 변수를 참조합니다.

운영 도구(`/admin`)는 표와 QR 시트를 넓게 봐야 해서 프레임을 벗어납니다.

---

## 알려진 제약

- **`care_score`는 등록된 기록으로 계산합니다** (`compute_care_score`).
  기본 70 + 기록 1건당 3(최대 12) + 수선 1건당 6(최대 12) + 최근 90일 내 활동 6, 상한 100.
  **센서나 이미지 진단이 아닙니다.** "AI가 제품 상태를 분석한다"고 설명하면 안 됩니다.
- **NFC는 하드웨어 작업입니다.** 태그에 같은 URL을 굽는 것으로 동작하지만 쓰기 도구가 없습니다.
  발표에서는 "QR로 검증했고 NFC는 동일 URL이라 즉시 적용 가능"이 정확한 표현입니다.
- 공유는 Web Share API를 씁니다(미지원 브라우저는 클립보드 복사). SNS SDK는 붙이지 않았습니다.
- 비밀번호 재설정은 미구현입니다.
- 수선의 `memo`·접수 방식·예상 비용/기간은 저장하지 않습니다(컬럼 없음).

## 페르소나 키워드

합리적인 럭셔리 · 아카이브 · 케어로 수명 연장(ESG Circular Care) · 비세토스 · 소유권 스토리

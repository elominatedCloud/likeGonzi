# 코드 수정 프롬프트 — IR "데이터 플랫폼" 주장을 데모 가능하게

새 세션에 아래 블록을 그대로 붙여넣으면 된다. 자체 완결형이다.

---

```
MCM Storybook (Next.js + Supabase) 레포에서 작업한다.
IR 발표에서 "어떤 사람이 어떤 상황에 어떤 제품을 쓰는지 도출하는 데이터 플랫폼"이라고
주장할 예정인데, 현재 스키마가 그걸 뒷받침하지 못한다. 아래 순서대로 고쳐라.

## 현 상태 (확인된 사실)

- 스키마: supabase/schema.sql  — 실제 Supabase 프로젝트의 스냅샷
- stories 테이블 컬럼: tag, photo_url, photo_path, location, memo, story,
  trip_label, story_date
- stories.tag 는 자유 텍스트 단일 필드이고, 실제 데이터가
  "성수에서 만난 새로운 영감" 같은 제목이다. 분류가 아니라 제목이라 집계가 불가능하다.
- stories.location 도 자유 텍스트다. "서울 성수동", "프랑스 파리"가 섞여 있어
  도시/국가 정규화가 안 된다.
- 이벤트·분석 테이블이 0개다. 스캔/조회/재방문이 아무것도 기록되지 않는다.
- consent / opt_in 관련 컬럼과 코드가 0개다.
- 집계 뷰는 my_products_view 하나뿐이다.
- product_units.care_score 는 default 90 상수이고 계산 로직이 없다.
- ownership_transfers 테이블은 있으나 FE는 '연동 해제'(user_products 삭제) 방식을 쓴다
  (schema.sql 주석에 명시됨).
- repairs.condition_tags 는 text[] 로 이미 구조화돼 있다. 유일하게 집계 가능한 자산이다.

## 관련 파일

- supabase/schema.sql                                  스키마 + RPC
- supabase/seed.sql                                    시드 데이터
- types/story-api.ts                                   StoryRecord / CreateStoryBody / UpdateStoryBody
- lib/story-photo-storage.ts                           persistCloudStory() 가 RPC 호출 (약 104행)
- lib/supabase-story-mapper.ts                         DB row -> StoryRecord 매핑
- lib/story-store.ts                                   스토어
- app/api/products/[product_id]/stories/route.ts       기록 생성 API (약 174행에서 RPC 호출)
- app/log/[product]/record/new/page.tsx                기록 작성 화면
- FE(namjun)/LogExperience.tsx                         로그/타임라인/스토리북 컴포넌트 모음

## P0 — 상황 데이터 구조화 (이것만 해도 IR 핵심 주장이 데모된다)

1) supabase/schema.sql 의 stories 테이블에 컬럼 추가:

   occasion   text[]  default '{}'   -- 출근, 여행, 전시, 모임, 데이트, 운동, 일상
   companion  text                    -- solo, friends, family, partner, colleagues
   city       text                    -- 정규화된 도시명
   country    text                    -- ISO 3166-1 alpha-2

   기존 location 컬럼은 지우지 말고 원문 보존용으로 남긴다.
   occasion 에 GIN 인덱스, (country, city) 에 복합 인덱스를 건다.
   companion 에는 CHECK 제약을 건다.

2) create_story_with_products RPC 시그니처를 확장한다.
   현재: p_tag, p_photo_path, p_location, p_memo, p_story_date, p_product_slugs
   추가: p_occasion text[] default '{}', p_companion text default null,
         p_city text default null, p_country text default null
   기존 호출부가 깨지지 않도록 전부 default 를 준다.

3) types/story-api.ts 의 StoryRecord / CreateStoryBody / UpdateStoryBody 에
   occasion, companion, city, country 를 옵셔널로 추가한다.

4) lib/story-photo-storage.ts 의 persistCloudStory() 와
   app/api/products/[product_id]/stories/route.ts 의 RPC 호출에 새 인자를 넘긴다.
   lib/supabase-story-mapper.ts 에서 새 컬럼을 매핑한다.

5) 기록 작성 UI(app/log/[product]/record/new/page.tsx)에서
   상황과 동행을 자유 입력이 아니라 **칩 선택**으로 받는다.
   occasion 은 다중 선택, companion 은 단일 선택.
   기존 tag 입력은 제목으로 남긴다.
   장소 입력은 그대로 두되, 저장 시 city/country 를 함께 채운다.
   (지오코딩 API를 붙이지 말 것. 시드 도시 목록 기반 단순 매칭으로 충분하다.)

6) supabase/seed.sql 의 기존 기록에 occasion/companion/city/country 를 채운다.
   IR 데모용으로 최소 20건, 상황이 골고루 분포하도록.

## P1 — B2B 집계 뷰 (슬라이드 10의 데이터 소스)

supabase/schema.sql 에 아래 뷰를 추가한다. 전부 개인 식별자 없이 집계만 반환한다.

- brand_occasion_usage      : 제품 모델 x occasion 별 기록 수
- brand_repair_hotspots     : 제품 모델 x repairs.condition_tags 별 건수
                              (이미 구조화돼 있으므로 바로 나온다. IR에서 전면에 세울 것)
- brand_city_usage          : 제품 모델 x country/city 별 기록 수

각 뷰는 집계 결과가 5건 미만인 그룹을 제외한다(k-익명성). 이유를 주석으로 남긴다.
RLS 로 is_admin() 만 읽을 수 있게 한다.

## P2 — 동의 모델

profiles 에 아래를 추가하고, 온보딩에 체크박스를 넣는다.

  analytics_consent      boolean default false not null
  analytics_consent_at   timestamptz

P1 의 집계 뷰는 analytics_consent = true 인 사용자만 집계한다.
동의 철회 시 즉시 집계에서 빠지는지 확인할 것.
동의 없이도 앱의 모든 개인 기능은 정상 동작해야 한다.

## P3 — 이벤트 로깅

product_events 테이블을 만든다.
  id, user_id(nullable), product_unit_id(nullable), event_type, occurred_at, meta jsonb
  event_type: scan, unbox_complete, register, story_create, repair_submit,
              recap_view, share
스캔/등록/기록 생성 시점에 삽입한다. 배치나 큐를 만들지 말 것. 단순 insert 로 충분하다.

## P4 — 과장 제거

- product_units.care_score: 계산 로직을 넣든지, 아니면 UI 문구에서
  "AI 분석"이라는 표현을 빼고 "데모 기준"으로 명시한다. 지금은 상수 90이다.
- ownership_transfers: FE 연결을 하든지, 못 하면 IR 수익모델에서 리셀 항목을
  "로드맵"으로 내린다. 코드에는 손대지 않아도 되지만 팀에 알릴 것.

## 제약

- 새 의존성을 추가하지 말 것. 지오코딩 라이브러리, 분석 SDK 전부 불필요하다.
- 기존 화면 레이아웃을 바꾸지 말 것. 입력 방식만 자유 텍스트 -> 칩 선택으로 바꾼다.
- 마이그레이션을 적용한 뒤 schema.sql 을 다시 뽑아 파일과 DB가 갈라지지 않게 한다
  (schema.sql 상단 주석의 규칙).

## 검증

작업 후 아래를 실행해 결과를 보고할 것.

1. npx tsc --noEmit
2. npm run build
3. 기록을 1건 새로 만들고 stories 행에 occasion/companion/city/country 가 채워지는지 확인
4. brand_occasion_usage 뷰를 조회해 행이 나오는지 확인
5. analytics_consent = false 인 사용자의 기록이 집계 뷰에서 빠지는지 확인

각 단계의 실제 출력을 붙여서 보고할 것. 통과했다고만 쓰지 말 것.
```

---

## 우선순위 판단

해커톤 남은 시간이 짧다면 **P0만** 해도 된다.
P0이 슬라이드 10("어떤 상황에 어떤 제품을")의 주장을 데모 가능하게 만드는 유일한 변경이다.

P1은 P0 없이는 만들 수 없다(집계할 컬럼이 없으므로).
P2는 심사에서 "개인정보 어떻게 할 거냐" 질문이 나올 때의 답이다. 슬라이드 한 장으로 대체 가능.
P3·P4는 발표 후로 미뤄도 된다.

## IR에서 지금 당장 쓰면 안 되는 표현

| 표현 | 왜 | 대체 |
|---|---|---|
| "AI가 제품 상태를 분석" | care_score 가 상수 90 | "관리·수선 기록 기반 표기" |
| "리셀·소유권 이전 연계" | FE 미구현 | 로드맵으로 이동 |
| "재방문·리텐션 데이터" | 이벤트 테이블 없음 | P3 완료 후 |
| "2027년 DPP 의무화" | 위임법이 2027, 시행은 2028~29 | "위임법 2027, 시행 2028~29 전망" |

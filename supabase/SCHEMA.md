# Supabase 스키마 설계 메모

피드백(예서 + 리뷰)을 반영한 현재 `supabase/schema.sql` 요약입니다.

## 핵심 결정

| 이슈 | 결정 |
|------|------|
| `products.owner_id NOT NULL` ↔ 미등록 스캔 충돌 | **(B가 아님)** 모델/실물/소유를 `products` → `product_units` → `user_products`로 분리 |
| 미등록 상태 표현 | unit은 있고 `user_products` row가 없음 |
| 수선 상태 | `repairs.status` + `requested_at` + `completed_at` (+ 일관성 CHECK) |
| QR 전체 공개 | `product_units` 전체 SELECT 금지. `scan_product_unit(tag)` RPC만 |
| 제품 등록 경쟁 | `claim_product_unit(tag)` RPC에서 `FOR UPDATE` + 소유자 검증 |
| 다중 제품 Story | `stories` + `story_products` |
| RLS | enable만 하지 않고 테이블별 policy + GRANT |
| 카메라 사진 | private `story-photos` 버킷 + `{auth.uid()}/{productId}/{uuid}` 경로 |
| Story 생성 | `create_story_with_products` RPC에서 사진 경로·제품 소유권을 원자 검증 |

## 스캔 ownership_status

```
unregistered   → 등록 확인 화면
owned_by_me    → Product Detail
owned_by_other → 이미 다른 사용자 등록
```

(구 `is_registered_to_user` boolean은 RPC 응답에 호환용으로도 포함)

## FE DTO 매핑 (snake_case → camelCase)

| DB | FE/DTO |
|----|--------|
| `product_name` | `name` |
| `serial_no` | `serial` |
| `registered_at` | `registeredAt` |
| `photo_url` | `image` / `imageUrl` |
| `thumbnail_url` | `thumbnail` |
| `product_unit_id` | `productUnitId` (URL은 `slug` 또는 unit uuid) |

제품 식별자는 **DB UUID(`product_units.id`)** 를 기준으로 하고, URL용 `products.slug`(`stark` 등)는 별도 관리합니다.

## 아직 FE/API mock과 다른 점

현재 앱은 여전히 `lib/mock-db.ts` + 인메모리 Story store를 사용합니다.
스키마 적용 후 작업:

1. Supabase 프로젝트에 `schema.sql` 실행
2. Next API를 RPC/`user_products` 조회로 교체
3. FE camelCase 변환 계층 (`lib/mappers.ts` 등)
4. 실제 Supabase Auth 로그인과 Story CRUD를 연결해 `photo_path` 기반 signed URL 발급

## 카메라 사진 Storage

`schema.sql`은 `story-photos` private 버킷을 만들고 JPG/PNG/WEBP/HEIC,
8MB 제한을 적용합니다. 업로드·조회·삭제는 object name의 첫 폴더가 현재
사용자 UUID인 경우에만 허용하며, 덮어쓰기(`upsert`) 정책은 열지 않습니다.

프론트의 `lib/story-photo-storage.ts`는 실제 Supabase Auth 세션이 있으면
촬영본을 위 경로에 업로드합니다. 아직 Supabase 설정이나 실제 세션이 없는
해커톤 데모 환경에서는 기존 로컬 저장으로 폴백합니다. 연결된 프로젝트에서
`schema.sql`을 실행한 뒤에는 Story 조회 시 `photo_path`로 짧은 만료 시간의
signed URL을 발급해 표시해야 합니다.

private Storage 사진은 인증 사용자만 `create_story_with_products` RPC로 저장합니다.
RPC는 선택한 slug의 제품을 모두 현재 사용자가 소유하는지 확인한 뒤 한
트랜잭션으로 저장합니다. 기존 `photo_url` API 호환을 위한 직접 INSERT도
authenticated 역할에 열려 있지만, `stories.user_id`와 제품 소유권을 검사하는
RLS를 모두 통과해야 하며 서버 Route Handler에서만 호출합니다.

## 수선 status

유저 RLS는 `INSERT`(status=`submitted`) / `SELECT`만 허용.
`in_progress` / `completed` / `cancelled` 변경은 서비스 롤 또는 DB 수동(MVP).

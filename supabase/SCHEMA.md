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
4. Storage 버킷 + Storage RLS 설정

## 수선 status

유저 RLS는 `INSERT`(status=`submitted`) / `SELECT`만 허용.  
`in_progress` / `completed` / `cancelled` 변경은 서비스 롤 또는 DB 수동(MVP).

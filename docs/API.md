# API 명세서 구현 현황 (IA 순서)

> Next.js 페이지와 충돌을 피하기 위해 실제 경로는 **`/api` prefix** 를 사용합니다.
> 명세 `/products/...` ≡ 구현 `/api/products/...`

데모 계정: `gonji@mcm.test` / `password123`
Authorization 없으면 기본 유저(곤지)로 동작합니다.

---

## ✅ 구현·검수 완료

| IA | Method | Endpoint |
|---|---|---|
| 0.1 로그인 | POST | `/api/auth/login` |
| 0.3 회원가입(이메일) | POST | `/api/auth/signup` |
| 0.1 QR/NFC 스캔 | GET | `/api/products/scan/{tag_code}` |
| 0.3/마이 제품 등록 | POST | `/api/products/my/{product_id}` |
| 마이 제품 해제 | DELETE | `/api/products/my/{product_id}` |
| 홈 통합 | GET | `/api/home` |
| 내 제품 목록 | GET | `/api/products/my` |
| 0.5/1.1 제품 상세 | GET | `/api/products/{product_id}` |
| 수선 이력 | GET | `/api/products/{product_id}/repairs` |
| 수선 신청 | POST | `/api/products/{product_id}/repairs` |
| 수선 단건 | GET | `/api/products/{product_id}/repairs/{repair_id}` |
| 내 수선 내역 | GET | `/api/repairs` |
| Story 목록 (제품 로그 필터) | GET | `/api/products/{product_id}/stories` |
| 2.1 Story 생성 (남준) | POST | `/api/products/{product_id}/stories` |
| 2.2 Story 단건 (남준) | GET | `/api/products/{product_id}/stories/{story_id}` |
| 2.2 Story 수정 (남준) | PATCH | `/api/products/{product_id}/stories/{story_id}` |
| 2.2 Story 삭제 (남준) | DELETE | `/api/products/{product_id}/stories/{story_id}` |
| 2.3 스토리북 그룹(간이) | GET | `/api/products/{id}/stories?group_by=month\|trip` |
| 소유권 이전 목록 | GET | `/api/transfers` |
| 소유권 이전 신청 | POST | `/api/transfers` |

### 스캔 ownership_status
- `unregistered` → 등록 확인
- `owned_by_me` → 제품 상세
- `owned_by_other` → 타인 등록

태그: `UNIT-STARK-0001` / `UNIT-PINA-0003`(미등록) / `CAMP-STARK-999`(타인 소유)

스키마 설계: `supabase/SCHEMA.md` · SQL: `supabase/schema.sql`


---

## ⏸ 명세상 보류 / 후순위

| 항목 | 사유 |
|---|---|
| 캠페인 전용 API | API 없음 (랜딩 정적) |
| 소셜 로그인 | 이메일 우선, 추후 |
| 쿠폰함·캠페인 | 추후 구현 |
| 수선 승인/취소 | DB 수동 관리 (MVP) |
| AI 이미지 생성 | mock/후순위 |
| 케어 가이드 전용 API | 제품 상세 `care.guide`에 정적 포함 |
| 통합 타임라인(전 제품) | 제품 단위 stories만 — 추후 확장 가능 |
| 샵 | 범위 보류 |

---

## curl 예시

```bash
# 로그인
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"gonji@mcm.test","password":"password123"}'

# 홈
curl -s http://localhost:3000/api/home

# 스캔
curl -s http://localhost:3000/api/products/scan/UNIT-STARK-0001

# 제품 상세
curl -s http://localhost:3000/api/products/stark

# 수선
curl -s http://localhost:3000/api/products/stark/repairs
curl -s -X POST http://localhost:3000/api/products/stark/repairs \
  -H 'Content-Type: application/json' \
  -d '{"title":"지퍼 점검","condition_tags":["zipper"]}'

# Story (남준)
curl -s http://localhost:3000/api/products/stark/stories
curl -s http://localhost:3000/api/products/stark/stories/seongsu-inspiration

# 이전
curl -s http://localhost:3000/api/transfers
```

상세 Story 문서는 `docs/STORY_API.md` 참고.

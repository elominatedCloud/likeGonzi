# Story API 명세서 (개발·검수용)

장남준 담당 IA **2.1 기록 작성 / 2.2 기록 상세** 대응입니다.

Next.js App Router에서는 페이지 라우트와 겹치지 않도록 **`/api` prefix** 를 둡니다.  
(명세 경로 `/products/{id}/stories` ≡ 구현 경로 `/api/products/{id}/stories`)

## Endpoints

| IA | 설명 | Method | Path |
|---|---|---|---|
| 2.1 기록 작성 | Story 생성 | `POST` | `/api/products/{product_id}/stories` |
| (검수용) | Story 목록 | `GET` | `/api/products/{product_id}/stories` |
| 2.2 기록 상세 | Story 단건 조회 | `GET` | `/api/products/{product_id}/stories/{story_id}` |
| 2.2 수정 | Story 수정 | `PATCH` | `/api/products/{product_id}/stories/{story_id}` |
| 2.2 삭제 | Story 삭제 | `DELETE` | `/api/products/{product_id}/stories/{story_id}` |

### product_id

남준 FE 기준: `stark` | `ella` | `pina`  
홈/제품상세 기준: `stark-backpack` | `ella-boston`

### Request body (POST)

```json
{
  "image_url": "https://... or /FE-namjun/assets/...",
  "tag": "성수에서 만난 새로운 영감",
  "place": "서울 성수동",
  "memo": "전시를 보고 카페에 들른 여유로운 날.",
  "story": "선택 — 본문 스토리",
  "product_ids": ["stark", "ella"],
  "date": "2026-08-16"
}
```

- 필수: `image_url`, `tag`
- 선택: `place`, `memo`, `story`, `product_ids`, `date`

### Response

성공:

```json
{
  "ok": true,
  "data": {
    "id": "seongsu-inspiration",
    "product_id": "stark",
    "image_url": "...",
    "tag": "...",
    "place": "서울 성수동",
    "memo": "...",
    "story": "...",
    "product_ids": ["stark"],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

실패:

```json
{
  "ok": false,
  "error": { "code": "STORY_NOT_FOUND", "message": "..." }
}
```

## curl 체크

```bash
# 목록
curl -s http://localhost:3000/api/products/stark/stories | jq

# 단건
curl -s http://localhost:3000/api/products/stark/stories/seongsu-inspiration | jq

# 생성
curl -s -X POST http://localhost:3000/api/products/stark/stories \
  -H 'Content-Type: application/json' \
  -d '{"image_url":"/FE-namjun/assets/로그_타임라인-2.png","tag":"테스트 기록","place":"서울","memo":"메모"}' | jq

# 수정
curl -s -X PATCH http://localhost:3000/api/products/stark/stories/seongsu-inspiration \
  -H 'Content-Type: application/json' \
  -d '{"memo":"수정된 메모"}' | jq

# 삭제 (생성한 id로)
curl -s -X DELETE http://localhost:3000/api/products/stark/stories/{story_id} | jq
```

## FE에서 쓰기

```ts
import { createStory, getStory, updateStory, deleteStory } from "@/lib/story-api-client";

await createStory("stark", {
  image_url: photo,
  tag: title,
  place,
  memo,
});
```

현재 서버는 Supabase 미연결 시 **인메모리 스토어**(시드 포함)로 동작합니다. 프로세스 재시작 시 생성분은 초기됩니다.

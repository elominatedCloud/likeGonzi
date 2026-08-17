# RPC 동작 최종 확인

## 1) SQL Editor에서 (비로그인 상태 = anon)

```sql
select * from public.scan_product('UNIT-PINA-0003');
-- status = 'unregistered' 나와야 정상 (아직 아무도 등록 안 한 유닛)

select * from public.scan_product('UNIT-STARK-0001');
-- 아무도 등록 안 했으면 'unregistered'
-- 누가 등록했는데 나(anon)는 로그인 안 했으면 'owned_by_other'
```

SQL Editor는 기본적으로 `auth.uid() = null` 상태로 실행되기 때문에
**`owned_by_me`는 여기서 절대 안 나옵니다.** (정상 동작)

## 2) 실제 로그인 세션으로 `owned_by_me` 확인

가장 빠른 방법은 seed 이후 3번(스캔 API)까지 붙이고 curl로 직접 때려보는 것:

```bash
# 1. 회원가입 (Supabase Auth 유저 생성 + profiles 트리거)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"gonji@mcm.test","password":"password123","nickname":"곤지"}'
# → access_token 복사

# 2. 로그인 (또는 위 access_token 그대로 사용)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gonji@mcm.test","password":"password123"}'

# 3. 스캔 (미등록 상태 확인)
curl http://localhost:3000/api/products/scan/UNIT-STARK-0001 \
  -H "Authorization: Bearer <access_token>"
# → ownership_status: "unregistered"

# 4. 등록(claim)
curl -X POST http://localhost:3000/api/products/my/UNIT-STARK-0001 \
  -H "Authorization: Bearer <access_token>"

# 5. 다시 스캔 → owned_by_me 확인
curl http://localhost:3000/api/products/scan/UNIT-STARK-0001 \
  -H "Authorization: Bearer <access_token>"
# → ownership_status: "owned_by_me"

# 6. 다른 계정으로 로그인해서 같은 태그 스캔 → owned_by_other 확인
```

## 3) 경쟁 상태(동시 등록) 확인 — 선택

같은 tag_code로 `claim_product`를 서로 다른 두 유저 토큰으로 거의 동시에 두 번 호출해서
한쪽은 성공(201), 한쪽은 `already registered`(409)로 떨어지는지 확인하면
`for update` row lock이 의도대로 동작하는 것까지 검증됩니다.

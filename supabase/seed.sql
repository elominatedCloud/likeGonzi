-- ============================================================
-- 시드 데이터
-- 대상: Supabase 대시보드 SQL Editor에서 그대로 실행
-- 주의: auth.users는 여기서 직접 만들지 않습니다.
--       (Supabase Auth 밖에서 auth.users에 직접 insert하는 건 비밀번호 해시 등
--        내부 구조상 위험/비권장 — 반드시 POST /auth/signup 으로 만드세요)
-- ============================================================

insert into public.products (id, product_name, model_no, material, manufacturer, description)
values
  ('11111111-1111-1111-1111-111111111111', 'Stark Backpack',      'MWKCSVE01C', 'Visetos',         'MCM', 'MCM 시그니처 백팩'),
  ('22222222-2222-2222-2222-222222222222', 'Ella Boston Bag',     'MWEBSVE01B', 'Visetos leather', 'MCM', 'MCM 보스턴백'),
  ('33333333-3333-3333-3333-333333333333', 'Pina Studded Wallet', 'MWPINA01',   'Calfskin',        'MCM', 'MCM 스터드 지갑')
on conflict (id) do nothing;

insert into public.product_units
  (id, product_id, tag_code, serial_no, store, color, year, cutout_image, lifestyle_images, care_score, repair_vouchers, cleaning_vouchers)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'UNIT-STARK-0001', 'MWKCSVE01C0001', 'MCM Seoul', 'Cognac', 2024,
    '/camera/stark-product.png',
    array['/FE-namjun/assets/로그_타임라인-1.png','/FE-namjun/assets/로그_타임라인-2.png','/FE-namjun/assets/로그_타임라인-3.png'], 92, 1, 1
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'UNIT-ELLA-0002', 'MWEBSVE01B0002', 'MCM Gangnam', 'Black', 2023,
    '/FE-namjun/assets/로그_스토리북-3.png',
    array['/FE-namjun/assets/ella-jazz-memory.png'], 88, 0, 1
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'UNIT-PINA-0003', 'MWPINA01C0003', 'MCM Seoul', 'Black', 2025,
    '/FE-namjun/assets/로그_스토리북-4.png',
    array['/FE-namjun/assets/pina-bookstore-memory.png'], 90, 1, 0
  )
on conflict (tag_code) do nothing;

-- ------------------------------------------------------------
-- 로그인 유저로 UNIT-STARK-0001을 바로 owned_by_me로 만들고 싶다면:
-- 1) POST /auth/signup 으로 회원가입 (예: gonji@mcm.test)
-- 2) 아래 UPDATE의 <YOUR_AUTH_UID> 를 supabase 대시보드 Authentication 탭에서 복사한
--    실제 user id로 바꿔서 실행 (또는 claim_product RPC를 API로 호출해도 동일)
-- ------------------------------------------------------------
-- insert into public.user_products (user_id, product_unit_id)
-- values ('<YOUR_AUTH_UID>', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
-- on conflict (product_unit_id) do nothing;

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

-- ------------------------------------------------------------
-- IR 데모용 상황 데이터
--
-- 분량 근거: brand_* 집계 뷰가 k-익명성으로 5건 미만 그룹을 제외한다.
-- occasion 7종에 20건을 "골고루" 뿌리면 그룹당 3건이라 전부 잘려 뷰가 빈다.
-- 그래서 상위 조합에 몰아 45건을 넣어 (모델 x occasion), (모델 x 도시)가
-- 모두 5건을 넘기게 한다.
--
-- 계정은 이미 가입돼 있어야 한다(auth.users의 email로 찾는다).
-- ------------------------------------------------------------

-- 집계 대상이 되려면 동의가 있어야 한다(데모 계정 한정).
update public.profiles
   set analytics_consent = true,
       analytics_consent_at = now()
 where id in (
   select id from auth.users
    where email in ('gonji.test.mcm@gmail.com', 'test2@mcm.test', 'admin@test.com')
 )
   and not analytics_consent;

with spec(email, slug, occasion, companion, city, country, cnt) as (
  values
    ('gonji.test.mcm@gmail.com', 'stark', array['commute'],   'colleagues', '서울', 'KR', 7),
    ('gonji.test.mcm@gmail.com', 'stark', array['daily'],     'solo',       '서울', 'KR', 6),
    ('gonji.test.mcm@gmail.com', 'stark', array['travel'],    'friends',    '도쿄', 'JP', 5),
    ('test2@mcm.test',           'pina',  array['date'],      'partner',    '서울', 'KR', 6),
    ('test2@mcm.test',           'pina',  array['gathering'], 'friends',    '서울', 'KR', 5),
    ('test2@mcm.test',           'pina',  array['daily'],     'solo',       '부산', 'KR', 5),
    ('admin@test.com',           'ella',  array['travel'],    'family',     '파리', 'FR', 6),
    ('admin@test.com',           'ella',  array['exhibition'],'friends',    '도쿄', 'JP', 5)
),
owner_model(email, slug) as (
  select distinct email, slug from spec
),
owned_registration(email, slug, registered_on) as (
  select u.email, p.slug, min(up.registered_at)::date
    from public.user_products up
    join auth.users u on u.id = up.user_id
    join public.product_units pu on pu.id = up.product_unit_id
    join public.products p on p.id = pu.product_id
    join owner_model om on om.email = u.email and om.slug = p.slug
   group by u.email, p.slug
),
inserted as (
  insert into public.stories
    (user_id, tag, photo_url, location, memo, story_date, occasion, companion, city, country)
  select u.id,
         spec.city || '에서의 순간 ' || g,
         case spec.slug
           when 'pina' then '/FE-namjun/assets/pina-bookstore-memory.png'
           when 'ella' then '/FE-namjun/assets/ella-jazz-memory.png'
           else '/FE-namjun/assets/로그_타임라인-1.png'
         end,
         spec.city || ' 일대',
         null,
         greatest(owned_registration.registered_on, current_date - (g * 7)),
         spec.occasion, spec.companion, spec.city, spec.country
    from spec
    join auth.users u on u.email = spec.email
    join owned_registration on owned_registration.email = spec.email
                           and owned_registration.slug = spec.slug
   cross join generate_series(1, spec.cnt) as g
  returning id, user_id
)
insert into public.story_products (story_id, product_unit_id)
select i.id,
       (select up.product_unit_id
          from public.user_products up
          join public.product_units pu on pu.id = up.product_unit_id
          join public.products p on p.id = pu.product_id
          join auth.users u2 on u2.id = up.user_id
          join owner_model om on om.email = u2.email
         where up.user_id = i.user_id and p.slug = om.slug
         limit 1)
  from inserted i
 on conflict do nothing;

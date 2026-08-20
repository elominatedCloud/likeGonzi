-- ============================================================
-- MCM Storybook — public 스키마
--
-- 이 파일은 실제 Supabase 프로젝트(kwstxcaggtxnntwwpxto)의 상태를 그대로 옮긴
-- 스냅샷입니다. 손으로 관리하던 이전 버전이 실제 DB와 어긋나 있어서
-- (my_products_view 누락, 존재하지 않는 함수 선언 등) 카탈로그에서 다시 뽑았습니다.
--
-- 스키마를 바꿀 때는 이 파일을 고치는 대신 마이그레이션을 적용한 뒤
-- 이 파일을 다시 뽑아 주세요. 그래야 파일과 DB가 갈라지지 않습니다.
-- 새 환경 세팅: 이 파일 → seed.sql 순서로 실행.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 테이블
-- ------------------------------------------------------------

-- 사용자 프로필. auth.users와 1:1이며 handle_new_user 트리거가 자동 생성한다.
create table if not exists public.profiles (
  id uuid not null,
  nickname text,
  birthday date,
  travel_style text[] default '{}'::text[],
  onboarding_completed boolean default false,
  membership text default 'SILVER'::text not null,
  cleaning_coupons integer default 0 not null,
  repair_vouchers integer default 0 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- 운영 도구(/admin) 접근 권한. is_admin() 함수와 RLS 정책이 이 값을 본다.
  is_admin boolean default false not null,
  -- 브랜드 집계 통계 포함 동의. false면 brand_* 뷰에서 즉시 제외된다.
  -- 동의 없이도 앱의 개인 기능은 전부 정상 동작한다.
  analytics_consent boolean default false not null,
  analytics_consent_at timestamptz,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_membership_check check (membership = any (array['SILVER'::text, 'GOLD'::text, 'PLATINUM'::text])),
  constraint profiles_cleaning_coupons_check check (cleaning_coupons >= 0),
  constraint profiles_repair_vouchers_check check (repair_vouchers >= 0),
  constraint profiles_analytics_consent_at_check check (
    (analytics_consent and analytics_consent_at is not null)
    or (not analytics_consent and analytics_consent_at is null)
  )
);

-- 제품 모델(Stark Backpack 등). 개체가 아니라 카탈로그.
create table if not exists public.products (
  id uuid default gen_random_uuid() not null,
  product_name text not null,
  model_no text,
  material text,
  manufacturer text,
  description text,
  slug text,
  created_at timestamptz default now(),
  constraint products_pkey primary key (id),
  -- EU ESPR 디지털 제품 여권 항목. dpp_data_source가 'demo'면 시연용 가정치라
  -- 화면에서 그렇게 표시한다. 브랜드 실데이터로 바꾸면 'brand'로 올린다.
  gtin text,
  material_composition jsonb,
  recycled_content_pct numeric(5,2),
  repairability_score numeric(3,1),
  country_of_origin text,
  dpp_data_source text not null default 'demo'
    check (dpp_data_source in ('demo', 'brand')),
  constraint products_gtin_digits check (gtin is null or gtin ~ '^[0-9]{13}$')
);

-- GTIN은 GS1 Digital Link(/01/{gtin}/21/{serial})의 앞자리다.
-- 290 대역은 제한 유통이라 실제 등록 상품과 충돌하지 않는다.
create unique index if not exists products_gtin_key on public.products (gtin) where gtin is not null;

-- GS1 Digital Link를 tag_code로 바꾼다. 태그를 찍는 사람은 아직 로그인 전일 수
-- 있어서 scan_product과 같은 이유로 security definer다.
create or replace function public.resolve_gs1_link(p_gtin text, p_serial text)
returns text
language sql
security definer
set search_path to ''
stable
as $$
  select pu.tag_code
    from public.product_units pu
    join public.products p on p.id = pu.product_id
   where p.gtin = p_gtin and pu.serial_no = p_serial
   limit 1;
$$;

revoke all on function public.resolve_gs1_link(text, text) from public;
grant execute on function public.resolve_gs1_link(text, text) to anon, authenticated;

-- slug는 제품 조회 키(resolveOwnedProductRef, create_story_with_products,
-- issue_product_units)로 쓰이므로 중복을 막는다.
create unique index if not exists products_slug_key on public.products (slug) where slug is not null;

-- 실제 물리 제품 한 개(개체). QR/NFC 태그의 tag_code가 여기에 붙는다.
create table if not exists public.product_units (
  id uuid default gen_random_uuid() not null,
  product_id uuid not null,
  tag_code text not null,
  serial_no text not null,
  store text,
  color text,
  year integer,
  cutout_image text,
  lifestyle_images text[] default '{}'::text[],
  care_score integer default 90,
  repair_vouchers integer default 0 not null,
  cleaning_vouchers integer default 0 not null,
  created_at timestamptz default now(),
  constraint product_units_pkey primary key (id),
  constraint product_units_product_id_fkey foreign key (product_id) references public.products (id) on delete restrict,
  constraint product_units_tag_code_key unique (tag_code),
  constraint product_units_serial_no_key unique (serial_no),
  constraint product_units_care_score_check check (care_score >= 0 and care_score <= 100),
  constraint product_units_repair_vouchers_check check (repair_vouchers >= 0),
  constraint product_units_cleaning_vouchers_check check (cleaning_vouchers >= 0)
);

-- 개체 소유권. unique(product_unit_id)로 한 개체는 한 사람만 등록할 수 있다.
create table if not exists public.user_products (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  product_unit_id uuid not null,
  is_favorite boolean default false not null,
  registered_at timestamptz default now(),
  constraint user_products_pkey primary key (id),
  constraint user_products_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint user_products_product_unit_id_fkey foreign key (product_unit_id) references public.product_units (id) on delete cascade,
  constraint user_products_product_unit_id_key unique (product_unit_id)
);

-- 사진 기록. photo_url(외부/로컬 경로) 또는 photo_path(private Storage) 중 하나는 필수.
create table if not exists public.stories (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  tag text,
  photo_url text,
  photo_path text,
  location text,
  memo text,
  story text,
  trip_label text,
  -- 집계 가능한 상황 축. tag/location은 자유 텍스트라 집계가 안 돼서 따로 둔다.
  occasion text[] not null default '{}'::text[],   -- commute, travel, exhibition, gathering, date, workout, daily
  companion text,                                   -- solo, friends, family, partner, colleagues
  city text,                                        -- 정규화된 도시명
  country text,                                     -- ISO 3166-1 alpha-2
  story_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint stories_pkey primary key (id),
  constraint stories_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint stories_photo_reference_required check (
    nullif(btrim(photo_url), ''::text) is not null
    or nullif(btrim(photo_path), ''::text) is not null
  ),
  constraint stories_companion_check check (
    companion is null
    or companion in ('solo', 'friends', 'family', 'partner', 'colleagues')
  ),
  constraint stories_country_check check (country is null or country ~ '^[A-Z]{2}$')
);

-- 기록 ↔ 개체 다대다. 한 사진에 여러 제품을 태그할 수 있다.
create table if not exists public.story_products (
  story_id uuid not null,
  product_unit_id uuid not null,
  constraint story_products_pkey primary key (story_id, product_unit_id),
  constraint story_products_story_id_fkey foreign key (story_id) references public.stories (id) on delete cascade,
  constraint story_products_product_unit_id_fkey foreign key (product_unit_id) references public.product_units (id) on delete cascade
);

-- 수선 접수. thumbnail_path는 private Storage 경로, thumbnail_url은 데모 폴백(data URL).
-- source: store(매장 접수) / ai_custom(사용자 직접 등록) / user / remade(AI 리폼 시안 채택).
--   'ai_custom'은 이미 UI에서 "직접 등록" 라벨로 쓰이므로 REMADE에 재사용하지 않는다.
create table if not exists public.repairs (
  id uuid default gen_random_uuid() not null,
  product_unit_id uuid not null,
  user_id uuid not null,
  title text,
  condition_tags text[] default '{}'::text[],
  status text default 'submitted'::text not null,
  location text,
  thumbnail_url text,
  thumbnail_path text,
  -- 접수할 때 사용자가 적은 상태 설명. REMADE 시안 프롬프트가 읽는다.
  memo text,
  ai_image_url text,
  -- 견적. 금액은 lib/repair-estimate.ts 기준표에서 계산한다(AI가 만들지 않는다).
  estimate_min integer,
  estimate_max integer,
  estimate_days integer,
  estimate_note text,
  estimated_at timestamptz,
  -- ⚠️ 실제 결제가 아니다. 데모 시연용 상태 전이이며 돈이 오가지 않는다.
  --    실결제에는 PG 계약·웹훅·환불 처리가 별도로 필요하다.
  paid_at timestamptz,
  is_demo_payment boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz,
  source text default 'store'::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now() not null,
  constraint repairs_pkey primary key (id),
  constraint repairs_product_unit_id_fkey foreign key (product_unit_id) references public.product_units (id) on delete cascade,
  constraint repairs_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  -- 접수 → 견적 완료 → 진행 확정 → 수선 중 → 완료
  constraint repairs_status_check check (status = any (array['submitted'::text, 'quoted'::text, 'paid'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  constraint repairs_estimate_range_check check (
    estimate_min is null or estimate_max is null or estimate_min <= estimate_max
  ),
  constraint repairs_source_check check (source = any (array['store'::text, 'ai_custom'::text, 'user'::text, 'remade'::text, 'restore'::text]))
);

-- 소유권 이전 신청. 현재 FE는 '연동 해제'(user_products 삭제) 방식을 쓰고 이 API는 미사용.
create table if not exists public.ownership_transfers (
  id uuid default gen_random_uuid() not null,
  product_unit_id uuid not null,
  from_user_id uuid not null,
  to_email text not null,
  status text default 'pending'::text not null,
  created_at timestamptz default now(),
  completed_at timestamptz,
  constraint ownership_transfers_pkey primary key (id),
  constraint ownership_transfers_product_unit_id_fkey foreign key (product_unit_id) references public.product_units (id) on delete cascade,
  constraint ownership_transfers_from_user_id_fkey foreign key (from_user_id) references auth.users (id),
  constraint ownership_transfers_status_check check (status = any (array['pending'::text, 'completed'::text, 'cancelled'::text]))
);

-- AI Recap 캐시. 생성 시점의 기록 수를 같이 저장해 건수가 바뀔 때만 재생성한다.
create table if not exists public.product_recaps (
  id uuid default gen_random_uuid() not null,
  product_unit_id uuid not null,
  user_id uuid not null,
  content text not null,
  story_count integer default 0 not null,
  repair_count integer default 0 not null,
  is_ai boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint product_recaps_pkey primary key (id),
  constraint product_recaps_product_unit_id_fkey foreign key (product_unit_id) references public.product_units (id) on delete cascade,
  constraint product_recaps_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade,
  constraint product_recaps_product_unit_id_user_id_key unique (product_unit_id, user_id)
);

-- 제품 생애주기 이벤트 로그.
-- 배치·큐 없이 발생 시점에 단순 insert 한다. 로깅 실패가 등록·기록 저장을
-- 막으면 안 되므로 호출부(lib/product-events.ts)는 절대 throw하지 않는다.
create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  -- 스캔은 비로그인도 가능해서 user_id가 없을 수 있다.
  user_id uuid references public.profiles (id) on delete set null,
  product_unit_id uuid references public.product_units (id) on delete set null,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb,
  constraint product_events_type_check check (
    event_type in (
      'scan', 'unbox_complete', 'register', 'story_create',
      'repair_submit', 'recap_view', 'share'
    )
  )
);

-- ------------------------------------------------------------
-- 인덱스
-- ------------------------------------------------------------

create index if not exists idx_product_units_product_id on public.product_units (product_id);
create index if not exists idx_product_units_tag_code on public.product_units (tag_code);
create index if not exists idx_user_products_user_id on public.user_products (user_id);
create index if not exists idx_stories_user_id on public.stories (user_id);
create index if not exists idx_stories_user_id_date on public.stories (user_id, story_date);
create index if not exists idx_stories_tag on public.stories (tag);
create index if not exists idx_stories_trip_label on public.stories (trip_label);
create index if not exists stories_photo_path_idx on public.stories (photo_path) where photo_path is not null;
-- occasion은 배열 포함 검색(&&, @>)으로 집계하므로 GIN
create index if not exists stories_occasion_idx on public.stories using gin (occasion);
create index if not exists stories_country_city_idx on public.stories (country, city);
create index if not exists idx_story_products_product_unit_id on public.story_products (product_unit_id);
create index if not exists idx_repairs_product_unit_id on public.repairs (product_unit_id);
create index if not exists idx_repairs_product_unit_id_status on public.repairs (product_unit_id, status);
create index if not exists idx_ownership_transfers_product_unit_id on public.ownership_transfers (product_unit_id);
create index if not exists idx_ownership_transfers_to_email on public.ownership_transfers (to_email);
create index if not exists product_recaps_user_idx on public.product_recaps (user_id);
create index if not exists product_events_type_time_idx on public.product_events (event_type, occurred_at desc);
create index if not exists product_events_unit_idx on public.product_events (product_unit_id);

-- ------------------------------------------------------------
-- 뷰
-- ------------------------------------------------------------

-- 내 제품 목록. API(/api/products/my, /api/home, 제품 상세)가 이 뷰를 읽는다.
create or replace view public.my_products_view as
  select pu.id,
         up.registered_at,
         up.is_favorite,
         pu.tag_code,
         pu.serial_no,
         pu.store,
         pu.color,
         pu.year,
         pu.cutout_image,
         pu.lifestyle_images,
         -- 상수가 아니라 등록된 기록·수선으로 계산한다.
         public.compute_care_score(pu.id) as care_score,
         pu.repair_vouchers,
         pu.cleaning_vouchers,
         up.user_id,
         p.id as model_id,
         p.product_name,
         p.model_no,
         p.material,
         p.manufacturer
    from public.user_products up
    join public.product_units pu on pu.id = up.product_unit_id
    join public.products p on p.id = pu.product_id;

-- ------------------------------------------------------------
-- B2B 집계 뷰
--
-- 접근 통제: 뷰에는 RLS 정책을 걸 수 없다(정책은 기반 테이블에만 붙는다).
-- security_invoker를 켜면 stories RLS가 "본인 것만"이라 집계 자체가 불가능해진다.
-- 그래서 뷰 본문에 is_admin() 조건을 넣어 운영자가 아니면 빈 결과가 나오게 한다.
--
-- 개인정보: user_id 등 식별자를 일절 반환하지 않는다. 집계 수치만 내보낸다.
-- k-익명성: 5건 미만 그룹은 제외한다. 소수 그룹은 특정 개인의 행동으로 역추적될 수 있다.
-- 동의: analytics_consent = true 인 사용자만 집계한다. 철회하면 다음 조회부터 바로 빠진다.
-- ------------------------------------------------------------

create or replace view public.brand_occasion_usage as
  select p.slug as product_slug, p.product_name, o.occasion, count(*) as story_count
    from public.stories s
    join public.profiles pr on pr.id = s.user_id and pr.analytics_consent
    join public.story_products sp on sp.story_id = s.id
    join public.product_units pu on pu.id = sp.product_unit_id
    join public.products p on p.id = pu.product_id
   cross join lateral unnest(s.occasion) as o(occasion)
   where public.is_admin()
   group by p.slug, p.product_name, o.occasion
  having count(*) >= 5;

-- repairs.condition_tags는 처음부터 text[]로 구조화돼 있어 바로 집계된다.
create or replace view public.brand_repair_hotspots as
  select p.slug as product_slug, p.product_name, t.condition_tag, count(*) as repair_count
    from public.repairs r
    join public.profiles pr on pr.id = r.user_id and pr.analytics_consent
    join public.product_units pu on pu.id = r.product_unit_id
    join public.products p on p.id = pu.product_id
   cross join lateral unnest(r.condition_tags) as t(condition_tag)
   where public.is_admin()
   group by p.slug, p.product_name, t.condition_tag
  having count(*) >= 5;

create or replace view public.brand_city_usage as
  select p.slug as product_slug, p.product_name, s.country, s.city, count(*) as story_count
    from public.stories s
    join public.profiles pr on pr.id = s.user_id and pr.analytics_consent
    join public.story_products sp on sp.story_id = s.id
    join public.product_units pu on pu.id = sp.product_unit_id
    join public.products p on p.id = pu.product_id
   where public.is_admin() and s.country is not null and s.city is not null
   group by p.slug, p.product_name, s.country, s.city
  having count(*) >= 5;

revoke all on public.brand_occasion_usage from anon;
revoke all on public.brand_repair_hotspots from anon;
revoke all on public.brand_city_usage from anon;
grant select on public.brand_occasion_usage to authenticated;
grant select on public.brand_repair_hotspots to authenticated;
grant select on public.brand_city_usage to authenticated;

-- ------------------------------------------------------------
-- 함수
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- auth.users에 새 계정이 생기면 profiles를 자동 생성한다.
--
-- 소셜 로그인은 raw_user_meta_data에 'nickname'을 넣어주지 않는다.
-- Google은 full_name/name, Kakao는 name으로 온다. 이메일 가입만 signup API가
-- nickname을 직접 채운다. 순서대로 훑고, 다 없으면 이메일 아이디 부분을 쓴다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data->>'nickname',
          new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'name',
          split_part(coalesce(new.email, ''), '@', 1)
        )
      ),
      ''
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 운영자 판정. RLS 정책 안에서 profiles를 직접 조회하면 정책이 재귀하므로
-- security definer로 감싼다.
create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = p_user_id), false);
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- QR/NFC 스캔. 로그인 없이도 호출 가능하며 auth.uid() 기준으로 소유 상태를 판별한다.
create or replace function public.scan_product(p_tag_code text)
returns table(status text, product_unit_id uuid, product_name text, model_no text,
              material text, manufacturer text, serial_no text)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_unit_id uuid;
  v_serial_no text;
  v_product_name text;
  v_model_no text;
  v_material text;
  v_manufacturer text;
  v_owner uuid;
begin
  select pu.id, pu.serial_no, p.product_name, p.model_no, p.material, p.manufacturer
    into v_unit_id, v_serial_no, v_product_name, v_model_no, v_material, v_manufacturer
  from public.product_units pu
  join public.products p on p.id = pu.product_id
  where pu.tag_code = p_tag_code;

  if not found then
    raise exception 'invalid tag code';
  end if;

  select up.user_id into v_owner
  from public.user_products up
  where up.product_unit_id = v_unit_id;

  if v_owner is null then
    status := 'unregistered';
  elsif v_owner = auth.uid() then
    status := 'owned_by_me';
  else
    status := 'owned_by_other';
  end if;

  product_unit_id := v_unit_id;
  product_name := v_product_name;
  model_no := v_model_no;
  material := v_material;
  manufacturer := v_manufacturer;
  serial_no := v_serial_no;
  return next;
end;
$$;

-- 제품 등록. for update로 동시 등록 경쟁을 막는다.
create or replace function public.claim_product(p_tag_code text)
returns table(product_unit_id uuid)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_unit_id uuid;
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  select pu.id into v_unit_id
  from public.product_units pu
  where pu.tag_code = p_tag_code
  for update;

  if not found then
    raise exception 'invalid tag code';
  end if;

  if exists (select 1 from public.user_products up where up.product_unit_id = v_unit_id) then
    raise exception 'already registered';
  end if;

  insert into public.user_products (user_id, product_unit_id)
  values (auth.uid(), v_unit_id);

  product_unit_id := v_unit_id;
  return next;
end;
$$;

-- 기록 저장 + 제품 연결을 한 트랜잭션으로 처리한다(소유권 검증 포함).
create or replace function public.create_story_with_products(
  p_tag text,
  p_photo_path text,
  p_location text default null,
  p_memo text default null,
  p_story_date date default current_date,
  p_product_slugs text[] default '{}'::text[],
  -- 상황 축. 기존 호출부(인자 6개)가 깨지지 않도록 전부 default를 준다.
  p_occasion text[] default '{}'::text[],
  p_companion text default null,
  p_city text default null,
  p_country text default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_story_id uuid;
  v_requested_count integer;
  v_owned_count integer;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if nullif(btrim(p_tag), '') is null then
    raise exception 'TAG_REQUIRED' using errcode = '22023';
  end if;

  -- 남의 폴더 경로를 밀어 넣지 못하게 첫 폴더가 본인 uid인지 검사한다.
  if nullif(btrim(p_photo_path), '') is null
     or split_part(p_photo_path, '/', 1) <> v_user_id::text then
    raise exception 'INVALID_PHOTO_PATH' using errcode = '42501';
  end if;

  select count(*)
  into v_requested_count
  from (
    select distinct btrim(value) as slug
    from unnest(coalesce(p_product_slugs, '{}'::text[])) as requested(value)
    where nullif(btrim(value), '') is not null
  ) requested;

  if v_requested_count = 0 then
    raise exception 'PRODUCT_REQUIRED' using errcode = '22023';
  end if;

  select count(distinct p.slug)
  into v_owned_count
  from public.products p
  join public.product_units pu on pu.product_id = p.id
  join public.user_products up on up.product_unit_id = pu.id
  where up.user_id = v_user_id
    and p.slug = any(p_product_slugs);

  if v_owned_count <> v_requested_count then
    raise exception 'PRODUCT_NOT_OWNED' using errcode = '42501';
  end if;

  insert into public.stories (
    user_id, tag, photo_path, location, memo, story_date,
    occasion, companion, city, country
  )
  values (
    v_user_id,
    btrim(p_tag),
    p_photo_path,
    nullif(btrim(p_location), ''),
    nullif(btrim(p_memo), ''),
    coalesce(p_story_date, current_date),
    coalesce(p_occasion, '{}'::text[]),
    nullif(btrim(p_companion), ''),
    nullif(btrim(p_city), ''),
    nullif(btrim(p_country), '')
  )
  returning id into v_story_id;

  insert into public.story_products (story_id, product_unit_id)
  select v_story_id, pu.id
  from public.products p
  join public.product_units pu on pu.product_id = p.id
  join public.user_products up on up.product_unit_id = pu.id
  where up.user_id = v_user_id
    and p.slug = any(p_product_slugs)
  on conflict do nothing;

  return jsonb_build_object('id', v_story_id, 'photo_path', p_photo_path, 'product_slugs', p_product_slugs);
end;
$$;

-- 개체 대량 발급(운영자 전용).
-- tag_code/serial_no 채번을 라우트에서 max+1로 하면 동시 발급 시 겹치므로
-- products 행을 for update로 잠그고 DB 안에서 처리한다.
create or replace function public.issue_product_units(
  p_product_slug text,
  p_store text,
  p_year integer,
  p_quantity integer
)
returns setof public.product_units
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_product public.products%rowtype;
  v_sample public.product_units%rowtype;
  v_prefix text;
  v_next int;
  v_index int;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 200 then
    raise exception 'quantity must be between 1 and 200';
  end if;

  select * into v_product from public.products where slug = p_product_slug for update;
  if not found then
    raise exception 'invalid product slug';
  end if;

  -- 새 개체는 같은 제품의 기존 개체에서 외형 정보를 물려받는다
  -- (color/cutout_image는 products가 아니라 product_units에 있다).
  select * into v_sample
    from public.product_units pu
   where pu.product_id = v_product.id
   order by pu.created_at desc
   limit 1;

  v_prefix := 'UNIT-' || upper(v_product.slug) || '-';

  select coalesce(max((regexp_replace(pu.tag_code, '^' || v_prefix, ''))::int), 0) + 1
    into v_next
    from public.product_units pu
   where pu.product_id = v_product.id
     and pu.tag_code ~ ('^' || v_prefix || '[0-9]+$');

  for v_index in 0 .. p_quantity - 1 loop
    return query
    insert into public.product_units
      (product_id, tag_code, serial_no, store, color, year, cutout_image, lifestyle_images)
    values (
      v_product.id,
      v_prefix || lpad((v_next + v_index)::text, 4, '0'),
      v_product.model_no || lpad((v_next + v_index)::text, 4, '0'),
      p_store,
      v_sample.color,
      coalesce(p_year, extract(year from now())::int),
      v_sample.cutout_image,
      '{}'::text[]
    )
    returning *;
  end loop;
end;
$$;

-- 케어 점수 산출.
-- 예전에는 product_units.care_score가 상수(default 90)였고 UI가 내역을 역산해
-- 합을 맞추고 있었다. 실제로 셀 수 있는 신호로 계산한다.
--   기본 70 + 기록 1건당 3(최대 12) + 수선 1건당 6(최대 12)
--   + 최근 90일 내 활동 6. 상한 100.
-- 센서나 이미지 진단이 아니라 등록된 기록만 본다.
create or replace function public.compute_care_score(p_unit_id uuid)
returns integer
language sql
stable
security definer
set search_path to 'public'
as $$
  with story_stats as (
    select count(*) as n, max(s.story_date) as last_at
      from public.stories s
      join public.story_products sp on sp.story_id = s.id
     where sp.product_unit_id = p_unit_id
  ),
  repair_stats as (
    select count(*) as n, max(r.created_at::date) as last_at
      from public.repairs r
     where r.product_unit_id = p_unit_id
  )
  select least(100,
    70
    + least(12, (select n from story_stats)::int * 3)
    + least(12, (select n from repair_stats)::int * 6)
    + case
        when greatest(
               coalesce((select last_at from story_stats), '1970-01-01'::date),
               coalesce((select last_at from repair_stats), '1970-01-01'::date)
             ) >= current_date - 90
        then 6 else 0
      end
  )::int;
$$;

revoke all on function public.compute_care_score(uuid) from public;
grant execute on function public.compute_care_score(uuid) to authenticated;

-- 동의 참여 현황(집계 수치만).
-- profiles는 RLS가 "본인 행만"이라 운영자도 자기 것 하나만 센다.
-- 프로필 전체 조회 권한을 여는 대신 집계만 돌려준다.
create or replace function public.analytics_consent_stats()
returns table(total integer, opted_in integer)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    case when public.is_admin() then (select count(*)::int from public.profiles) else 0 end,
    case when public.is_admin()
         then (select count(*)::int from public.profiles where analytics_consent)
         else 0 end;
$$;

revoke all on function public.analytics_consent_stats() from public;
grant execute on function public.analytics_consent_stats() to authenticated;

revoke all on function public.issue_product_units(text, text, int, int) from public;
grant execute on function public.issue_product_units(text, text, int, int) to authenticated;

-- ------------------------------------------------------------
-- 트리거
-- ------------------------------------------------------------

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_stories_updated_at on public.stories;
create trigger set_stories_updated_at before update on public.stories
  for each row execute function public.set_updated_at();

drop trigger if exists set_repairs_updated_at on public.repairs;
create trigger set_repairs_updated_at before update on public.repairs
  for each row execute function public.set_updated_at();

drop trigger if exists product_recaps_set_updated_at on public.product_recaps;
create trigger product_recaps_set_updated_at before update on public.product_recaps
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS
--
-- product_units는 "본인이 등록한 개체"만 조회된다. 미등록/타인 제품 확인은
-- scan_product RPC(security definer)를 통해서만 가능하다.
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_units enable row level security;
alter table public.user_products enable row level security;
alter table public.stories enable row level security;
alter table public.story_products enable row level security;
alter table public.repairs enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.product_recaps enable row level security;
alter table public.product_events enable row level security;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- products: 카탈로그는 로그인 사용자에게 공개
drop policy if exists products_select_authenticated on public.products;
create policy products_select_authenticated on public.products
  for select using (auth.role() = 'authenticated');

-- product_units
drop policy if exists product_units_select_owned on public.product_units;
create policy product_units_select_owned on public.product_units
  for select using (
    exists (
      select 1 from public.user_products up
       where up.product_unit_id = product_units.id and up.user_id = auth.uid()
    )
  );

drop policy if exists product_units_select_admin on public.product_units;
create policy product_units_select_admin on public.product_units
  for select to authenticated using (public.is_admin());

-- user_products (INSERT는 claim_product RPC만 사용 — 직접 insert 정책 없음)
drop policy if exists user_products_select_own on public.user_products;
create policy user_products_select_own on public.user_products
  for select using (auth.uid() = user_id);

drop policy if exists user_products_select_admin on public.user_products;
create policy user_products_select_admin on public.user_products
  for select to authenticated using (public.is_admin());

drop policy if exists user_products_update_own on public.user_products;
create policy user_products_update_own on public.user_products
  for update using (auth.uid() = user_id);

-- 연동 해제(DELETE /api/products/my/{id})가 이 정책으로 보호된다.
drop policy if exists user_products_delete_own on public.user_products;
create policy user_products_delete_own on public.user_products
  for delete using (auth.uid() = user_id);

-- stories
drop policy if exists stories_select_own on public.stories;
create policy stories_select_own on public.stories
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists stories_insert_own on public.stories;
create policy stories_insert_own on public.stories
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (photo_path is null or (storage.foldername(photo_path))[1] = (select auth.uid()::text))
  );

drop policy if exists stories_update_own on public.stories;
create policy stories_update_own on public.stories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (photo_path is null or (storage.foldername(photo_path))[1] = (select auth.uid()::text))
  );

drop policy if exists stories_delete_own on public.stories;
create policy stories_delete_own on public.stories
  for delete to authenticated using (user_id = (select auth.uid()));

-- story_products
drop policy if exists story_products_select_own on public.story_products;
create policy story_products_select_own on public.story_products
  for select using (
    exists (select 1 from public.stories s where s.id = story_products.story_id and s.user_id = auth.uid())
  );

drop policy if exists story_products_insert_own on public.story_products;
create policy story_products_insert_own on public.story_products
  for insert with check (
    exists (select 1 from public.stories s where s.id = story_products.story_id and s.user_id = auth.uid())
    and exists (select 1 from public.user_products up where up.product_unit_id = story_products.product_unit_id and up.user_id = auth.uid())
  );

drop policy if exists story_products_delete_own on public.story_products;
create policy story_products_delete_own on public.story_products
  for delete using (
    exists (select 1 from public.stories s where s.id = story_products.story_id and s.user_id = auth.uid())
  );

-- repairs: 본인 소유 개체에만 접수할 수 있다.
drop policy if exists repairs_select_own on public.repairs;
create policy repairs_select_own on public.repairs
  for select using (auth.uid() = user_id);

drop policy if exists repairs_insert_own on public.repairs;
create policy repairs_insert_own on public.repairs
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.user_products up
       where up.product_unit_id = repairs.product_unit_id and up.user_id = auth.uid()
    )
  );

-- 운영자는 접수 전체를 보고 진행 상태를 바꿀 수 있다.
drop policy if exists repairs_select_admin on public.repairs;
create policy repairs_select_admin on public.repairs
  for select to authenticated using (public.is_admin());

drop policy if exists repairs_update_admin on public.repairs;
create policy repairs_update_admin on public.repairs
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 본인 접수만 수정할 수 있다(견적 수락·진행 확정).
drop policy if exists repairs_update_own on public.repairs;
create policy repairs_update_own on public.repairs
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ownership_transfers: 보낸 사람과 받는 이메일 당사자만 조회
drop policy if exists transfers_select_involved on public.ownership_transfers;
create policy transfers_select_involved on public.ownership_transfers
  for select using (
    auth.uid() = from_user_id or to_email = (auth.jwt() ->> 'email')
  );

drop policy if exists transfers_insert_own on public.ownership_transfers;
create policy transfers_insert_own on public.ownership_transfers
  for insert with check (
    auth.uid() = from_user_id
    and exists (
      select 1 from public.user_products up
       where up.product_unit_id = ownership_transfers.product_unit_id and up.user_id = auth.uid()
    )
  );

-- product_recaps
drop policy if exists product_recaps_select_own on public.product_recaps;
create policy product_recaps_select_own on public.product_recaps
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists product_recaps_insert_own on public.product_recaps;
create policy product_recaps_insert_own on public.product_recaps
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.user_products up
       where up.product_unit_id = product_recaps.product_unit_id and up.user_id = auth.uid()
    )
  );

drop policy if exists product_recaps_update_own on public.product_recaps;
create policy product_recaps_update_own on public.product_recaps
  for update to authenticated using (auth.uid() = user_id);

-- product_events: 본인 이벤트만 남길 수 있고(비로그인 스캔은 user_id null),
-- 읽기는 운영자만. 개별 사용자에게 돌려줄 화면이 없다.
drop policy if exists product_events_insert_own on public.product_events;
create policy product_events_insert_own on public.product_events
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists product_events_select_admin on public.product_events;
create policy product_events_select_admin on public.product_events
  for select to authenticated using (public.is_admin());

grant insert on public.product_events to anon, authenticated;
grant select on public.product_events to authenticated;

-- ------------------------------------------------------------
-- Storage
-- ------------------------------------------------------------

-- story-photos: private. 경로 첫 폴더가 auth.uid()여야 하며 읽을 때 서명 URL이 필요하다.
-- 수선 사진도 같은 버킷의 {uid}/repairs-{productId}/ 아래에 저장한다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-photos', 'story-photos', false, 8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists story_photos_insert_own on storage.objects;
create policy story_photos_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'story-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists story_photos_select_own on storage.objects;
create policy story_photos_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'story-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists story_photos_delete_own on storage.objects;
create policy story_photos_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'story-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists storage_product_photos_select_all on storage.objects;
create policy storage_product_photos_select_all on storage.objects
  for select using (bucket_id = 'product-photos');

drop policy if exists storage_product_photos_insert_authenticated on storage.objects;
create policy storage_product_photos_insert_authenticated on storage.objects
  for insert with check (bucket_id = 'product-photos' and auth.role() = 'authenticated');

drop policy if exists storage_product_photos_delete_own on storage.objects;
create policy storage_product_photos_delete_own on storage.objects
  for delete using (bucket_id = 'product-photos' and owner = auth.uid());

-- ------------------------------------------------------------
-- 운영자 지정
--
-- 새 환경에서는 아래를 직접 실행하세요. 계정을 지웠다 다시 만들면 uuid가 바뀌므로
-- 이메일 기준으로 부여합니다.
--
--   update public.profiles set is_admin = true
--    where id in (select id from auth.users where email = '운영자_이메일');
-- ------------------------------------------------------------

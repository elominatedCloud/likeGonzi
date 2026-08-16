-- =============================================================================
-- MCM Storybook / likeGonzi — Supabase schema (예서 방향 + 리뷰 반영본)
-- =============================================================================
-- 모델(products) · 실물(product_units) · 소유(user_products) 분리
-- 미등록 제품 = product_units 존재 + user_products 없음 (owner_id nullable 불필요)
-- QR 전체 공개 SELECT 금지 → scan/claim 은 SECURITY DEFINER RPC 로만
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helpers: updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles (auth.users 1:1)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  birthday date,
  travel_style text[] not null default '{}',
  onboarding_completed boolean not null default false,
  membership text not null default 'SILVER'
    check (membership in ('SILVER', 'GOLD', 'PLATINUM')),
  cleaning_coupons int not null default 0 check (cleaning_coupons >= 0),
  repair_vouchers int not null default 0 check (repair_vouchers >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 신규 유저 → profile 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1), 'member')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- products — 제품 모델(카탈로그)
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  model_no text not null,
  slug text unique,
  material text,
  manufacturer text default 'MCM',
  color text,
  cutout_image text,
  care_score int not null default 90 check (care_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists products_model_no_idx on public.products (model_no);
create index if not exists products_slug_idx on public.products (slug);

-- -----------------------------------------------------------------------------
-- product_units — 실물 QR 태그 유닛 (미등록 포함)
-- -----------------------------------------------------------------------------
create table if not exists public.product_units (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  tag_code text not null unique,
  serial_no text not null unique,
  year int,
  store text,
  repair_vouchers int not null default 0 check (repair_vouchers >= 0),
  cleaning_vouchers int not null default 0 check (cleaning_vouchers >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger product_units_set_updated_at
  before update on public.product_units
  for each row execute function public.set_updated_at();

create index if not exists product_units_product_id_idx
  on public.product_units (product_id);

-- -----------------------------------------------------------------------------
-- user_products — 현재 소유 관계 (unit 당 1명)
-- -----------------------------------------------------------------------------
create table if not exists public.user_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_unit_id uuid not null references public.product_units (id) on delete cascade,
  registered_at timestamptz not null default now(),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_unit_id)
);

create trigger user_products_set_updated_at
  before update on public.user_products
  for each row execute function public.set_updated_at();

create index if not exists user_products_user_id_idx
  on public.user_products (user_id);

-- -----------------------------------------------------------------------------
-- stories + story_products (한 기록에 여러 제품)
-- -----------------------------------------------------------------------------
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  photo_url text not null,
  location text,
  memo text,
  trip_label text,
  title text,
  story_date date not null default (timezone('utc', now()))::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stories_set_updated_at
  before update on public.stories
  for each row execute function public.set_updated_at();

create table if not exists public.story_products (
  story_id uuid not null references public.stories (id) on delete cascade,
  product_unit_id uuid not null references public.product_units (id) on delete cascade,
  primary key (story_id, product_unit_id)
);

create index if not exists story_products_unit_idx
  on public.story_products (product_unit_id);

create index if not exists stories_user_id_idx on public.stories (user_id);
create index if not exists stories_story_date_idx on public.stories (story_date desc);

-- -----------------------------------------------------------------------------
-- repairs — 상태 DB 수동 관리 (유저는 status UPDATE 불가)
-- -----------------------------------------------------------------------------
create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  product_unit_id uuid not null references public.product_units (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '수선 접수',
  condition_tags text[] not null default '{}',
  status text not null default 'submitted'
    check (status in ('submitted', 'in_progress', 'completed', 'cancelled')),
  location text,
  thumbnail_url text,
  ai_image_url text,
  source text not null default 'user'
    check (source in ('store', 'ai_custom', 'user')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repairs_completed_at_consistency check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

create trigger repairs_set_updated_at
  before update on public.repairs
  for each row execute function public.set_updated_at();

create index if not exists repairs_unit_idx on public.repairs (product_unit_id);
create index if not exists repairs_user_idx on public.repairs (user_id);
create index if not exists repairs_status_idx on public.repairs (status);

-- -----------------------------------------------------------------------------
-- ownership_transfers — row 생성은 서비스/관리 경로 (MVP 수동 가능)
-- -----------------------------------------------------------------------------
create table if not exists public.ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  product_unit_id uuid not null references public.product_units (id) on delete cascade,
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ownership_transfers_set_updated_at
  before update on public.ownership_transfers
  for each row execute function public.set_updated_at();

create index if not exists ownership_transfers_from_user_idx
  on public.ownership_transfers (from_user_id);
create index if not exists ownership_transfers_unit_idx
  on public.ownership_transfers (product_unit_id);

-- -----------------------------------------------------------------------------
-- leather_checks (선택)
-- -----------------------------------------------------------------------------
create table if not exists public.leather_checks (
  id uuid primary key default gen_random_uuid(),
  product_unit_id uuid not null references public.product_units (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  photo_url text not null,
  ai_summary text,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Ownership helpers (RLS / RPC 공용)
-- =============================================================================
create or replace function public.is_unit_owner(p_unit_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_products up
    where up.product_unit_id = p_unit_id
      and up.user_id = p_user_id
  );
$$;

create or replace function public.current_owner_id(p_unit_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select up.user_id
  from public.user_products up
  where up.product_unit_id = p_unit_id
  limit 1;
$$;

-- =============================================================================
-- QR scan RPC — tag 1건만 반환, 전체 목록 공개 금지
-- ownership_status: unregistered | owned_by_me | owned_by_other
-- =============================================================================
create or replace function public.scan_product_unit(p_tag_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit public.product_units%rowtype;
  v_product public.products%rowtype;
  v_owner uuid;
  v_status text;
begin
  select * into v_unit
  from public.product_units
  where tag_code = p_tag_code;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'TAG_NOT_FOUND', 'message', 'Unknown tag')
    );
  end if;

  select * into v_product from public.products where id = v_unit.product_id;
  v_owner := public.current_owner_id(v_unit.id);

  if v_owner is null then
    v_status := 'unregistered';
  elsif auth.uid() is not null and v_owner = auth.uid() then
    v_status := 'owned_by_me';
  else
    v_status := 'owned_by_other';
  end if;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'tag_code', v_unit.tag_code,
      'product_unit_id', v_unit.id,
      'product_id', v_product.id,
      'product_name', v_product.product_name,
      'model_no', v_product.model_no,
      'slug', v_product.slug,
      'serial_no', v_unit.serial_no,
      'material', v_product.material,
      'color', v_product.color,
      'cutout_image', v_product.cutout_image,
      'ownership_status', v_status,
      'is_registered_to_user', (v_status = 'owned_by_me'),
      'route', case
        when v_status = 'owned_by_me' then 'product_detail'
        when v_status = 'unregistered' then 'register_confirm'
        else 'owned_by_other'
      end
    )
  );
end;
$$;

-- =============================================================================
-- Claim / register RPC — 트랜잭션으로 소유권 획득
-- =============================================================================
create or replace function public.claim_product_unit(p_tag_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit_id uuid;
  v_owner uuid;
  v_row public.user_products%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'Login required')
    );
  end if;

  select id into v_unit_id
  from public.product_units
  where tag_code = p_tag_code
  for update;

  if v_unit_id is null then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'TAG_NOT_FOUND', 'message', 'Unknown tag')
    );
  end if;

  v_owner := public.current_owner_id(v_unit_id);

  if v_owner = auth.uid() then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'ALREADY_REGISTERED', 'message', 'Already owned by you')
    );
  end if;

  if v_owner is not null then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'OWNED_BY_OTHER', 'message', 'Already registered to another user')
    );
  end if;

  insert into public.user_products (user_id, product_unit_id)
  values (auth.uid(), v_unit_id)
  returning * into v_row;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'user_product_id', v_row.id,
      'product_unit_id', v_row.product_unit_id,
      'registered_at', v_row.registered_at
    )
  );
end;
$$;

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_units enable row level security;
alter table public.user_products enable row level security;
alter table public.stories enable row level security;
alter table public.story_products enable row level security;
alter table public.repairs enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.leather_checks enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- products (카탈로그): 로그인 사용자 읽기 허용 (태그/시리얼 없음)
create policy products_select_authenticated on public.products
  for select to authenticated using (true);

-- product_units: 직접 SELECT 전면 공개 금지
-- 본인 소유 unit 만 조회 가능 (스캔은 scan_product_unit RPC)
create policy product_units_select_owned on public.product_units
  for select to authenticated
  using (public.is_unit_owner(id));

-- user_products
create policy user_products_select_own on public.user_products
  for select to authenticated using (user_id = auth.uid());
-- INSERT는 claim_product_unit RPC 만 사용 (직접 insert 정책 없음)
create policy user_products_update_own on public.user_products
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_products_delete_own on public.user_products
  for delete to authenticated using (user_id = auth.uid());

-- stories: 본인 + 소유 제품 검증
create policy stories_select_own on public.stories
  for select to authenticated using (user_id = auth.uid());
create policy stories_insert_own on public.stories
  for insert to authenticated
  with check (user_id = auth.uid());
create policy stories_update_own on public.stories
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy stories_delete_own on public.stories
  for delete to authenticated using (user_id = auth.uid());

create policy story_products_select on public.story_products
  for select to authenticated
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_id and s.user_id = auth.uid()
    )
  );
create policy story_products_insert on public.story_products
  for insert to authenticated
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_id and s.user_id = auth.uid()
    )
    and public.is_unit_owner(product_unit_id)
  );
create policy story_products_delete on public.story_products
  for delete to authenticated
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_id and s.user_id = auth.uid()
    )
  );

-- repairs: 조회/생성만, status 변경은 유저 정책에 없음 (서비스롤/수동)
create policy repairs_select_own on public.repairs
  for select to authenticated
  using (user_id = auth.uid() or public.is_unit_owner(product_unit_id));
create policy repairs_insert_owner on public.repairs
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_unit_owner(product_unit_id)
    and status = 'submitted'
  );
-- UPDATE/DELETE 정책 없음 → 클라이언트에서 status 변경 불가

-- ownership_transfers
create policy ownership_transfers_select_own on public.ownership_transfers
  for select to authenticated using (from_user_id = auth.uid());
create policy ownership_transfers_insert_owner on public.ownership_transfers
  for insert to authenticated
  with check (
    from_user_id = auth.uid()
    and public.is_unit_owner(product_unit_id)
    and status = 'pending'
  );

-- leather_checks
create policy leather_checks_select_own on public.leather_checks
  for select to authenticated using (user_id = auth.uid());
create policy leather_checks_insert_owner on public.leather_checks
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_unit_owner(product_unit_id)
  );

-- =============================================================================
-- GRANTs (최신 Supabase는 RLS와 별도 GRANT 필요)
-- =============================================================================
grant usage on schema public to anon, authenticated;

grant select on public.products to authenticated;
grant select, update, delete on public.user_products to authenticated;
grant select, insert, update, delete on public.stories to authenticated;
grant select, insert, delete on public.story_products to authenticated;
grant select, insert on public.repairs to authenticated;
grant select, insert on public.ownership_transfers to authenticated;
grant select, insert on public.leather_checks to authenticated;
grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;

-- product_units: SELECT only via policy (owned) — still need grant
grant select on public.product_units to authenticated;

grant execute on function public.scan_product_unit(text) to anon, authenticated;
grant execute on function public.claim_product_unit(text) to authenticated;
grant execute on function public.is_unit_owner(uuid, uuid) to authenticated;
grant execute on function public.current_owner_id(uuid) to authenticated;

-- =============================================================================
-- Storage (버킷은 Dashboard 또는 아래 참고 — Storage RLS는 프로젝트에서 추가)
-- =============================================================================
-- insert into storage.buckets (id, name, public) values ('story-photos', 'story-photos', false);
-- insert into storage.buckets (id, name, public) values ('repair-photos', 'repair-photos', false);
-- Storage policies: auth.uid()::text = (storage.foldername(name))[1]

-- =============================================================================
-- Seed (개발용 — 운영에서는 제거)
-- =============================================================================
-- insert into public.products (id, product_name, model_no, slug, material, color)
-- values
--   ('11111111-1111-1111-1111-111111111111', 'Stark Backpack', 'MWKCSVE01C', 'stark', 'Visetos', 'Cognac');
-- insert into public.product_units (product_id, tag_code, serial_no)
-- values
--   ('11111111-1111-1111-1111-111111111111', 'UNIT-STARK-0001', 'MWKCSVE01C0001');

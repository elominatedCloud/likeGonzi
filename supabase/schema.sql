-- MCM Storybook schema (products, care, ownership)
-- Run in Supabase SQL editor when connecting a real project.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  membership text not null default 'SILVER' check (membership in ('SILVER', 'GOLD', 'PLATINUM')),
  birthday date,
  lifestyle_chips text[] default '{}',
  cleaning_coupons int default 0,
  repair_vouchers int default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  serial text unique not null,
  registered_at date not null,
  store text,
  material text,
  color text,
  year int,
  cutout_image text,
  lifestyle_images text[] default '{}',
  care_score int default 90,
  repair_vouchers int default 0,
  cleaning_vouchers int default 0,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  tag text not null,
  image_url text not null,
  memo text,
  place text,
  created_at timestamptz default now()
);

create table if not exists repair_records (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title text not null,
  location text,
  thumbnail_url text,
  source text not null check (source in ('store', 'ai_custom')),
  found_at text,
  repaired_at date,
  created_at timestamptz default now()
);

create table if not exists leather_checks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  photo_url text not null,
  ai_summary text,
  created_at timestamptz default now()
);

create table if not exists ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  from_user uuid not null references profiles(id),
  to_email text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table stories enable row level security;
alter table repair_records enable row level security;
alter table leather_checks enable row level security;
alter table ownership_transfers enable row level security;

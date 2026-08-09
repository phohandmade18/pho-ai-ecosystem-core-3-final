-- PHỐ AI ECOSYSTEM CORE 4.0 - Sprint 2 Facebook Engine
-- Chạy sau schema-core4.sql

create table if not exists facebook_pages (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  page_name text not null,
  page_link text,
  fan_count bigint not null default 0,
  followers_count bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists facebook_posts (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  page_external_id text not null,
  message text,
  permalink_url text,
  created_time timestamptz,
  reactions_count bigint not null default 0,
  comments_count bigint not null default 0,
  shares_count bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create index if not exists idx_facebook_posts_page_time
  on facebook_posts(page_external_id, created_time desc);

alter table facebook_pages enable row level security;
alter table facebook_posts enable row level security;

-- Dữ liệu Facebook chỉ đi qua Netlify Functions.
-- Không tạo policy public/anon ghi trực tiếp từ browser.

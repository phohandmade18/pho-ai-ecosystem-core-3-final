-- PHỐ AI ECOSYSTEM CORE 4.0 - Sprint 1
-- Chạy trong Supabase SQL Editor.
-- Thiết kế idempotent ở mức tạo bảng/index/policy.

create extension if not exists pgcrypto;

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  topic text,
  platform text,
  content_type text,
  status text not null default 'draft',
  body text,
  metadata jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kpi_daily (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  account_id text,
  metric_date date not null default current_date,
  metrics jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists ai_history (
  id uuid primary key default gen_random_uuid(),
  feature text not null,
  model text,
  prompt_summary text,
  output_summary text,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text,
  level text not null default 'info',
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_items (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  content text not null,
  source text,
  item_type text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_items_status on content_items(status);
create index if not exists idx_content_items_scheduled_at on content_items(scheduled_at);
create index if not exists idx_kpi_daily_provider_date on kpi_daily(provider, metric_date desc);
create index if not exists idx_ai_history_created_at on ai_history(created_at desc);
create index if not exists idx_activity_logs_created_at on activity_logs(created_at desc);

alter table app_settings enable row level security;
alter table content_items enable row level security;
alter table kpi_daily enable row level security;
alter table ai_history enable row level security;
alter table activity_logs enable row level security;
alter table knowledge_items enable row level security;

-- CORE 4.0 hiện dùng Netlify Functions làm server boundary.
-- Không tạo policy public ghi dữ liệu trực tiếp từ browser.

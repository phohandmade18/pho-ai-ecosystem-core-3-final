-- PHỐ AI ECOSYSTEM CORE 2.7
-- Optional cloud layer for AI Knowledge Brain.
-- CORE 2.7 works locally without this migration. Run this only when you want cloud sync.

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  content text not null,
  source text default 'ChatGPT',
  item_type text default 'content',
  tags text[] default '{}',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_items_created_at_idx on public.knowledge_items(created_at desc);
create index if not exists knowledge_items_type_idx on public.knowledge_items(item_type);
create index if not exists knowledge_items_tags_idx on public.knowledge_items using gin(tags);

create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  memory_key text unique not null,
  memory_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_experiences (
  id uuid primary key default gen_random_uuid(),
  platform text,
  content_type text,
  topic text,
  content_ref text,
  metrics jsonb default '{}'::jsonb,
  evaluation text,
  lessons text,
  created_at timestamptz not null default now()
);

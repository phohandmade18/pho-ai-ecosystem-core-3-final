-- CORE 2.8 Learning Brain (optional cloud storage)
create table if not exists public.content_experiences (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  content_type text not null,
  topic text not null,
  posted_at timestamptz,
  post_time text,
  reach bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  views bigint default 0,
  clicks bigint default 0,
  user_rating int,
  lesson text,
  score numeric,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists content_experiences_platform_idx on public.content_experiences(platform);
create index if not exists content_experiences_type_idx on public.content_experiences(content_type);
create index if not exists content_experiences_created_idx on public.content_experiences(created_at desc);

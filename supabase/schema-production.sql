create extension if not exists pgcrypto;

create table if not exists oauth_states(
 id uuid primary key default gen_random_uuid(),
 provider text not null,
 state text not null unique,
 expires_at timestamptz not null,
 created_at timestamptz default now()
);
create table if not exists oauth_connections(
 id uuid primary key default gen_random_uuid(),
 provider text not null check(provider in('facebook','youtube')),
 external_id text not null,
 channel_name text,
 status text default 'connected',
 access_token_encrypted text not null,
 refresh_token_encrypted text,
 expires_at timestamptz,
 scopes text[],
 last_sync_at timestamptz,
 created_at timestamptz default now(),
 updated_at timestamptz default now(),
 unique(provider,external_id)
);
create table if not exists metric_snapshots(
 id uuid primary key default gen_random_uuid(),
 provider text not null,
 external_id text not null,
 channel_name text,
 captured_at timestamptz default now(),
 metrics jsonb not null,
 source text not null
);
create index if not exists metric_snapshots_provider_time on metric_snapshots(provider,captured_at desc);

create table if not exists strategy_findings(
 id uuid primary key default gen_random_uuid(),
 provider text not null,
 external_id text,
 finding_type text not null,
 severity text not null,
 title text,
 summary text,
 evidence jsonb default '{}'::jsonb,
 recommendation jsonb default '{}'::jsonb,
 status text default 'open',
 created_at timestamptz default now()
);
create table if not exists executive_briefs(
 id uuid primary key default gen_random_uuid(),
 content text not null,
 model text,
 source_snapshot_count integer default 0,
 created_at timestamptz default now()
);
create table if not exists ai_usage(
 id uuid primary key default gen_random_uuid(),
 task_type text not null,
 model text,
 input_tokens integer default 0,
 output_tokens integer default 0,
 estimated_cost_usd numeric(12,6) default 0,
 created_at timestamptz default now()
);
create table if not exists activity_logs(
 id uuid primary key default gen_random_uuid(),
 event_type text not null,
 status text not null,
 message text,
 metadata jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);

alter table oauth_states enable row level security;
alter table oauth_connections enable row level security;
alter table metric_snapshots enable row level security;
alter table strategy_findings enable row level security;
alter table executive_briefs enable row level security;
alter table ai_usage enable row level security;
alter table activity_logs enable row level security;
-- Không tạo public policy. Chỉ backend secret/service role được truy cập.

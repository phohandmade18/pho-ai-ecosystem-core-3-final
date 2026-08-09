create extension if not exists pgcrypto;
create table if not exists missions(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 target_value numeric,
 current_value numeric default 0,
 status text default 'active',
 created_at timestamptz default now()
);
create table if not exists executive_tasks(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 due_at timestamptz,
 priority text default 'medium',
 status text default 'open',
 created_at timestamptz default now()
);
create table if not exists strategy_findings(
 id uuid primary key default gen_random_uuid(),
 channel text,
 finding_type text,
 severity text,
 summary text,
 evidence jsonb default '{}'::jsonb,
 recommendation jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);
create table if not exists expert_opinions(
 id uuid primary key default gen_random_uuid(),
 expert_name text,
 topic text,
 opinion jsonb,
 created_at timestamptz default now()
);

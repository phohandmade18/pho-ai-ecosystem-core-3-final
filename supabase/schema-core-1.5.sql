create table if not exists strategy_memory(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 lesson text not null,
 evidence jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);
create table if not exists strategy_scenarios(
 id uuid primary key default gen_random_uuid(),
 scenario_type text not null,
 assumptions jsonb default '{}'::jsonb,
 result jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);
create table if not exists executive_meetings(
 id uuid primary key default gen_random_uuid(),
 meeting_type text default 'daily',
 notes text,
 decisions jsonb default '[]'::jsonb,
 created_at timestamptz default now()
);
create table if not exists workflows(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 schedule_expression text,
 steps jsonb default '[]'::jsonb,
 enabled boolean default true,
 created_at timestamptz default now()
);
create table if not exists strategy_timeline(
 id uuid primary key default gen_random_uuid(),
 event_type text not null,
 title text not null,
 result text,
 metadata jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);
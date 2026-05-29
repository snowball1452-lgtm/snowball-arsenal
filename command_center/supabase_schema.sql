-- SNOWBALL + APEX STUDIO — Supabase Schema
    -- Run in Supabase SQL Editor
    
    -- ── USERS ──────────────────────────────────────────────────────────────────
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      created_at timestamptz default now(),
      plan text default 'solo',  -- solo | studio | agency | enterprise
      stripe_customer_id text,
      timezone text default 'UTC'
    );
    
    -- ── SESSIONS ───────────────────────────────────────────────────────────────
    create table if not exists sessions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete cascade,
      created_at timestamptz default now(),
      last_active timestamptz default now(),
      compute_mode text default 'full'  -- full | solo | dark
    );
    
    -- ── PROJECTS ───────────────────────────────────────────────────────────────
    create table if not exists projects (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete cascade,
      name text not null,
      status text default 'active',    -- active | done | sunk
      health text default 'green',     -- green | amber | red
      weight float default 0.5,
      last_touched_at timestamptz default now(),
      created_at timestamptz default now(),
      why_resurfaced text,             -- dependency drift | health: amber | etc
      blake3_hash text                 -- provenance hash of last output
    );
    
    -- ── JOBS ───────────────────────────────────────────────────────────────────
    create table if not exists jobs (
      id uuid primary key default gen_random_uuid(),
      session_id uuid references sessions(id) on delete cascade,
      user_id uuid references users(id) on delete cascade,
      project_id uuid references projects(id) on delete set null,
      tool_name text not null,
      status text default 'queued',    -- queued | running | done | error
      result text,
      error text,
      intent text,
      created_at timestamptz default now(),
      finished_at timestamptz,
      duration_ms int,
      blake3_hash text
    );
    
    -- ── AGENT LOGS ─────────────────────────────────────────────────────────────
    create table if not exists agent_logs (
      id uuid primary key default gen_random_uuid(),
      job_id uuid references jobs(id) on delete cascade,
      agent_name text not null,
      action text not null,
      output text,
      tools_used text[],
      timestamp timestamptz default now(),
      blake3_hash text
    );
    
    -- ── SKILLS ─────────────────────────────────────────────────────────────────
    create table if not exists skills (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete cascade,
      name text not null,
      repo_url text,
      mode text default 'dormant',     -- live | compiled | dormant
      last_run_at timestamptz,
      success_rate float default 0,
      compiled_workflow jsonb,          -- saved replay workflow
      health text default 'green',
      created_at timestamptz default now()
    );
    
    -- ── MEMORY (conversation + graph) ──────────────────────────────────────────
    create table if not exists memory (
      id uuid primary key default gen_random_uuid(),
      session_id uuid references sessions(id) on delete cascade,
      role text not null,              -- user | assistant
      content text not null,
      intent text,
      tools_used text[],
      created_at timestamptz default now(),
      embedding vector(1536)           -- for semantic search (pgvector)
    );
    
    -- ── MEMORY GRAPH ───────────────────────────────────────────────────────────
    create table if not exists memory_graph_nodes (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete cascade,
      label text not null,
      type text not null,              -- project | agent | entity | dep
      created_at timestamptz default now()
    );
    
    create table if not exists memory_graph_edges (
      id uuid primary key default gen_random_uuid(),
      from_node uuid references memory_graph_nodes(id) on delete cascade,
      to_node uuid references memory_graph_nodes(id) on delete cascade,
      relation text not null,          -- depends_on | last_touched | owns | usually_checks
      confidence float default 1.0,
      note text,
      updated_at timestamptz default now()
    );
    
    -- ── PREFERENCES ────────────────────────────────────────────────────────────
    create table if not exists preferences (
      id uuid primary key default gen_random_uuid(),
      user_id uuid unique references users(id) on delete cascade,
      active_hours text default '9am-10pm',
      quiet_start text default '23:00',
      quiet_end text default '07:00',
      timezone text default 'UTC',
      quiet_explicit bool default false,
      style text default 'colleague',
      sentiment_score float default 0.8,
      last_user_spoke timestamptz,
      last_orb_spoke timestamptz,
      top_topics text[],
      check_patterns jsonb default '{}'
    );
    
    -- ── EXTERNAL SIGNALS ───────────────────────────────────────────────────────
    create table if not exists external_signals (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete cascade,
      source text not null,
      text text not null,
      signal_type text default 'info',  -- urgent | info
      ingested_at timestamptz default now(),
      acknowledged bool default false
    );
    
    -- ── HEALTH CHECKS ──────────────────────────────────────────────────────────
    create table if not exists health_checks (
      id uuid primary key default gen_random_uuid(),
      project_id uuid references projects(id) on delete cascade,
      status text not null,            -- green | amber | red
      reason text,
      checked_at timestamptz default now(),
      check_type text default 'active' -- active | sunk | dormant
    );
    
    -- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────────
    alter table users enable row level security;
    alter table sessions enable row level security;
    alter table projects enable row level security;
    alter table jobs enable row level security;
    alter table agent_logs enable row level security;
    alter table skills enable row level security;
    alter table memory enable row level security;
    alter table preferences enable row level security;
    
    -- Users can only see their own data
    create policy "Users see own data" on users for all using (auth.uid() = id);
    create policy "Sessions own" on sessions for all using (auth.uid() = user_id);
    create policy "Projects own" on projects for all using (auth.uid() = user_id);
    create policy "Jobs own" on jobs for all using (auth.uid() = user_id);
    create policy "Skills own" on skills for all using (auth.uid() = user_id);
    create policy "Memory own" on memory for all using (
      session_id in (select id from sessions where user_id = auth.uid())
    );
    create policy "Prefs own" on preferences for all using (auth.uid() = user_id);
    
    -- ── INDEXES ─────────────────────────────────────────────────────────────────
    create index if not exists idx_jobs_session on jobs(session_id);
    create index if not exists idx_jobs_status on jobs(status);
    create index if not exists idx_projects_user on projects(user_id);
    create index if not exists idx_memory_session on memory(session_id);
    create index if not exists idx_health_project on health_checks(project_id);
    
    -- Enable pgvector for semantic search
    create extension if not exists vector;
    
    -- ── WEIGHT CALCULATION FUNCTION ─────────────────────────────────────────────
    create or replace function calculate_project_weight(p_id uuid)
    returns float as $$
    declare
      agent_activity float := 0;
      dependency_health float := 0;
      recency_score float := 0;
      time_invested float := 0;
      last_job timestamptz;
      job_count int;
      hours_since float;
      health_status text;
    begin
      -- Agent activity score (0.40 weight)
      select count(*), max(created_at) into job_count, last_job
      from jobs where project_id = p_id and created_at > now() - interval '7 days';
      agent_activity := least(1.0, job_count / 10.0);
    
      -- Recency score (0.20 weight) — decays on curve
      if last_job is not null then
        hours_since := extract(epoch from (now() - last_job)) / 3600;
        recency_score := exp(-hours_since / 48.0);  -- 48hr half-life
      end if;
    
      -- Dependency health (0.30 weight)
      select status into health_status
      from health_checks where project_id = p_id
      order by checked_at desc limit 1;
      dependency_health := case
        when health_status = 'green' then 1.0
        when health_status = 'amber' then 0.6
        when health_status = 'red'   then 0.3
        else 0.5
      end;
    
      -- Time invested (0.10 weight) — normalized
      select count(*) into job_count from jobs where project_id = p_id;
      time_invested := least(1.0, job_count / 50.0);
    
      return (agent_activity * 0.40)
           + (dependency_health * 0.30)
           + (recency_score * 0.20)
           + (time_invested * 0.10);
    end;
    $$ language plpgsql;
    
    -- Comment: Mock weight calibration examples for frontend:
    -- HyperForge (active, 3 agents, last touch 2hr ago)  → 0.87
    -- Snowball Folio (1 agent, last touch 1 day)         → 0.61
    -- BrambleThundery (done, healthy, last touch 5 days) → 0.18
    
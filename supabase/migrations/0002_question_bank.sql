-- Pitch Presence Coach — question bank schema
-- Moves interview content out of src/data/interviewPacks.js into the database so it can
-- scale to many tracks/companies/prompts without code deploys and power a future admin /
-- crowdsource flow.
--
-- Hierarchy: tracks (interview modes) -> companies (interviewer targets) -> prompts.
-- Content is PUBLIC read (anyone, signed in or not, can browse the catalog). Writes are
-- restricted to the service role (used by the seed script), which bypasses RLS — so no
-- write policies are defined here on purpose.

-- ---- tracks: the interview modes (Startup Pitch, Campus Placement, HR / Behavioral, ...)
create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,            -- stable id used by the app (== interviewPacks key / mode title)
  label       text not null,
  category    text not null,                   -- picker grouping: Job Interviews | HR / Behavioral | Admissions | Pitch & Sales
  subtitle    text,
  focus       text,
  icon_key    text,                            -- maps to an SVG in src/data/trackIcons.jsx
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---- companies: interviewer targets within a track (YC Seed Partner, TCS NQT, ...)
create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  track_id      uuid not null references public.tracks (id) on delete cascade,
  slug          text not null,                 -- == target.id, unique within a track (e.g. 'yc-seed')
  name          text not null,
  style         text,
  source_basis  text,
  reference_links jsonb not null default '[]'::jsonb,  -- [{label, url}]
  focus         text,
  rubric        jsonb not null default '[]'::jsonb,    -- [{name, weights:{clarity,pace,energy,eyeContact,posture}}]
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (track_id, slug)
);

-- ---- prompts: sample problems under a company
create table if not exists public.prompts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  slug        text not null,                   -- == prompt.id, unique within a company
  title       text not null,
  text        text not null,
  answer_key  jsonb,                           -- optional {groups:[{label, terms:[]}]}; null => derived at runtime
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (company_id, slug)
);

create index if not exists companies_track_idx on public.companies (track_id, sort_order);
create index if not exists prompts_company_idx on public.prompts (company_id, sort_order);

-- ---- Row Level Security: public read-only catalog.
alter table public.tracks enable row level security;
alter table public.companies enable row level security;
alter table public.prompts enable row level security;

drop policy if exists "tracks_public_read" on public.tracks;
create policy "tracks_public_read" on public.tracks
  for select using (true);

drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read" on public.companies
  for select using (true);

drop policy if exists "prompts_public_read" on public.prompts;
create policy "prompts_public_read" on public.prompts
  for select using (true);

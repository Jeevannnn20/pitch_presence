-- Pitch Presence Coach — cloud history schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
--
-- Design notes:
--   * One row per practice attempt, owned by an auth.users id.
--   * Variable/nested parts (scores, fixes, summary) are jsonb to tolerate shape drift.
--   * The (user_id, fingerprint) unique index is what makes cross-device dedupe and
--     idempotent upserts work — the client already computes `fingerprint`.
--   * Row Level Security is the ONLY thing standing between the public anon key and
--     every student's data. It MUST be enabled with the policies below.

create table if not exists public.attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  client_id        text,                                   -- original client-side attempt.id
  created_at       timestamptz not null default now(),     -- maps attempt.createdAt
  mode             text,
  target_id        text,
  target_name      text,
  prompt_id        text,
  prompt_title     text,
  prompt_text      text,
  is_custom_prompt boolean not null default false,
  duration         numeric,
  overall_score    integer,
  rubric_score     integer,
  scores           jsonb not null default '{}'::jsonb,
  fixes            jsonb not null default '[]'::jsonb,
  verdict          text,
  summary          jsonb not null default '{}'::jsonb,      -- {wordCount, averageWpm, fillerCount, silenceGapCount}
  fingerprint      text not null
);

-- Cross-device dedupe + idempotent upserts (client upserts on onConflict: 'user_id,fingerprint').
create unique index if not exists attempts_user_fingerprint_uidx
  on public.attempts (user_id, fingerprint);

-- Fast newest-first history reads per user.
create index if not exists attempts_user_created_idx
  on public.attempts (user_id, created_at desc);

-- Row Level Security: a student can only touch their own rows.
alter table public.attempts enable row level security;

drop policy if exists "attempts_select_own" on public.attempts;
create policy "attempts_select_own" on public.attempts
  for select using (auth.uid() = user_id);

drop policy if exists "attempts_insert_own" on public.attempts;
create policy "attempts_insert_own" on public.attempts
  for insert with check (auth.uid() = user_id);

drop policy if exists "attempts_update_own" on public.attempts;
create policy "attempts_update_own" on public.attempts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "attempts_delete_own" on public.attempts;
create policy "attempts_delete_own" on public.attempts
  for delete using (auth.uid() = user_id);

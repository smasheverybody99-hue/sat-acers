-- SAT Acers update 2: vocabulary sync + leaderboard.
-- Supabase → SQL Editor → New query → paste this whole file and click "Run". Safe to run more than once.

-- 1) New columns for vocabulary progress and leaderboard settings
alter table public.user_data add column if not exists vocab jsonb;
alter table public.user_data add column if not exists profile jsonb;

-- 2) Leaderboard: one public row per player who chose to appear
create table if not exists public.leaderboard (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  display_name   text not null check (char_length(display_name) between 1 and 24),
  week_start     date not null,
  week_answered  integer not null default 0 check (week_answered between 0 and 5000),
  streak         integer not null default 0 check (streak between 0 and 3650),
  last_day       date,
  total_answered integer not null default 0 check (total_answered >= 0),
  updated_at     timestamptz not null default now()
);

create index if not exists leaderboard_week_idx on public.leaderboard (week_start, week_answered desc);
create index if not exists leaderboard_streak_idx on public.leaderboard (last_day, streak desc);

alter table public.leaderboard enable row level security;

-- Anyone can read the board; each player can only write their own row
drop policy if exists "leaderboard read" on public.leaderboard;
drop policy if exists "leaderboard own insert" on public.leaderboard;
drop policy if exists "leaderboard own update" on public.leaderboard;
drop policy if exists "leaderboard own delete" on public.leaderboard;

create policy "leaderboard read" on public.leaderboard
  for select using (true);

create policy "leaderboard own insert" on public.leaderboard
  for insert with check (auth.uid() = user_id);

create policy "leaderboard own update" on public.leaderboard
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "leaderboard own delete" on public.leaderboard
  for delete using (auth.uid() = user_id);

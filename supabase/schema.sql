-- Questboard daily activity schema for Supabase.
-- Run this in Supabase Dashboard > SQL Editor while signed into the project.

create table if not exists public.user_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  detail text not null default '',
  xp integer not null default 25 check (xp >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint user_quests_user_id_id_key unique (user_id, id)
);

create table if not exists public.quest_completions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  quest_id uuid not null,
  completed_on date not null default (timezone('Asia/Singapore', now())::date),
  completed_at timestamptz not null default now(),
  xp_awarded integer not null check (xp_awarded >= 0),
  constraint quest_completions_pkey primary key (user_id, quest_id, completed_on),
  constraint quest_completions_user_quest_fkey
    foreign key (user_id, quest_id)
    references public.user_quests (user_id, id)
    on delete cascade
);

create index if not exists quest_completions_user_date_idx
  on public.quest_completions (user_id, completed_on desc);

create table if not exists public.daily_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date date not null default (timezone('Asia/Singapore', now())::date),
  note text not null default '',
  updated_at timestamptz not null default now(),
  constraint daily_notes_pkey primary key (user_id, log_date)
);

alter table public.user_quests enable row level security;
alter table public.quest_completions enable row level security;
alter table public.daily_notes enable row level security;

drop policy if exists "Users can read their quests" on public.user_quests;
create policy "Users can read their quests"
  on public.user_quests for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their quests" on public.user_quests;
create policy "Users can create their quests"
  on public.user_quests for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can edit their quests" on public.user_quests;
create policy "Users can edit their quests"
  on public.user_quests for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their quests" on public.user_quests;
create policy "Users can remove their quests"
  on public.user_quests for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their completions" on public.quest_completions;
create policy "Users can read their completions"
  on public.quest_completions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their daily notes" on public.daily_notes;
create policy "Users can read their daily notes"
  on public.daily_notes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their daily notes" on public.daily_notes;
create policy "Users can create their daily notes"
  on public.daily_notes for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can edit their daily notes" on public.daily_notes;
create policy "Users can edit their daily notes"
  on public.daily_notes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their daily notes" on public.daily_notes;
create policy "Users can remove their daily notes"
  on public.daily_notes for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_quests to authenticated;
grant select on public.quest_completions to authenticated;
grant select, insert, update, delete on public.daily_notes to authenticated;

-- Records a quest once per Singapore calendar day. The composite primary key
-- makes duplicate clicks harmless, and XP is read from the saved quest record.
create or replace function public.complete_daily_quest(p_quest_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_rows integer;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'You must be signed in to complete a quest.';
  end if;

  insert into public.quest_completions (user_id, quest_id, completed_on, xp_awarded)
  select current_user_id, quest.id, timezone('Asia/Singapore', now())::date, quest.xp
  from public.user_quests as quest
  where quest.id = p_quest_id
    and quest.user_id = current_user_id
    and quest.is_active
  on conflict (user_id, quest_id, completed_on) do nothing;

  get diagnostics inserted_rows = row_count;
  return inserted_rows = 1;
end;
$$;

revoke all on function public.complete_daily_quest(uuid) from public, anon;
grant execute on function public.complete_daily_quest(uuid) to authenticated;

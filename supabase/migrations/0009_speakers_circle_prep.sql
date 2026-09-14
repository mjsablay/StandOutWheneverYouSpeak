-- Speakers' Circle preparation and Katya sessions.
--
-- WHY
-- Barry's Katya context prompt (1 September 2026) has the platform supply the
-- learner's Frame and Masterful Notes to the coach at the start of a session,
-- so she never asks for what she already has and never pretends to see what
-- she does not. This is where that material lives: one row per member per
-- topic, written by the member in the topic workspace and read by the server
-- when it assembles Katya's instructions.

create table if not exists public.practice_prep (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  topic_id   text not null,
  -- Audience, situation and objective, in the member's words. Katya needs
  -- this before she can judge a Frame; capturing it here saves live minutes.
  audience   text check (audience is null or length(audience) <= 400),
  -- The Presentation Pyramid: Headline, What/Why/How, Evidence, Close.
  frame      text check (frame is null or length(frame) <= 8000),
  -- Masterful Notes, indentation preserved exactly as typed. The platform
  -- supplies text, not fonts or spacing, and tells Katya so.
  notes      text check (notes is null or length(notes) <= 12000),
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

comment on table public.practice_prep is
  'A member''s preparation for one Speakers'' Circle topic: audience and situation, Frame (Presentation Pyramid) and Masterful Notes. Supplied to Katya at the start of a session.';
comment on column public.practice_prep.topic_id is
  'lib/topics.ts id, e.g. a-3, or self-introduction.';

alter table public.practice_prep enable row level security;

create policy "members manage own prep" on public.practice_prep
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "admins read prep" on public.practice_prep
  for select to authenticated
  using (private.is_admin());

create or replace function public.touch_practice_prep()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_practice_prep() from public, anon, authenticated;

drop trigger if exists touch_practice_prep on public.practice_prep;
create trigger touch_practice_prep
  before update on public.practice_prep
  for each row execute function public.touch_practice_prep();

-- ---------------------------------------------------------------------------
-- Sessions: which topic, which of Barry's three modes, over which channel,
-- and how long. lesson_id points at an empty table and is kept only for
-- compatibility, exactly as with points_ledger.

alter table public.practice_sessions
  add column if not exists topic_id text,
  add column if not exists mode text
    check (mode is null or mode in ('frame', 'notes', 'delivery')),
  add column if not exists channel text not null default 'text'
    check (channel in ('text', 'voice')),
  add column if not exists duration_seconds integer
    check (duration_seconds is null or duration_seconds >= 0),
  add column if not exists model text,
  add column if not exists ended_reason text,
  -- Katya's last line of the session. Supplied to her next session on the
  -- same topic so she can pick up where the member left off.
  add column if not exists closing text;

comment on column public.practice_sessions.topic_id is
  'Speakers'' Circle topic (lib/topics.ts id). lesson_id points at an empty table and is kept only for compatibility.';
comment on column public.practice_sessions.mode is
  'Barry''s three coaching modes: frame (Coach My Frame), notes (Review My Masterful Notes), delivery (Coach My Delivery).';

-- Sessions are written by the server after the session ends, never by the
-- browser. A client that can insert its own rows can insert its own scores.
drop policy if exists "users insert own practice sessions" on public.practice_sessions;

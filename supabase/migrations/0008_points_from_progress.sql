-- Points that are actually awarded.
--
-- WHAT WAS WRONG
-- The lesson page said "Watched · +50 points", the leaderboard listed eight
-- ways to earn points, and the FAQ promised streak bonuses — and nothing in
-- the codebase ever wrote a row to points_ledger. Zero rows, ever. A member
-- marked a lesson watched and their score never moved.
--
-- HOW IT WORKS NOW
-- member_progress is what the browser writes (watched, quiz_passed). This
-- trigger turns those transitions into ledger rows, so points are awarded
-- in the database rather than trusted from the client — a member can flip
-- `watched` on and off all day and is paid exactly once, because the ledger
-- carries the slug and a unique index refuses the second award.

alter table public.points_ledger
  add column if not exists course_slug text,
  add column if not exists lesson_slug text;

comment on column public.points_ledger.lesson_slug is
  'Which lesson earned it. Lessons live in code and are addressed by slug; lesson_id points at an empty table and is kept only for compatibility.';

-- One award per (member, action, lesson). The partial index leaves room for
-- awards that are not about a lesson at all — events, streaks — later.
create unique index if not exists points_ledger_once_per_lesson
  on public.points_ledger (user_id, action, course_slug, lesson_slug)
  where lesson_slug is not null;

create or replace function public.award_progress_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Watching a lesson: 50, the first time watched becomes true.
  if new.watched and (tg_op = 'INSERT' or not coalesce(old.watched, false)) then
    insert into public.points_ledger (user_id, action, points, course_slug, lesson_slug)
    values (new.user_id, 'lesson_watched', 50, new.course_slug, new.lesson_slug)
    on conflict do nothing;
  end if;

  -- Passing the quiz: 25, the first time quiz_passed becomes true.
  if new.quiz_passed and (tg_op = 'INSERT' or not coalesce(old.quiz_passed, false)) then
    insert into public.points_ledger (user_id, action, points, course_slug, lesson_slug)
    values (new.user_id, 'quiz_passed', 25, new.course_slug, new.lesson_slug)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- A trigger function needs no EXECUTE grant to fire; the default grant to
-- PUBLIC only exposes it over PostgREST, where it has no trigger context.
revoke all on function public.award_progress_points() from public, anon, authenticated;

drop trigger if exists award_progress_points on public.member_progress;
create trigger award_progress_points
  after insert or update on public.member_progress
  for each row execute function public.award_progress_points();

comment on function public.award_progress_points() is
  'Turns member_progress transitions (watched, quiz_passed) into points_ledger rows, once per lesson each.';

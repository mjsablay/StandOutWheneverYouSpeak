-- A record of who changed whose permissions.
--
-- WHY
-- When the privilege-escalation hole was found (migration 0010), the obvious
-- next question was "did anyone use it?" — and it could not be answered.
-- Nothing recorded changes to role, tier or status, so the honest report was
-- "no evidence it happened", which is not the same as "it didn't".
--
-- That gap matters more now than it did. `tier` is what Stripe's webhook
-- writes, so an unexplained tier change is no longer only a security
-- question, it is a revenue one: someone holding a paid membership without a
-- paid subscription behind it.
--
-- WHERE IT LIVES
-- In the `private` schema, which PostgREST does not expose, so there is no
-- REST endpoint for it at any permission level. Admins read it through a
-- SECURITY DEFINER function that gates on private.is_admin(), the same shape
-- as admin_waitlist(). Nothing may update or delete a row: an audit trail
-- that its subject can edit is decoration.

create table if not exists private.privilege_changes (
  id          bigint generated always as identity primary key,
  changed_at  timestamptz not null default now(),
  -- Whose permissions changed.
  profile_id  uuid not null,
  -- Who changed them. Null when the actor was the service role (the Stripe
  -- webhook, the invite route) or a migration, which have no auth.uid().
  actor_id    uuid,
  -- The database role that made the change: authenticated, service_role,
  -- postgres. This is what separates "an admin did it in the console" from
  -- "the payment webhook did it" from "someone ran SQL".
  actor_role  text not null,
  before      jsonb not null,
  after       jsonb not null
);

comment on table private.privilege_changes is
  'Append-only record of changes to profiles.role, .tier and .status. Read by admins through public.admin_privilege_changes(); never exposed over REST.';

create index if not exists privilege_changes_profile_idx
  on private.privilege_changes (profile_id, changed_at desc);

create index if not exists privilege_changes_recent_idx
  on private.privilege_changes (changed_at desc);

-- ---------------------------------------------------------------------------
-- The recorder. AFTER UPDATE, so it only ever sees changes that actually
-- happened — guard_profile_privileges() has already rejected the rest.

create or replace function private.record_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  claims text;
  who    text;
begin
  if new.role   is not distinct from old.role
 and new.tier   is not distinct from old.tier
 and new.status is not distinct from old.status
  then
    return null;
  end if;

  -- NOT current_user. This function is SECURITY DEFINER, so inside it
  -- current_user is the function's owner (postgres) no matter who called —
  -- which would record every change as an anonymous superuser and make the
  -- log worthless. PostgREST puts the caller's real role in the JWT claims,
  -- so that is the answer; session_user is the fallback for direct SQL,
  -- where there are no claims.
  claims := current_setting('request.jwt.claims', true);
  if claims is not null and claims <> '' then
    begin
      who := claims::jsonb ->> 'role';
    exception when others then
      who := null;
    end;
  end if;

  insert into private.privilege_changes
    (profile_id, actor_id, actor_role, before, after)
  values (
    new.id,
    (select auth.uid()),
    coalesce(nullif(who, ''), session_user),
    jsonb_build_object('role', old.role, 'tier', old.tier, 'status', old.status),
    jsonb_build_object('role', new.role, 'tier', new.tier, 'status', new.status)
  );

  return null;  -- AFTER trigger; the return value is ignored
end;
$$;

revoke all on function private.record_privilege_change() from public, anon, authenticated;

drop trigger if exists record_privilege_change on public.profiles;
create trigger record_privilege_change
  after update on public.profiles
  for each row execute function private.record_privilege_change();

-- ---------------------------------------------------------------------------
-- How an admin reads it. Returns nothing at all to anyone else, the same way
-- admin_waitlist() does — the gate is the final WHERE, so a non-admin gets an
-- empty set rather than an error that confirms the table exists.

create or replace function public.admin_privilege_changes(limit_to int default 100)
returns table (
  changed_at    timestamptz,
  subject_email text,
  subject_name  text,
  actor_email   text,
  actor_role    text,
  before        jsonb,
  after         jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.changed_at,
    subject.email,
    subject.display_name,
    actor.email,
    c.actor_role,
    c.before,
    c.after
  from private.privilege_changes c
  join public.profiles subject on subject.id = c.profile_id
  left join public.profiles actor on actor.id = c.actor_id
  where private.is_admin()
  order by c.changed_at desc
  limit greatest(1, least(coalesce(limit_to, 100), 500));
$$;

comment on function public.admin_privilege_changes(int) is
  'Recent changes to role, tier and status, newest first. Returns an empty set to anyone who is not an administrator.';

revoke all on function public.admin_privilege_changes(int) from public, anon;
grant execute on function public.admin_privilege_changes(int) to authenticated;

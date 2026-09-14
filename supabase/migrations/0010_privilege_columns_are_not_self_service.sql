-- Privilege columns are not self-service.
--
-- WHAT WAS WRONG
-- `authenticated` held UPDATE on *every* column of public.profiles, and the
-- "users update own profile" policy lets a member update their own row. Row
-- level security cannot restrict columns, so the two together meant a member
-- could rewrite their own role, tier and status. One statement, from the
-- browser, with the publishable key that ships inside the page:
--
--   update profiles set role='admin', tier='circle', status='approved'
--    where id = auth.uid();
--
-- Verified against this database (inside a transaction, rolled back): a
-- *declined* free member promoted themselves to an approved administrator on
-- the paid tier. That is the whole product given away — every lesson and
-- every coaching session without paying, and through private.is_admin(),
-- every other member's email address, everything applicants wrote on the
-- waitlist form, the inbound meeting requests, the power to approve and
-- decline accounts, and edit rights on the public About page.
--
-- HOW IT WORKS NOW
-- A BEFORE UPDATE trigger refuses any change to a privileged column unless
-- the caller is an administrator or the service role. Values that are merely
-- resent unchanged are fine, so ordinary profile edits are unaffected.
--
-- WHY A TRIGGER AND NOT COLUMN GRANTS
-- Revoking the columns from `authenticated` was the obvious alternative and
-- is wrong here: administrators are `authenticated` too, and the admin
-- console changes tier, role and status straight from the browser. Revoking
-- the grant would take the capability away from the very people who are
-- meant to have it — the same trap that broke sign-in completely when
-- EXECUTE was revoked on private.is_admin() to quiet a security advisor.

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Our own server acting deliberately: the invite route, the admin API
  -- routes, and the Stripe webhook that will own `tier`. Not reachable with
  -- a publishable key.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  -- An administrator, through the admin console.
  if private.is_admin() then
    return new;
  end if;

  if new.role               is distinct from old.role
  or new.tier               is distinct from old.tier
  or new.status             is distinct from old.status
  or new.approved_at        is distinct from old.approved_at
  or new.approved_by        is distinct from old.approved_by
  or new.waitlist_note      is distinct from old.waitlist_note
  or new.stripe_customer_id is distinct from old.stripe_customer_id
  or new.id                 is distinct from old.id
  or new.email              is distinct from old.email
  or new.created_at         is distinct from old.created_at
  then
    raise exception
      'Permission denied: role, tier, status and billing fields are set by an administrator, not by the account holder.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.guard_profile_privileges() is
  'Refuses member edits to the columns that decide permission (role), payment (tier, stripe_customer_id) and the waitlist gate (status). Administrators and the service role pass through.';

-- A trigger function needs no EXECUTE grant to fire; the default grant to
-- PUBLIC only exposes it over PostgREST, where it has no trigger context.
revoke all on function public.guard_profile_privileges() from public, anon, authenticated;

drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- ---------------------------------------------------------------------------
-- The same flaw, smaller: joining a conversation you were never in.
--
-- "members add participants" asked only that the caller be approved, so any
-- approved member could insert themselves into ANY conversation id and then
-- read the thread, because the messages policy trusts
-- private.in_conversation(). Nobody has sent a message yet, so nothing has
-- leaked — but the direct-message feature must not open with this in it.
--
-- You may now add someone to a conversation only if you created it or are
-- already in it. Administrators keep their own blanket policy, which is what
-- seeds the demo threads in the admin console.

drop policy if exists "members add participants" on public.conversation_participants;

create policy "members add participants" on public.conversation_participants
  for insert to authenticated
  with check (
    private.is_approved()
    and (
      exists (
        select 1 from public.conversations c
        where c.id = conversation_id
          and c.created_by = (select auth.uid())
      )
      or private.in_conversation(conversation_id)
    )
  );

-- And the UPDATE half of it: "participants update own read state" checks only
-- that the row is yours, which held true while you moved that row to someone
-- else's conversation. Read state is the one thing a member legitimately
-- writes here, so grant exactly that column. No admin path updates this
-- table, so narrowing the grant costs nothing.
revoke update on public.conversation_participants from authenticated;
grant update (last_read_at) on public.conversation_participants to authenticated;

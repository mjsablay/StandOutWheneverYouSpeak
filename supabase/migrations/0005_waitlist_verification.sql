-- Waitlist verification signals.
--
-- WHY THIS EXISTS
-- The waitlist filled with 189 accounts in two weeks and there was no way to
-- tell a person from a script. The missing information all lives in
-- auth.users, which PostgREST does not expose: which provider someone signed
-- up through, whether they ever confirmed, and whether a session was ever
-- created for them.
--
-- The important subtlety: a confirmed email address is NOT evidence of a
-- human. Corporate mail security (Proofpoint, Mimecast, Defender) opens every
-- link in every message to scan it, and opening a magic link confirms the
-- address. That is why `link_opened` is its own level below `signed_in` --
-- treating it as verified is exactly the mistake that made 189 look real.
--
-- WHY A FUNCTION AND NOT A VIEW
-- A view over auth.users in the public schema trips two of Supabase's own
-- security lints (auth_users_exposed, security_definer_view), because the
-- linter cannot see that the body filters on is_admin(). A SECURITY DEFINER
-- function granted only to `authenticated` reaches the same data, leaves
-- nothing selectable by `anon`, and keeps the advisor board clean -- which
-- matters, because a board full of errors you have learned to ignore is how a
-- real one gets missed.

drop view if exists public.admin_waitlist;

create or replace function public.admin_waitlist()
returns table (
  id uuid,
  email text,
  display_name text,
  avatar_url text,
  status text,
  role text,
  tier text,
  signed_up_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  provider text,
  verification text,
  automation_signals text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  with normalised as (
    select
      u.id,
      lower(split_part(u.email, '@', 2)) as domain,
      split_part(u.email, '@', 1) as local_part,
      -- Gmail ignores dots and +tags, so these all reach one mailbox.
      case
        when lower(split_part(u.email, '@', 2)) in ('gmail.com', 'googlemail.com')
          then replace(split_part(lower(split_part(u.email, '@', 1)), '+', 1), '.', '')
        else split_part(lower(split_part(u.email, '@', 1)), '+', 1)
      end || '@' || lower(split_part(u.email, '@', 2)) as mailbox
    from auth.users u
  ),
  mailbox_counts as (
    select mailbox, count(*) as n from normalised group by mailbox
  )
  select
    p.id,
    p.email,
    p.display_name,
    p.avatar_url,
    p.status::text,
    p.role::text,
    p.tier::text,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    coalesce(u.raw_app_meta_data ->> 'provider', 'email'),

    -- The ladder. Only the top two mean a human demonstrably held the account.
    case
      when coalesce(u.raw_app_meta_data ->> 'provider', 'email') <> 'email'
        then 'oauth'         -- identity proven by Google/Microsoft/LinkedIn
      when u.last_sign_in_at is not null
        then 'signed_in'     -- a session was created; someone arrived
      when u.email_confirmed_at is not null
        then 'link_opened'   -- address exists, but very likely a mail scanner
      else 'unverified'      -- nothing but a string someone typed in a form
    end,

    -- Cheap heuristics, shown to the admin as reasons rather than acted on.
    array_remove(array[
      case when n.domain in ('gmail.com', 'googlemail.com')
            and length(n.local_part) - length(replace(n.local_part, '.', '')) >= 3
           then 'scattered dots in a Gmail address' end,
      case when mc.n > 1
           then 'same mailbox as another signup' end,
      case when n.local_part ~ '[0-9]{4,}$'
           then 'long run of digits' end,
      case when length(n.local_part) > 24
           then 'unusually long address' end
    ], null)

  from public.profiles p
  join auth.users u      on u.id = p.id
  join normalised n      on n.id = p.id
  join mailbox_counts mc on mc.mailbox = n.mailbox
  where private.is_admin();   -- a non-admin caller gets an empty set
$$;

comment on function public.admin_waitlist() is
  'Admin-only. Signup provenance for every account, joined from auth.users. '
  'verification = oauth | signed_in | link_opened | unverified. link_opened is '
  'NOT proof of a person: mail scanners open links automatically.';

-- DO NOT "FIX" THE REMAINING ADVISOR WARNING BY REVOKING THIS.
-- Supabase warns that a signed-in user can call a SECURITY DEFINER function.
-- That is the point: the admin console calls it as `authenticated`, and the
-- body returns nothing unless private.is_admin() is true. Revoking EXECUTE
-- here breaks the waitlist screen the same way revoking EXECUTE on
-- private.is_admin() once broke sign-in.
revoke all on function public.admin_waitlist() from public, anon;
grant execute on function public.admin_waitlist() to authenticated;

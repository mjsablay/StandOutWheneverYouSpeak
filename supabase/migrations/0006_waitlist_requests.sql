-- A waitlist request is a form submission, not an account.
--
-- WHAT WAS WRONG BEFORE
-- "Request your place" called signInWithOtp, so expressing interest created a
-- real auth user, fired a magic-link email, and told us nothing about the
-- person beyond an address. That is how 189 unusable accounts and 189 emails
-- to scraped addresses happened. Three things were conflated: wanting in,
-- proving the address is yours, and having an account.
--
-- HOW IT WORKS NOW
--   1. Someone fills in the request form. A row lands here. No account is
--      created and we send them nothing, so a script gets nothing worth
--      having and our sending reputation is never spent on a stranger.
--   2. Tori reads the answers and decides. The form asks what they want to
--      work on and where they speak, which is both the qualification signal
--      and the thing no bot fills in convincingly.
--   3. Approving sends a Supabase invite. Accepting it is the first time an
--      auth user exists, and it only ever exists for someone who was chosen.
--   4. The trigger below links the new profile back to the request and
--      carries the details across, so nobody types their name twice.

create table if not exists public.waitlist_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Who they are
  email        text not null check (length(email) between 5 and 200 and position('@' in email) > 1),
  first_name   text not null check (length(first_name) between 1 and 50),
  last_name    text not null check (length(last_name)  between 1 and 50),
  context      text not null check (context in ('student','professional','leader','educator','other')),
  organisation text check (organisation is null or length(organisation) <= 80),
  role_title   text check (role_title   is null or length(role_title)   <= 80),
  location     text check (location     is null or length(location)     <= 80),
  linkedin_url text check (linkedin_url is null or length(linkedin_url) <= 200),

  -- What they want. `goal` is the field that tells Tori whether to approve.
  course_interest    text not null check (course_interest in ('leadership','campus','both','unsure')),
  goal               text not null check (length(goal) between 10 and 600),
  speaking_frequency text check (speaking_frequency is null or speaking_frequency in ('rarely','few_times_year','monthly','weekly','daily')),
  referral           text check (referral is null or length(referral) <= 120),

  -- Workflow
  status            text not null default 'new'
                      check (status in ('new','invited','joined','declined')),
  invited_at        timestamptz,
  reviewed_by       uuid references public.profiles(id) on delete set null,
  joined_profile_id uuid references public.profiles(id) on delete set null,
  notes             text check (notes is null or length(notes) <= 1000)
);

comment on table public.waitlist_requests is
  'Interest in joining, captured before any account exists. Approving one sends an invite; accepting the invite is what creates the auth user.';

-- One request per address, however it was capitalised.
create unique index if not exists waitlist_requests_email_key
  on public.waitlist_requests (lower(email));

create index if not exists waitlist_requests_status_idx
  on public.waitlist_requests (status, created_at desc);

alter table public.waitlist_requests enable row level security;

-- Anyone may ASK. Nobody but an admin may look, and the columns that drive
-- the workflow cannot be set by the person filling in the form — otherwise a
-- request could arrive pre-marked as 'joined'.
drop policy if exists "anyone may submit a request" on public.waitlist_requests;
create policy "anyone may submit a request"
  on public.waitlist_requests for insert
  to anon, authenticated
  with check (
    status = 'new'
    and invited_at is null
    and reviewed_by is null
    and joined_profile_id is null
    and notes is null
  );

drop policy if exists "admins read requests" on public.waitlist_requests;
create policy "admins read requests"
  on public.waitlist_requests for select
  to authenticated
  using (private.is_admin());

drop policy if exists "admins update requests" on public.waitlist_requests;
create policy "admins update requests"
  on public.waitlist_requests for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "admins delete requests" on public.waitlist_requests;
create policy "admins delete requests"
  on public.waitlist_requests for delete
  to authenticated
  using (private.is_admin());

-- Deliberately NO select policy for anon: without one, the form can post a
-- request but nobody can read the list back out, so the table can't be used
-- to harvest the addresses of everyone who has signed up.

-- ---------------------------------------------------------------------
-- Joining up: when an invited person creates their profile, match them to
-- their request, carry their answers across, and let them straight in.
-- Being invited IS approval in this model — Tori already decided.
-- ---------------------------------------------------------------------
create or replace function public.link_waitlist_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  req public.waitlist_requests%rowtype;
begin
  select * into req
  from public.waitlist_requests
  where lower(email) = lower(new.email)
    and status in ('new', 'invited')
  limit 1;

  if not found then
    return new;
  end if;

  update public.profiles set
    first_name   = coalesce(nullif(new.first_name, ''), req.first_name),
    last_name    = coalesce(nullif(new.last_name, ''),  req.last_name),
    school       = case when req.context = 'student' then coalesce(new.school, req.organisation) else new.school end,
    company      = case when req.context <> 'student' then coalesce(new.company, req.organisation) else new.company end,
    job_title    = coalesce(new.job_title, req.role_title),
    location     = coalesce(new.location, req.location),
    linkedin_url = coalesce(new.linkedin_url, req.linkedin_url),
    status       = 'approved',
    approved_at  = coalesce(new.approved_at, now())
  where id = new.id;

  update public.waitlist_requests
  set status = 'joined',
      joined_profile_id = new.id
  where id = req.id;

  return new;
end;
$$;

drop trigger if exists link_waitlist_request on public.profiles;
create trigger link_waitlist_request
  after insert on public.profiles
  for each row execute function public.link_waitlist_request();

comment on function public.link_waitlist_request() is
  'Matches a brand-new profile to its waitlist request by email, copies the answers across, and marks the profile approved - an invite was already a decision.';

-- A trigger function needs no EXECUTE grant for its trigger to fire. The
-- default grant to PUBLIC only makes it callable over PostgREST as
-- /rest/v1/rpc/link_waitlist_request, where it has no trigger context and
-- nothing good can come of it. Supabase's linter flags exactly this.
revoke all on function public.link_waitlist_request() from public, anon, authenticated;

-- Stripe billing.
--
-- The subscriptions table already existed from the original schema but had
-- never been written to. This fills in what the billing page needs to say
-- something true, and makes sure only the server can write any of it.
--
-- WHO MAY WRITE WHAT
-- Nothing here is client-writable. `subscriptions` has one SELECT policy and
-- no INSERT/UPDATE/DELETE policy at all, so PostgREST refuses writes from a
-- browser; the webhook writes with the service role, which bypasses RLS.
-- `profiles.tier` is guarded by migration 0010's trigger, which lets the
-- service role through and nobody else. Between the two, the only way to
-- become a paying member is for Stripe to tell us so.

alter table public.subscriptions
  -- Which Price they are on. Lets us tell a grandfathered member from a
  -- current one when the price changes, without asking Stripe.
  add column if not exists price_id text,
  -- Set when someone cancels: they keep access until current_period_end,
  -- and the account page needs to say that rather than "Active".
  add column if not exists cancel_at_period_end boolean not null default false,
  -- Mirrors profiles.stripe_customer_id; kept here too so a subscription row
  -- is self-describing when read on its own.
  add column if not exists stripe_customer_id text;

comment on table public.subscriptions is
  'One row per member per Stripe subscription. Written only by the Stripe webhook using the service role — never by the browser. profiles.tier is the entitlement every gate reads; this table is the evidence behind it.';

comment on column public.subscriptions.status is
  'Stripe subscription status verbatim. active and trialing mean entitled; see ENTITLED_STATUSES in lib/pricing.ts.';

comment on column public.subscriptions.cancel_at_period_end is
  'They have cancelled but the period is not over. Status stays active until it is.';

-- The webhook arrives knowing only the Stripe customer id and has to find
-- the member from it. Without this it is a sequential scan of every profile
-- on every billing event.
create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

-- Belt and braces: assert the table really has no client write path. If a
-- future migration adds one by accident this fails loudly at deploy time
-- rather than quietly letting a member insert themselves an active plan.
do $$
declare n int;
begin
  select count(*) into n
    from pg_policies
   where schemaname = 'public'
     and tablename = 'subscriptions'
     and cmd <> 'SELECT';
  if n > 0 then
    raise exception
      'subscriptions has % non-SELECT policy/policies; billing rows must be written only by the service role', n;
  end if;
end $$;

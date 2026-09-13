@AGENTS.md

# Stand Out Whenever You Speak

A Circle.so-style learning platform for public speaking. Built by Tori with
Barry Kuntz (executive speaking coach, Black Isle Consultants), who supplies
the teaching method and the video lessons.

Live at standoutwheneveryouspeak.com (Vercel). Repo:
`mjsablay/StandOutWheneverYouSpeak`.

## Working with Tori

**She is new to coding.** Explain what a command does and what success looks
like before she runs it, and distinguish warnings from errors. She reviews
visually and reports problems in plain language ("the spacing is off", "that
makes no sense") — translate that into the underlying cause rather than asking
her for specifics.

**She has asked that changes arrive as pull requests**, not as lists of git
commands for her to run. Branch, commit, push, and open the PR yourself. Write
the PR description too — she shouldn't have to compose any of it.

## Stack

Next.js 16.2.11 (App Router, Turbopack) · React 19.2.4 · TypeScript ·
Tailwind CSS v4 · Supabase (Postgres, Auth, Storage, RLS) · Vercel ·
lucide-react for icons.

**No emojis anywhere in the UI.** Tori rejected them as unprofessional. Use
lucide icons, including for check marks and the mobile menu.

Brand colours: dark blue `#1D4F91`, green `#6CC24A`, grey `#E8E8E8`, white.

## Things that will surprise you

**`lib/mock-auth.tsx` is real Supabase auth.** The filename is a leftover from
the prototype. It was kept to avoid churning imports across ~20 files. Do not
"fix" it by assuming it's a stub.

**`is_admin()` and `has_full_access()` live in the `private` schema.** They
were moved there so PostgREST doesn't expose them. RLS policies call them, and
policy expressions run as the *calling* role — so `authenticated` must keep
EXECUTE on them. Revoking that to silence a security advisor broke sign-in
completely with a redirect loop. Don't repeat it.

**Anonymous visitors have no access to `profiles` at all.** Public About-page
content (founder bios, photos, LinkedIn) lives in the `site_content` table
instead. Column-level grants through a `security_invoker` view were not
sufficient. Test public pages with `SET LOCAL ROLE anon`.

**A confirmed email address is not a person.** Corporate mail security
(Proofpoint, Mimecast, Defender) opens every link in every message to scan it,
and opening a magic link marks the address confirmed in `auth.users`. 29 of the
189 waitlist entries were "confirmed" this way and no human ever arrived. The
signal that means something is `last_sign_in_at`, or an OAuth provider on the
account. The `admin_waitlist()` function ranks both.

**`PRELAUNCH` in `lib/site.ts` is the launch switch.** While true, `middleware.ts`
keeps everyone except admins on the waitlist home, About and Contact. Flip it
to go live.

**`FREE_PREVIEW_COUNT = 7` covers lessons 01–06** because lesson 5 is split
into 5A and 5B.

**Lesson videos are git-ignored** (10 MP4s, 1.13 GB — over GitHub's file
limit). They play from `public/videos` locally and resolve against
`NEXT_PUBLIC_VIDEO_BASE_URL` in production, which is **not set**, so in
production every lesson video 404s.

**They do not fit the Supabase free tier, and the plan that says to put them
there is wrong.** Free allows 1 GB of storage — the recordings are 1.13 GB —
and 5 GB of egress a month, while one member watching the whole course pulls
1.13 GB. That is about four members a month. All ten are 1080p at 2.0-4.4
Mbps, roughly 2.7 Mbps average for talking-head footage, so compressing to
around 1.2 Mbps would more than halve both numbers. `avconvert` (built into
macOS) cannot do this — it ignores the target and can produce files *larger*
than the source. It needs ffmpeg.

## Permissions — three independent axes

| Column | Values | Means |
|---|---|---|
| `role` | `admin` \| `member` | what you may **do** |
| `tier` | `free` \| `circle` | what you **paid for** |
| `status` | `pending` \| `approved` \| `declined` | the waitlist gate |

Never collapse these. An admin on the free tier still sees everything; an
approved free member does not.

`lib/access.ts` is the single source of truth for UI gating and honours the
admin "View As" preview. Use `useAccess()`, not raw `useAuth()`, for anything
that shows or hides content.

## Key files

- `lib/site.ts` — site copy, nav, FAQs, `PRELAUNCH`
- `lib/courses.ts` — 15 Leadership Voice + 10 Campus Voice lessons, Barry's
  four-category rubric, scoring bands
- `lib/quizzes.ts` — 100 questions extracted from Barry's Word documents
- `lib/access.ts` / `lib/mock-auth.tsx` / `lib/view-as.tsx` — gating, auth,
  and the admin preview state
- `lib/content.ts` — the `site_content` table; editable from the admin
  console, and public by definition — never put private data in it
- `lib/directory.ts` — the `member_directory` view (real members only)
- `lib/waitlist-request.ts` — the request shape and its option lists, shared
  by the form, the API route and the admin screen. Every list here is mirrored
  by a CHECK constraint in the migration; change both
- `app/request/` / `app/api/waitlist/` / `app/admin/Requests.tsx` — ask,
  store, review
- `lib/waitlist.ts` / `app/admin/Waitlist.tsx` — the `admin_waitlist()`
  function and triage screen: how each account signed up and whether anyone
  ever used it. It is a SECURITY DEFINER function, not a view, so `auth.users`
  is never selectable from the public schema — see the migration before
  changing its grants
- `lib/progress.ts` — quiz progress, stored in `member_progress` with RLS
- `middleware.ts` — session refresh, protected routes, pre-launch gate
- `app/admin/` — console: insights, meeting requests, About-page editor,
  preview control, member approvals

## Lesson video behaviour

`components/VideoPlayer.tsx` shows the same honest panel whether a lesson has
no recording yet or the file fails to load. It listens for the error on the
`<video>` element's own `src` — a failing `<source>` child fires its error on
the child, where React's `onError` never sees it, which is how the production
breakage went unnoticed.

## Verifying

```bash
npx tsc --noEmit
npx eslint .
npm run build
```

If `tsc` reports errors inside `.next/types/` in files whose names end in
` 2.ts` — `routes.d 2.ts`, `cache-life.d 2.ts` — those are Finder-copy
duplicates, not real errors. Delete them and re-run:
`find .next -name "* 2.*" -o -name "* 2" | while read -r f; do rm -rf "$f"; done`

`react-hooks/set-state-in-effect` is the lint rule that bites most often here.
Prefer deriving state or `useSyncExternalStore` over syncing in an effect.

## How someone gets in

Three things used to be one thing — wanting in, proving the address is yours,
and having an account. Keeping them apart is what the current design is for.

1. **Request** (`/request` → `waitlist_requests`). A form with real questions.
   No account is created and no email is sent, so a script gets a row in a
   table nobody can read back rather than an auth user and a magic link from
   our domain. `anon` may INSERT and nothing else — deliberately no SELECT
   policy, so the table can't be used to harvest addresses.
2. **Review** (admin console → Requests). Decisions are made on what someone
   wrote in `goal`, which is also the field a bot can't fake convincingly.
3. **Invite** (`/api/admin/invite`). The only code path in the app that
   creates a user. Needs `SUPABASE_SERVICE_ROLE_KEY`; without it the button
   says so instead of failing oddly.
4. **Join.** Accepting the invite creates the profile, and the
   `link_waitlist_request` trigger matches it to the request by email, copies
   the answers onto the profile and marks it `approved` — being invited *is*
   approval, so nobody waits twice.

**`shouldCreateUser: false` on the sign-in form is load-bearing.** Left at its
default, `signInWithOtp` creates an account for any address typed into the box
and mails a link to it. That is exactly how 189 unusable accounts arrived.

OAuth (Google, Microsoft, LinkedIn) still creates an account on first use, and
that is fine — the person demonstrably holds that account elsewhere. They land
`pending` and show as identity-confirmed in the accounts screen. Only Google is
enabled in the Supabase dashboard so far; the other two buttons say "provider
is not enabled" until someone adds their client ID and secret.

`components/Turnstile.tsx` is wired into the request and sign-in forms but
inert until `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. The half that matters is
`TURNSTILE_SECRET_KEY`, checked server-side in `app/api/waitlist/route.ts` —
verifying only in the browser would be theatre, since anything can post
straight to the route.

## Outstanding

Planned in detail in `Advoc(Motiv)8/Audit-Stripe-and-Voice-Agent-Plan.md`
(outside this repo), in recommended order:

1. Host the lesson videos — still the highest-impact task, but it is a
   hosting *decision* before it is an hour's work; see the video note above.
   `scripts/upload-lesson-videos.mjs` does the upload once somewhere has been
   chosen, and refuses to start a run that would hit the free-tier ceiling
2. Stripe Checkout + webhook — `profiles.tier` is what every gate reads, and a
   webhook is the only thing that should ever change it
3. Text AI coach, validated against Barry's rubric before building voice
4. OpenAI Realtime voice coach over WebRTC with ephemeral tokens. Costs
   $0.10–0.30/min against $10 CAD/month revenue — cap minutes before
   advertising it
5. Move course content from code into the database

Not done deliberately: the admin member list still reads emails through the
client. Fine with one admin; the clean fix is a service-role route.

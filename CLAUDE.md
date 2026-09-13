@AGENTS.md

# Stand Out Whenever You Speak

A Circle.so-style learning platform for public speaking. Built by Tori with
Barry Kuntz (executive communication coach, founder of CLEAR Executive and
Corporate Development), who supplies
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

**The client logos are generated, not hand-edited.** `public/logos/*.png` come
from `scripts/normalise-logos.py`: the official vector from Wikimedia Commons
where one exists (19 of 35), otherwise the raster from Barry's "Client Logos"
deck; background knocked out, trimmed, scaled to one visual weight on a
transparent 480×128 canvas, shown in colour at one height. To add a client,
add it to `COMPANIES` in `lib/site.ts` and to the script's `COMMONS` or
`DECK_MAP`, then re-run. Don't drop a logo in by hand — it will be the one
wrong size. The caption under the row is "Barry's coaching clients have
included" — the 3,500 figure is people, not organizations; don't put it there.

**The hero shows one thing: the free first lesson, playable.** Three tiles
of illustration came before it (invented points, a drawn transcript, then a
"loop" and a lesson list Tori found meaningless — she was right). The frame's
poster is `public/lesson-1-poster.jpg`, a real frame from the recording's
title card at 3.2 s, so the play button sits on a title, not on Barry's face.
If Lesson 1 is ever re-recorded, regrab the poster.

**The look is deliberate — keep to it.** Tori asked for the polish of
heygen.com, translated into the brand rather than copied: white ground,
neutrals that lean toward the blue (`paper-soft`, `line`) instead of flat
grey, oversized tight headlines in Manrope (the `.display` class), pill
buttons and pill eyebrows, `rounded-3xl` cards with a hairline border and
`shadow-card`, and one flourish only — the soft colour glow behind the hero.
Everything comes from `components/ui.tsx` and the tokens in
`app/globals.css`; use `Btn`, `Eyebrow`, `SectionHead` and `Section` rather
than restyling by hand, so the theme stays one theme. The coaching
illustration on the home page (`CoachMock`) is drawn in HTML from the real
rubric so it stays true as the product changes.

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

**`PRELAUNCH` in `lib/site.ts` is the launch switch.** While true, `proxy.ts`
keeps the public on the waitlist home, About and Contact — but **approved
members and admins get the whole site**. That is what makes an invitation
lead somewhere; before this, the gate admitted admins only and every invited
member was bounced straight back to the home page. `access.approved` is the
one rule for it in the UI (Nav, UserMenu, Footer); `role`/`status` on the
profile is the rule in the proxy. Flip the switch to open to everyone.

**The scorecard is out of 15, not 20.** Barry's rubric has four categories,
but a voice coach cannot see eye contact, so `RUBRIC` marks it `scored:
false` and `SCORED_RUBRIC` / `RUBRIC_MAX` drive every total. It stays in the
rubric members read, labelled "not scored by voice". Don't invent a number
for it; that was the demo's mistake.

**Points are awarded by a database trigger, never by the browser.**
`award_progress_points` on `member_progress` (migration 0008) writes
`points_ledger` rows when `watched` or `quiz_passed` first becomes true — 50
and 25 — and a unique index on (user, action, lesson) means flipping a flag
on and off pays once. Before this, nothing in the codebase ever wrote a
ledger row; the "+50 points" label was decoration. `POINTS_RULES` in
`lib/site.ts` carries `live` so the leaderboard shows which rules actually
pay today. When a new way to earn points exists, award it server-side and
flip its `live` flag — don't insert from the client.

**Events come from the `events` table, edited in the admin console.** They
used to be three hard-coded entries in `lib/site.ts` with July and August
dates, still "upcoming" in September. Empty is now an honest state on both
the events page and the member home.

**Quiz documents must never be downloadable.** The source `.docx` for each
quiz ends with its answer key, and `public/` is served without a session, so
for a while anyone with the URL could fetch the answers to a quiz that gates
the next lesson. Quizzes live in `lib/quizzes.ts` only. Don't add
`kind: "quiz"` materials back.

**The AI coach is called Katya** (`COACH_NAME` in `lib/site.ts`) — Barry's
name for her in the programme blueprint. Front Row meets her at the end of
Lesson 5B with the self-introduction; Speakers' Circle brings her a
two-to-three-minute presentation on one of eighty topics. Member-facing copy
uses the name; model prompts in `lib/courses.ts` still say "the learner".

**Lesson numbering follows Barry's blueprint of 22 August 2026,** not a
simple sequence: 01–06 (5A/5B) are Front Row; then 7A, 7A1, 7A2 (no content
yet) and 8 are available now; 7A3–7A6 are planned. Slugs were kept when
titles changed (`impactful-structure-explained`, `key-conversations-managed`,
`managing-difficult-conversations`) because `member_progress` and the video
filenames key on them. Barry's source documents — blueprint, bio, exercises,
the 80 topics — are in iCloud under "Stand Out Whenever You Speak/New Actions".

**`FREE_PREVIEW_COUNT = 7` covers lessons 01–06** because lesson 5 is split
into 5A and 5B.

**Lesson videos are git-ignored** (10 MP4s, 1.13 GB — over GitHub's file
limit). They play from `public/videos` locally and resolve against
`NEXT_PUBLIC_VIDEO_BASE_URL` in production, which is **not set**, so in
production every lesson video 404s.

**They need the Supabase Pro plan, which Tori chose deliberately.** Free
allows 1 GB total, 5 GB of egress a month, and — the one that really bites —
**50 MB per file**. Nine of the ten recordings are bigger than that, so on
free most are rejected outright. Pro raises those to 100 GB, 250 GB and 50 GB
per file. The `lesson-videos` bucket already exists (migration 0007).

The files are uncompressed on purpose: all ten are 1080p at 2.0-4.4 Mbps,
roughly double what talking-head footage needs, and compressing to about
1.2 Mbps would halve storage and bandwidth. Tori decided against it for now,
so don't quietly re-encode them. If it ever comes up, macOS's built-in
`avconvert` is not the tool — it ignores the target bitrate and, asked for
720p, produced a file *larger* than the source. That needs ffmpeg.

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
- `lib/topics.ts` / `app/topics/` — the 80 Speakers' Circle practice topics
  and their prompts, generated from Barry's document. Regenerate from the
  document rather than hand-editing
- `lib/directory.ts` — the `member_directory` view (real members only)
- `lib/events.ts` / `lib/use-events.ts` / `app/admin/Events.tsx` — live
  events: shared helpers, the home-page hook, and where admins schedule them
- `lib/waitlist-request.ts` — the request shape and its option lists, shared
  by the form, the API route and the admin screen. Every list here is mirrored
  by a CHECK constraint in the migration; change both
- `app/request/` / `app/api/waitlist/` / `app/admin/Requests.tsx` — ask,
  store, review
- `lib/waitlist.ts` / `app/admin/Members.tsx` — the `admin_waitlist()`
  function and the one Members screen: every account with how it signed up,
  whether anyone ever used it, and the approve / decline / tier / role
  controls. The function is SECURITY DEFINER, not a view, so `auth.users` is
  never selectable from the public schema — see the migration before
  changing its grants
- `lib/progress.ts` — quiz progress, stored in `member_progress` with RLS
- `proxy.ts` — session refresh, protected routes, pre-launch gate (Next 16's
  name for middleware; same behaviour)
- `app/admin/` — the console. `page.tsx` is a shell with a tab rail
  (`?tab=requests` etc., so links can deep-link) and one component per tab:
  Overview (real numbers + a to-do list), Requests, Members, MeetingRequests,
  Events, ContentEditor, Insights, and Tools (PreviewControl, TestData)

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

**The project lives in `~/Developer/standout-platform`, deliberately outside
iCloud Drive.** It was in `~/Documents` until 13 September 2026, and iCloud's
Desktop & Documents sync kept resolving conflicts on `.next`, `node_modules`
and freshly-written files by creating " 2" / " 3" copies — one of which
reached the repo (#15, removed in #16). If ` 2.ts` duplicates ever reappear
under `.next/types/`, something has put the folder back inside a synced
location; delete them with
`find .next -name "* 2.*" -o -name "* 2" | while read -r f; do rm -rf "$f"; done`
and check for stray copies before every commit.

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

**Auth emails go through Resend, not Supabase's default sender.** The
default is a shared address, rate-limited to a few messages an hour, and the
first invitation sent from it went straight to junk. SMTP is configured in the
Supabase dashboard (Authentication → Emails), the domain is verified in Resend,
and the invite template text is kept in `Advoc(Motiv)8/Invite-Email-Template.md`
so it can be reviewed outside the dashboard. If invitations start landing in
junk again, check the domain is still verified before touching anything else.

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

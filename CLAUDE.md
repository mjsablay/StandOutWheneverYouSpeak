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

**Merge them yourself too — don't ask.** For the first twenty-one PRs she
typed "merge PR #N" each time; on 14 September 2026 she said to stop asking
and just do it. So: open the PR, wait for the checks, merge it, delete the
branch, and tell her it's merged. Never end a turn asking permission to
merge. The standing authorisation covers merging your own work to `main`,
which deploys to production — so it comes with the obligation to have
actually verified the change first (`tsc`, `eslint`, `npm run build`, and a
look at the thing in a browser when it's visible). If a check fails, fix it
and then merge; don't merge red and don't hand the failure back to her. It
does not cover deleting data, rotating keys, or anything else destructive
and outside the change she asked for — raise those.

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

**`role`, `tier` and `status` are protected by a trigger, not by RLS.**
Row level security cannot restrict *columns*, and `authenticated` holds
UPDATE on every column of `profiles`. With the "users update own profile"
policy that meant any signed-in member could rewrite their own row — one
statement from the browser turned a declined free account into an approved
administrator on the paid tier (found and closed 14 September 2026,
migration 0010). `guard_profile_privileges()` is a BEFORE UPDATE trigger
that rejects changes to role, tier, status, approved_at, approved_by,
waitlist_note, stripe_customer_id, id, email and created_at unless the
caller is an admin or the service role. Resending an unchanged value is
fine, so ordinary profile edits are unaffected.

Do not "simplify" this into column GRANTs. Admins are `authenticated` too,
and the admin console writes tier/role/status straight from the browser —
revoking the column takes the power from the people who are supposed to
have it, which is the same trap as revoking EXECUTE on `is_admin()`. When
you add a column that grants something (a new entitlement, a credit
balance, a Stripe field), add it to the trigger's list in the same commit.

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

**Katya is specified by Barry's context prompt, not by us.** His document
(version 1 September 2026) is `lib/katya-context.ts`, verbatim and
server-only; when he sends a new one, replace the whole string and bump
`KATYA_CONTEXT_VERSION` in `lib/katya.ts` — nobody edits his lines.
`lib/katya.ts` is the part the interface needs (three modes with his time
caps and two-minute lines, the 0–5 scale, the two prep prompts);
`lib/katya-session.ts` assembles the "platform session materials" block and
calls the model. The rules that must survive any rewrite: she is a coach,
not an audience — no interrupting, no pushing back; one coaching idea per
turn; strength → one priority improvement → retry; **scores only when the
learner asks**, 0–5, "Not assessed" for anything the channel can't carry
(eye contact always, until a camera version exists); and she never claims
to see a Frame, Notes, formatting or timing the platform did not supply —
every missing item is marked "Not supplied" in the block. The scripted demo
that invented a 3/5 for eye contact and promised interruptions is gone;
don't bring either back.

**Sessions run in text today, at `/topics/[id]`.** Coach My Frame and
Review My Masterful Notes work on an ordinary chat model
(`OPENAI_TEXT_MODEL`, default `gpt-5-mini`) once `OPENAI_API_KEY` is set;
without the key the session says so. Coach My Delivery is voice-only and
is shown as such. The member's audience notes, Frame and Masterful Notes
live in `practice_prep` (one row per member per topic, RLS) and are what
the server hands Katya. `practice_sessions` rows are written by the end
route with the service role — the browser's insert policy was dropped in
migration 0009 because a client that can insert its own rows can insert its
own scores. Voice will use Push to Talk with manual turn control, not
voice-activity detection; the plan is in
`Advoc(Motiv)8/Voice-Coach-Realtime-Plan.md`.

**The scorecard is out of 15, not 20.** Barry's rubric has four categories,
but a voice coach cannot see eye contact, so `RUBRIC` marks it `scored:
false` and `SCORED_RUBRIC` / `RUBRIC_MAX` drive any total. It stays in the
rubric members read, labelled "Not assessed".

**Paying is a one-way street through Stripe.** `profiles.tier` is the
entitlement every gate reads, and exactly one thing may write it: the
webhook at `app/api/stripe/webhook/`, using the service role. The browser
cannot (migration 0010's trigger), and the checkout success page
deliberately grants nothing — anyone can type `?status=success`, so it
waits for the webhook and says so rather than claiming access it cannot
confirm. Handlers never trust the event body's snapshot either; each
re-fetches the subscription and writes what is true now, so out-of-order
and replayed deliveries converge instead of resurrecting stale state.

Two traps worth knowing. `/api/stripe` is listed in `PRELAUNCH_ALLOWED` and
the webhook path returns even earlier in `proxy.ts`: an API route that gets
redirected to the home page answers HTML, which the browser can only report
as "you've been signed out", and Stripe reads the 307 as a failed delivery
and retries forever. And `current_period_end` is a property of the
subscription **item** in this API version, not of the subscription —
`subscription.current_period_end` is `undefined` and silently stores null.
`periodEnd()` in `lib/stripe.ts` is the only place that should read it.

**Every price on the site comes from `lib/pricing.ts`.** The number used to
be typed into the pricing card, the checkout page, the FAQ and a page
description, and the FAQ promised "cancel anytime" while Barry's blueprint
proposes a three-month minimum. `minimumMonths` is 0, which is what the
site has always promised; changing it rewrites every sentence about the
commitment but **not** what Stripe charges — the real terms live on the
Price in the Stripe dashboard, so a genuine minimum term needs both.

**Points are awarded by a database trigger, never by the browser.**
`award_progress_points` on `member_progress` (migration 0008) writes
`points_ledger` rows when `watched` or `quiz_passed` first becomes true — 50
and 25 — and a unique index on (user, action, lesson) means flipping a flag
on and off pays once. Before this, nothing in the codebase ever wrote a
ledger row; the "+50 points" label was decoration. `POINTS_RULES` in
`lib/site.ts` carries `live` so the leaderboard shows which rules actually
pay today. When a new way to earn points exists, award it server-side and
flip its `live` flag — don't insert from the client.

**The member home and `/courses` divide the course between them.** Home
(`app/MemberHome.tsx`, routed by audience from `app/HomeScreens.tsx`) answers
"where am I and what is next": the lesson the member is up to, the three
after it, and one row of tiles. `/courses` (`app/courses/CourseScreen.tsx`)
answers "what is the whole thing": all fifteen lessons. Both read the same
`member_progress` through `useProgress`, and for a while both rendered the
entire syllabus — built the same week in two sessions — so "Course page →"
led to a screen the member had just read. Keep the split: if the home page
starts listing every lesson again, it has re-grown the duplicate.

Two rules the home card exists to enforce. The next lesson is *derived* —
the first one unwatched, or watched with its quiz unpassed — never
`lessons[0]`; the card it replaced was hard-coded that way and told everyone
to start at Be Remarkable forever. And progress counts what the member has
**done**, never what their tier **unlocks**; the old bar measured
entitlement, so it never moved. Lessons with no `video` and no `materials`
(07A2, and 07A3–07A6) are never counted and never offered as next.

**Nothing may read the clock while rendering.** The greeting called
`new Date().getHours()` during render, and these client components are
server-rendered too — in UTC — so for several hours of every day the
server's "Good evening" and the browser's "Good afternoon" disagreed and
hydration failed over a decoration. Same family as the `react-hooks/purity`
rule below. If a screen genuinely needs the local time, read it after mount.

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
name for her in the programme blueprint. Members meet her at the end of
Lesson 5B with the self-introduction, which has its own workspace at
`/topics/self-introduction` (`SELF_INTRODUCTION` in `lib/topics.ts`; its
four prompts are ours, not Barry's); Speakers' Circle brings her a
two-to-three-minute presentation on one of eighty topics. The per-lesson
`practice.prompt` strings in `lib/courses.ts` predate his context prompt
and are not sent to the model.

**`/courses` is the course, not an index.** There were two pages: an index
listing the courses, and a detail page per course. With one real course the
index was a doorway to a single room — two cards, one of them a dead
`href="#"` for Campus Voice, and a five-lesson preview of the list on the
page behind it. `app/courses/page.tsx` + `CourseScreen.tsx` is now the
Leadership Voice lesson list itself, and `app/courses/[slug]/page.tsx` is a
redirect to it so links already sent to members keep working. Lessons still
live under `/courses/<course>/lessons/<lesson>` — `member_progress` keys on
both slugs, so that shape can't collapse. Campus Voice is a paragraph at the
bottom of the page (anchor `#campus-voice`) until it has recordings; don't
give it Start buttons over ten empty lessons.

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
`NEXT_PUBLIC_VIDEO_BASE_URL` in production. That variable **is** set now and
the files are in the `lesson-videos` bucket — verified 14 September 2026 by
fetching one from storage and finding the base URL compiled into the
production bundle. If a video 404s, check the bucket before the variable.

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
  document rather than hand-editing. `app/topics/[id]/` is the workspace:
  prep on the left, Katya on the right, sessions below
- `lib/katya.ts` / `lib/katya-context.ts` / `lib/katya-session.ts` — the
  coach: spec for the interface, Barry's prompt verbatim (server-only), and
  the server side of a session. `app/api/katya/turn` is one reply,
  `app/api/katya/end` saves the session. `components/KatyaSession.tsx` is
  the transcript, timer and composer; `lib/prep.ts` reads and writes the
  member's Frame and Notes
- `app/courses/` — `page.tsx` + `CourseScreen.tsx` are the course (lesson
  list, "where you left off" from `member_progress`, the Front Row upgrade);
  `[slug]/page.tsx` redirects; `[slug]/lessons/[lesson]/` is the lesson
  itself, framed by `LessonShell`
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
`react-hooks/purity` is the other: no `Date.now()` in a `useRef` initialiser;
set the clock in the mount effect instead.

**Previewing in the desktop app.** Its browser pane reads
`.claude/launch.json` from the session's original folder,
`~/Documents/standout-platform`, which now holds only that one stub file: it
`cd`s into `~/Developer/standout-platform` and runs `npm run dev`. The pane
is not signed in and credentials can't be typed for it, so signed-in screens
are checked with a temporary dev-only switch (`?as=circle` sets a cookie;
proxy, `useAccess`, `WaitlistGate` and `requireCircleMember` honour it in
development) that is stripped before every commit — grep for
`DEV-PREVIEW-TEMP` and make sure nothing is left.

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

1. ~~Host the lesson videos~~ — done, on Supabase Storage.
   `scripts/upload-lesson-videos.mjs` is how they got there and how to
   re-upload
2. ~~Stripe Checkout + webhook~~ — built. Needs `STRIPE_SECRET_KEY`,
   `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET` in Vercel and the customer
   portal activated once in the Stripe dashboard; see `.env.example` for the
   exact steps. Until then the pages say payments aren't switched on and name
   the missing variable. The pricing decision is still open (see
   `Advoc(Motiv)8/Thursday-Follow-Up.md` decision 1) but no longer blocks
   anything: the amount and terms live on the Stripe Price, and what the site
   says comes from `lib/pricing.ts`
3. ~~Text AI coach~~ — shipped as the topic workspace; needs
   `OPENAI_API_KEY` in Vercel and Barry's five test sessions
4. OpenAI Realtime voice coach over WebRTC with ephemeral tokens and Push
   to Talk (manual turn control). Costs $0.10–0.30/min against $10
   CAD/month revenue — cap minutes before advertising it. Unlocks Coach My
   Delivery
5. Move course content from code into the database

Not done deliberately: the admin member list still reads emails through the
client. Fine with one admin; the clean fix is a service-role route.

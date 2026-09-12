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

**`PRELAUNCH` in `lib/site.ts` is the launch switch.** While true, `middleware.ts`
keeps everyone except admins on the waitlist home, About and Contact. Flip it
to go live.

**`FREE_PREVIEW_COUNT = 7` covers lessons 01–06** because lesson 5 is split
into 5A and 5B.

**Lesson videos are git-ignored** (10 MP4s, 1.2 GB — over GitHub's file limit).
They play from `public/videos` locally and resolve against
`NEXT_PUBLIC_VIDEO_BASE_URL` in production. Hosting them on Supabase Storage is
the highest-value outstanding task.

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
- `lib/progress.ts` — quiz progress, stored in `member_progress` with RLS
- `middleware.ts` — session refresh, protected routes, pre-launch gate
- `app/admin/` — console: insights, meeting requests, About-page editor,
  preview control, member approvals

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

## Outstanding

Planned in detail in `Advoc(Motiv)8/Audit-Stripe-and-Voice-Agent-Plan.md`
(outside this repo), in recommended order:

1. Host the lesson videos (~1 hour, highest impact)
2. Stripe Checkout + webhook — `profiles.tier` is what every gate reads, and a
   webhook is the only thing that should ever change it
3. Text AI coach, validated against Barry's rubric before building voice
4. OpenAI Realtime voice coach over WebRTC with ephemeral tokens. Costs
   $0.10–0.30/min against $10 CAD/month revenue — cap minutes before
   advertising it
5. Move course content from code into the database

Not done deliberately: the admin member list still reads emails through the
client. Fine with one admin; the clean fix is a service-role route.

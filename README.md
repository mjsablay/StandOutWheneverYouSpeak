# Stand Out Whenever You Speak — Platform

Learning platform for the public-speaking courses of Barry Kuntz (Black Isle
Consultants). Next.js 16 · React 19 · TypeScript · Tailwind v4 · Supabase.

Live at <https://standoutwheneveryouspeak.com>, deployed by Vercel from `main`.

## Running locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Copy `.env.example` to `.env.local` first and
fill in the Supabase values — the site does nothing without them.

Before opening a pull request:

```bash
npx tsc --noEmit
npx eslint .
npm run build
```

## Project layout

```
app/                    Routes (one folder per page)
  request/                         ask for a place (no account is created)
  admin/                           console: requests, accounts, insights, content
  courses/[slug]/lessons/[lesson]/ lesson: video, quiz, practice, workbook
  api/waitlist, api/admin/invite   the only routes that write on a visitor's behalf
components/             Shared UI (Nav, VideoPlayer, SocialSignIn, Turnstile, ui.tsx)
lib/
  site.ts               Site copy, nav, FAQs, and the PRELAUNCH switch
  courses.ts            Courses, lessons, Barry's rubric, video filenames
  access.ts             The one place the UI asks "what may this person see"
  mock-auth.tsx         Real Supabase auth — the name is a leftover, see CLAUDE.md
  waitlist-request.ts   Shape of a request, shared by form, API and admin
proxy.ts                Session refresh, protected routes, pre-launch gate
supabase/migrations/    Schema, applied to the live project
scripts/                upload-lesson-videos.mjs
```

To change wording anywhere on the site, edit `lib/site.ts` or
`lib/courses.ts` rather than the page components. The About page's copy is
edited from the admin console instead.

## How someone gets in

1. **Request** a place at `/request`. A row is stored; no account exists yet.
2. An admin **reviews** the answers in the console and clicks Invite.
3. The **invitation** email creates the account, already approved.

Sign-in is by Google, Microsoft, LinkedIn, or an emailed link. The email form
cannot create accounts — only an invitation can.

## Lesson videos

The ten recordings (1.13 GB) are **not in git**; GitHub rejects files over
100 MB. They live in `public/videos/` on your machine, git-ignored, and are
hosted for production in Supabase Storage (`lesson-videos` bucket). The
`NEXT_PUBLIC_VIDEO_BASE_URL` variable in Vercel points the player at it.

To upload new or replaced recordings:

```bash
node scripts/upload-lesson-videos.mjs
```

It skips files already present and prints the value to set in Vercel.

## Environment variables

Documented in `.env.example`. Never commit `.env.local`.

`CLAUDE.md` holds the things that will surprise you — read it before changing
auth, permissions, or anything in the `private` schema.

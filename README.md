# Stand Out Whenever You Speak — Platform

Learning platform for the public-speaking courses of Barry Kuntz (Black Isle
Consultants). Next.js 16 · React 19 · TypeScript · Tailwind v4.

## Running locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Before pushing, always check the build compiles:

```bash
npm run build
```

## Project layout

```
app/                    Routes (one folder per page)
  courses/[slug]/                  course detail
  courses/[slug]/lessons/[lesson]/ lesson player screen
  members/[slug]/                  member profiles
components/             Shared UI (Nav, Footer, VideoPlayer, ui.tsx)
lib/
  site.ts               Site copy — bios, events, FAQs, nav
  courses.ts            Courses, lessons, video filenames
  members.ts            Demo member directory
  mock-auth.tsx         ⚠️ Simulated login — replaced by Supabase
public/logos/           35 client logos (committed)
public/videos/          Lesson videos (NOT committed — see below)
```

To change wording anywhere on the site, edit `lib/site.ts` or
`lib/courses.ts` rather than the page components.

## Lesson videos

The 10 Leadership Voice videos total ~1.2 GB and are **deliberately not in
git**. GitHub rejects any single file over 100 MB, and most of these exceed
that.

They live in `public/videos/` on your machine, which `.gitignore` excludes.
Video playback therefore works in local development, and the deployed site
shows a "coming soon" placeholder until the videos are hosted properly.

**To make videos work in production**, upload them to a video host and set
one environment variable in Vercel:

```
NEXT_PUBLIC_VIDEO_BASE_URL=https://your-host/path-to-videos
```

`videoUrl()` in `lib/courses.ts` resolves each lesson's filename against
that base. No code changes needed — set the variable and redeploy.

Options, roughly in order of recommendation:

| Host | Why |
|---|---|
| **Supabase Storage** | Already in the stack; simple; fine at this scale |
| **Mux / Cloudflare Stream** | Adaptive streaming, analytics, harder to copy |
| **Unlisted YouTube / Vimeo** | Free and fast, but needs an embed-based player |

## Simulated auth and payment

`lib/mock-auth.tsx` fakes sign-in using `localStorage` so the whole site is
clickable before the backend exists. **It is not secure** — anyone can grant
themselves paid access from the browser console. A "Preview mode" banner
makes this visible. It gets replaced by Supabase Auth, with paid content
protected by Row-Level Security in the database.

## Environment variables

Copy `.env.example` to `.env.local` and fill in as services are connected.
Never commit `.env.local`.

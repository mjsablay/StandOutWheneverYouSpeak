# Isolated performance workflow verification

Run `npm run test:performance` for the actual Postgres migrations in PGlite.
Coverage includes readiness states, current-month restrictions, historical membership,
score calculations, award retries, record retries, RPC permissions and row isolation.

For browser review, use a disposable checkout without production `.env.local`:

1. Run `node tests/serve-performance.mjs` (loopback port 3302).
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL=http://localhost:3302`
   and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=isolated-test-key`.
3. Copy `tests/fixtures/performance-login.tsx` to
   `app/contact/performance-test/page.tsx` (create its directory).
4. Run `npm run dev -- --port 3102 --hostname 127.0.0.1`.
5. Open `http://localhost:3102/contact/performance-test`; sign in as test admin.
   Alex has four assessments in the prior month. Review Alex, enter a draft,
   and attempt member/month/tab changes: Cancel must preserve it, confirmation
   must discard it. Complete the fifth assessment in the prior month, review,
   save, and finalize. Check the overview changes from needs assessments to ready
   to finalized. Sign in as the member and check the feedback/award; the other
   member must not see Alex's results.
6. Remove the temporary route and `.env.local` before a production build.

The server uses fixed fake accounts and an Auth/REST adapter around real SQL;
it is not a Supabase Auth integration test. Never point it at production.
Restarting it resets all test data and requires signing in again.

## Verification performed 2026-11-05

- Database suite passed, including member/admin/anonymous permissions and retries.
- Isolated HTTP flow passed: fifth assessment, same request retry, ready status,
  finalize/retry, member report with five assessments and one 62.67-point award,
  cross-member denial, and non-admin overview denial.
- Browser verified administrator sign-in, overview counts, assessment form, and
  finalized overview (one award, five assessments, 62.67 points).
- The browser tool stalled on a native confirmation dialog. Confirmation
  cancel/accept behavior and complete member-page click-through were not verified.
  The workflow above remains the manual acceptance check for those boundaries.
- No production migrations, fixtures, deployment or auth changes were made.

-- Where the lesson recordings live.
--
-- PLAN NOTE: this cannot work on the Supabase free tier, and not only because
-- of the 1 GB total. Free caps a single file at 50 MB, and nine of the ten
-- recordings are larger than that — the smallest is 45 MB and the largest is
-- 191 MB. Pro raises both ceilings (100 GB total, 50 GB per file), which is
-- why Pro is the chosen path rather than an upsell.
--
-- Public read: the files are fetched straight by the <video> element, so the
-- URL has to work without a session. That means anyone holding a URL can
-- watch it. Acceptable while everything is pre-launch and seven lessons are a
-- free preview anyway; before payments go live this should become a private
-- bucket with short-lived signed URLs minted per request.
--
-- Writes are granted to nobody: uploads go through the service role, which
-- bypasses RLS, so there is no path for a member to put files here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lesson-videos', 'lesson-videos', true, 524288000, array['video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lesson videos are publicly readable" on storage.objects;
create policy "lesson videos are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'lesson-videos');

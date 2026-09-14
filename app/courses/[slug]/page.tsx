import { redirect } from "next/navigation";

/**
 * /courses is the course now, so this page has nothing left to show.
 *
 * It redirects rather than 404s because members were sent
 * /courses/leadership-voice links while the index existed, and because
 * /courses/campus-voice used to list ten lessons with Start buttons that
 * opened empty pages — the note on /courses is the honest version of that.
 *
 * Lessons keep their own routes underneath: a lesson is addressed by course
 * slug and lesson slug, which is what member_progress keys on.
 */
export default function CourseSlugPage() {
  redirect("/courses");
}

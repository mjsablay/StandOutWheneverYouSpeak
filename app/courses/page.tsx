import { redirect } from "next/navigation";

/** Existing bookmarks now land on the same Learning page as Home. */
export default function CoursesPage() { redirect("/"); }

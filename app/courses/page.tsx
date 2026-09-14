import type { Metadata } from "next";
import CourseScreen from "./CourseScreen";

/**
 * There used to be an index here: two cards headed "Choose your course",
 * one of them a dead `href="#"` for a course with no content, each card
 * previewing five lesson titles that the next page listed in full. It was
 * a doorway to a single room — and only approved members and admins can
 * open it, so the marketing copy on it was addressed to nobody.
 *
 * /courses is now the course itself. Every link that pointed here still
 * works and lands a click closer to the lessons.
 */

export const metadata: Metadata = {
  title: "Leadership Voice — Stand Out Whenever You Speak",
  description:
    "Fifteen lessons in Barry Kuntz's Speak with Impact method: structure a message, deliver it from Masterful Notes, and practise it with Katya.",
};

export default function CoursesPage() {
  return <CourseScreen />;
}

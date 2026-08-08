"use client";

import { useParams } from "next/navigation";
import Quiz from "@/components/Quiz";
import { getLesson } from "@/lib/courses";

export default function LessonQuizScreen() {
  const { slug, lesson: lessonSlug } = useParams<{
    slug: string;
    lesson: string;
  }>();

  const data = getLesson(slug, lessonSlug);
  if (!data) return null;

  const { lesson, next } = data;

  return (
    <Quiz
      lessonSlug={lesson.slug}
      nextHref={next ? `/courses/${slug}/lessons/${next.slug}` : null}
      nextTitle={next?.title ?? null}
    />
  );
}

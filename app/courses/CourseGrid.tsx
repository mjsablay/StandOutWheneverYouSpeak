"use client";

import Link from "next/link";
import { COURSES } from "@/lib/courses";
import { useAuth } from "@/lib/mock-auth";

export default function CourseGrid() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {COURSES.map((course) => {
        const videoCount = course.lessons.filter((l) => l.video).length;

        const href = course.comingSoon
          ? "#"
          : user
            ? `/courses/${course.slug}`
            : `/signin?next=${encodeURIComponent(`/courses/${course.slug}`)}`;

        const cta = course.comingSoon
          ? "Coming soon"
          : user
            ? "Start this course →"
            : "Sign in to start →";

        const body = (
          <>
            <div
              className={`h-1.5 ${course.comingSoon ? "bg-accent" : "bg-brand"}`}
            />
            <div className="p-8">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
                {course.audience}
              </div>
              <h3 className="mb-2.5 flex flex-wrap items-center gap-2.5 text-[26px] font-bold tracking-tight">
                {course.name}
                {course.comingSoon && (
                  <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1.5 text-xs font-bold leading-none text-accent-ink">
                    Coming soon
                  </span>
                )}
              </h3>
              <p className="mb-4 text-[15.5px] text-ink-soft">{course.blurb}</p>
              <div className="mb-5 flex flex-wrap gap-4 text-[13.5px] text-ink-soft">
                <span>
                  <strong className="text-ink">{course.lessons.length}</strong>{" "}
                  lessons
                </span>
                {videoCount > 0 && (
                  <span>
                    <strong className="text-ink">{videoCount}</strong> videos
                  </span>
                )}
                <span className="font-bold text-ink">{course.level}</span>
              </div>

              <ul className="border-t border-line">
                {course.lessons.slice(0, 5).map((lesson) => (
                  <li
                    key={lesson.slug}
                    className="flex items-center gap-2.5 border-b border-line px-1 py-2.5 text-[15px]"
                  >
                    <span className="text-xs text-accent">▸</span>
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.video && (
                      <span className="text-[12px] text-ink-soft"></span>
                    )}
                  </li>
                ))}
              </ul>
              {course.lessons.length > 5 && (
                <div className="mt-3 text-[13.5px] text-ink-soft">
                  + {course.lessons.length - 5} more lessons
                </div>
              )}

              <div className="mt-5 text-[14.5px] font-bold text-brand">
                {cta}
              </div>
            </div>
          </>
        );

        const shell =
          "scroll-mt-20 block overflow-hidden rounded-2xl border border-line bg-white transition";

        if (course.comingSoon) {
          return (
            <div
              key={course.slug}
              id={course.slug}
              className={`${shell} opacity-75`}
            >
              {body}
            </div>
          );
        }

        return (
          <Link
            key={course.slug}
            id={course.slug}
            href={href}
            className={`${shell} hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(20,24,31,.10)]`}
          >
            {body}
          </Link>
        );
      })}
    </div>
  );
}

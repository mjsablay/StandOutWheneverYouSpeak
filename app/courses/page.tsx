import type { Metadata } from "next";
import { Wrap, Section, SectionHead, Check } from "@/components/ui";
import CourseGrid from "./CourseGrid";

export const metadata: Metadata = {
  title: "Courses — Stand Out Whenever You Speak",
  description:
    "Leadership Voice for professionals and Campus Voice for students. Structured lessons, AI practice, and live peer sessions.",
};

const INCLUDES = [
  "Short video + text lessons",
  "Practice exercises",
  "Unlimited AI practice",
  "Points toward the leaderboard",
];

export default function CoursesPage() {
  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Courses"
          title="Choose your course."
          sub="Two tracks, one skill: being remembered for what you say. Each course pairs short lessons with AI practice and live peer sessions."
        />

        <CourseGrid />

        <div className="mt-10 flex flex-wrap justify-center gap-3.5">
          {INCLUDES.map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold"
            >
              <Check /> {i}
            </div>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Wrap, Section, SectionHead, Check } from "@/components/ui";
import { TOPIC_COUNT } from "@/lib/topics";
import CourseGrid from "./CourseGrid";

export const metadata: Metadata = {
  title: "Courses — Stand Out Whenever You Speak",
  description:
    "Leadership Voice for professionals and Campus Voice for students. Structured lessons, AI practice, and live peer sessions.",
};

const INCLUDES = [
  "Short video + text lessons",
  "Practice exercises",
  "Practice with Katya, your AI coach",
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

        {/* Speakers' Circle practice engine */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-accent bg-accent-soft p-7">
          <div className="max-w-[560px]">
            <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-accent-ink">
              Speakers&apos; Circle
            </div>
            <h3 className="text-[20px] font-extrabold tracking-tight">
              {TOPIC_COUNT} practice topics, each with four prompts
            </h3>
            <p className="mt-1 text-[14.5px] text-ink-soft">
              Choose one, frame a two-to-three-minute presentation, make your
              Masterful Notes, practise, and bring it to Katya.
            </p>
          </div>
          <Link
            href="/topics"
            className="rounded-lg bg-brand px-5 py-3 text-[15px] font-semibold text-white hover:bg-brand-dark"
          >
            Browse the topics
          </Link>
        </div>

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

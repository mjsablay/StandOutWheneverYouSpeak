"use client";
import Link from "next/link";
import { useAuth } from "@/lib/mock-auth";
import { torontoDate } from "@/lib/performance";
import { Wrap, Section, SectionHead, PageSkeleton } from "@/components/ui";
import PerformancePanel from "@/components/PerformancePanel";
export default function PerformancePage() {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  return <Section><Wrap><SectionHead eyebrow="Your speaking journey" title="See your progress." sub="Clear evidence of how your speaking develops, one presentation at a time." />
    <p className="mb-6 max-w-3xl text-sm text-ink-soft">Your coach records full presentation assessments during the Speakers’ Circle scoring pilot. Katya’s text conversations support preparation; they do not assess delivery or earn performance points. <Link href="/leaderboard" className="font-semibold text-brand underline">Lesson activity points</Link> are tracked separately.</p>
    {user ? <PerformancePanel subject={user.id} period={`${torontoDate().slice(0, 7)}-01`} /> : <Link href="/signin?next=/performance" className="font-semibold text-brand">Sign in to see your performance</Link>}
  </Wrap></Section>;
}

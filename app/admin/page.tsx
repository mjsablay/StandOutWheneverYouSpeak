"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Wrap, Section, Eyebrow, PageSkeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/mock-auth";
import Overview from "./Overview";
import Requests from "./Requests";
import Members from "./Members";
import MeetingRequests from "./MeetingRequests";
import Events from "./Events";
import ContentEditor from "./ContentEditor";
import Insights from "./Insights";
import PreviewControl from "./PreviewControl";
import TestData from "./TestData";

/**
 * The admin console as a workspace: a rail of tabs on the left, one job per
 * tab, badges for what's waiting. The tab lives in the URL (?tab=requests)
 * so the home page and the Overview's to-do list can link straight to it.
 */

type TabId = "overview" | "requests" | "members" | "meetings" | "events" | "content" | "insights" | "tools";

const TABS: { id: TabId; label: string; icon: LucideIcon; hint: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, hint: "The platform at a glance" },
  { id: "requests", label: "Requests", icon: Inbox, hint: "People asking to join" },
  { id: "members", label: "Members", icon: Users, hint: "Every account: approve, tier, role" },
  { id: "meetings", label: "Meetings", icon: CalendarClock, hint: "Conversations requested through Contact" },
  { id: "events", label: "Events", icon: CalendarDays, hint: "What members see on the calendar" },
  { id: "content", label: "About page", icon: FileText, hint: "Headline, stats and founder bios" },
  { id: "insights", label: "Insights", icon: Sparkles, hint: "An analyst's read of your numbers" },
  { id: "tools", label: "Tools", icon: Wrench, hint: "Preview as a member; test data" },
];

type Badges = Partial<Record<TabId, number>>;

function useBadges(enabled: boolean, refreshKey: number) {
  const supabase = useMemo(() => createClient(), []);
  const [badges, setBadges] = useState<Badges>({});
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const [req, meet, pend] = await Promise.all([
        supabase.from("waitlist_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("meeting_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      if (cancelled) return;
      setBadges({
        requests: req.count ?? 0,
        meetings: meet.count ?? 0,
        members: pend.count ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, enabled, refreshKey]);
  return badges;
}

function Console() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const tab = (TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "overview") as TabId;
  const go = (id: string) => router.push(id === "overview" ? "/admin" : `/admin?tab=${id}`);

  const badges = useBadges(isAdmin, refreshKey);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/admin");
  }, [loading, user, router]);

  if (loading || !user) return <PageSkeleton />;

  if (!isAdmin) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-3xl border border-line bg-white p-10 text-center shadow-card">
            <ShieldAlert className="mx-auto mb-4 h-8 w-8 text-ink-soft" strokeWidth={1.75} />
            <h1 className="display mb-2 text-[26px]">Administrators only</h1>
            <p className="mb-6 text-[15px] text-ink-soft">Ask an administrator if you need access to this area.</p>
            <Link href="/account" className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">
              Back to my profile
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const current = TABS.find((t) => t.id === tab)!;
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <Section className="py-10 sm:py-12">
      <Wrap>
        <div className="mb-8">
          <Eyebrow>Admin console</Eyebrow>
          <h1 className="display text-[clamp(28px,4vw,40px)]">{current.label}</h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">{current.hint}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Rail */}
          <nav aria-label="Console sections" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="-mx-6 flex gap-1 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {TABS.map(({ id, label, icon: Icon }) => {
                const on = id === tab;
                const badge = badges[id];
                return (
                  <li key={id} className="shrink-0">
                    <button
                      onClick={() => go(id)}
                      aria-current={on ? "page" : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-full px-3.5 py-2 text-[14px] font-semibold transition lg:rounded-xl ${
                        on ? "bg-brand text-white" : "text-ink-soft hover:bg-paper-soft hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      <span className="flex-1 text-left">{label}</span>
                      {badge ? (
                        <span
                          className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold ${
                            on ? "bg-white/20 text-white" : "bg-brand text-white"
                          }`}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* The job */}
          <div className="min-w-0">
            {tab === "overview" && <Overview go={go} />}
            {tab === "requests" && <Requests isAdmin />}
            {tab === "members" && <Members adminId={user.id} />}
            {tab === "meetings" && <MeetingRequests />}
            {tab === "events" && <Events />}
            {tab === "content" && <ContentEditor />}
            {tab === "insights" && <Insights />}
            {tab === "tools" && (
              <div className="space-y-6">
                <PreviewControl />
                <TestData onChange={bump} />
              </div>
            )}
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Console />
    </Suspense>
  );
}

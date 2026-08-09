"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, PageSkeleton } from "@/components/ui";
import { NOTIFICATIONS } from "@/lib/members";
import { useAuth } from "@/lib/mock-auth";
import WaitlistGate from "@/components/WaitlistGate";

function NotificationsPageInner() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/notifications");
  }, [loading, user, router]);

  if (loading || !user) return <PageSkeleton />;

  return (
    <Section>
      <Wrap className="max-w-[720px]">
        <h1 className="mb-6 text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight">
          Notifications
        </h1>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 border-b border-line p-5 last:border-0 ${
                n.unread ? "bg-brand-soft/40" : ""
              }`}
            >
              <span className="text-xl">{n.icon}</span>
              <div className="flex-1">
                <p className="text-[15px]">{n.text}</p>
                <span className="text-[13px] text-ink-soft">{n.time}</span>
              </div>
              {n.unread && (
                <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-5 text-[14px] text-ink-soft">
          Real notifications arrive when practice requests, feedback, points,
          and event reminders are wired to the database.
        </p>
      </Wrap>
    </Section>
  );
}

export default function NotificationsPage() {
  return (
    <WaitlistGate>
      <NotificationsPageInner />
    </WaitlistGate>
  );
}

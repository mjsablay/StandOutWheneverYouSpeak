"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { Wrap, Section, PageSkeleton } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/notifications");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id,kind,title,body,link,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Notification[]);
    setFetching(false);
  }, [supabase, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [user, load]);

  if (loading || !user) return <PageSkeleton />;

  const unread = rows.filter((r) => !r.read_at);

  const markAllRead = async () => {
    if (unread.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    load();
  };

  return (
    <Section className="py-10">
      <Wrap className="max-w-[720px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-semibold tracking-tight">
            Notifications
          </h1>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-warm"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              Mark all read
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {fetching ? (
            <div className="p-8 text-center text-[14px] text-ink-soft">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Bell
                className="mx-auto mb-3 h-8 w-8 text-ink-soft"
                strokeWidth={1.5}
              />
              <p className="text-[15px] font-medium">You&apos;re all caught up</p>
              <p className="mx-auto mt-1 max-w-[380px] text-[14px] text-ink-soft">
                Practice requests, feedback on your recordings, points earned
                and event reminders will appear here.
              </p>
            </div>
          ) : (
            rows.map((n) => {
              const inner = (
                <div
                  className={`flex items-start gap-4 border-b border-line px-6 py-4 last:border-b-0 ${
                    n.read_at ? "" : "bg-brand-soft/40"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-paper-warm">
                    <Bell className="h-4 w-4 text-ink-soft" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 text-[14px] text-ink-soft">{n.body}</p>
                    )}
                    <span className="mt-1 block text-[12.5px] text-ink-soft">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  {!n.read_at && (
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
                  )}
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })
          )}
        </div>
      </Wrap>
    </Section>
  );
}

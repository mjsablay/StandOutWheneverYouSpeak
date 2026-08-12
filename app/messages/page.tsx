"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Lock } from "lucide-react";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { useAuth, initialsOf } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Thread = {
  id: string;
  updated_at: string;
  is_demo: boolean;
  other: Participant | null;
  lastMessage: string;
  lastAt: string | null;
};

type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const timeAgo = (iso: string | null) => {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : new Date(iso).toLocaleDateString();
};

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const access = useAccess();
  const supabase = useMemo(() => createClient(), []);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [fetching, setFetching] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/messages");
  }, [loading, user, router]);

  const loadThreads = useCallback(async () => {
    if (!user) return;
    const { data: mine } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    const ids = (mine ?? []).map((m) => m.conversation_id as string);
    if (ids.length === 0) {
      setThreads([]);
      setFetching(false);
      return;
    }

    const [{ data: convos }, { data: parts }, { data: msgs }] =
      await Promise.all([
        supabase
          .from("conversations")
          .select("id,updated_at,is_demo")
          .in("id", ids)
          .order("updated_at", { ascending: false }),
        supabase
          .from("conversation_participants")
          .select("conversation_id,user_id,profiles(display_name,avatar_url)")
          .in("conversation_id", ids),
        supabase
          .from("messages")
          .select("conversation_id,body,created_at")
          .in("conversation_id", ids)
          .order("created_at", { ascending: false }),
      ]);

    const built: Thread[] = (convos ?? []).map((c) => {
      const others = (parts ?? []).filter(
        (p) => p.conversation_id === c.id && p.user_id !== user.id,
      );
      const prof = others[0] as unknown as
        | { user_id: string; profiles: { display_name: string | null; avatar_url: string | null } | null }
        | undefined;
      const last = (msgs ?? []).find((m) => m.conversation_id === c.id);
      return {
        id: c.id as string,
        updated_at: c.updated_at as string,
        is_demo: c.is_demo as boolean,
        other: prof
          ? {
              user_id: prof.user_id,
              display_name: prof.profiles?.display_name ?? null,
              avatar_url: prof.profiles?.avatar_url ?? null,
            }
          : null,
        lastMessage: (last?.body as string) ?? "No messages yet",
        lastAt: (last?.created_at as string) ?? null,
      };
    });

    setThreads(built);
    setActiveId((cur) => cur ?? built[0]?.id ?? null);
    setFetching(false);
  }, [supabase, user]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const { data } = await supabase
        .from("messages")
        .select("id,sender_id,body,created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as Msg[]);
    },
    [supabase],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) loadThreads();
    });
    return () => {
      cancelled = true;
    };
  }, [user, loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) loadMessages(activeId);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  if (loading || !user) return <PageSkeleton />;

  if (!access.fullAccess) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <Lock className="mx-auto mb-4 h-8 w-8 text-ink-soft" strokeWidth={1.75} />
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">
              Messaging is a member feature
            </h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Speakers&apos; Circle members can message each other to arrange
              practice sessions and swap feedback.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              See membership
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const active = threads.find((t) => t.id === activeId) ?? null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: activeId, sender_id: user.id, body });
    setSending(false);
    if (!error) {
      await loadMessages(activeId);
      await loadThreads();
    }
  };

  return (
    <Section className="py-10">
      <Wrap>
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight">
          Messages
        </h1>

        <div className="grid overflow-hidden rounded-2xl border border-line bg-white md:h-[600px] md:grid-cols-[320px_1fr]">
          {/* Thread list */}
          <div className="border-b border-line md:border-b-0 md:border-r md:overflow-y-auto">
            {fetching ? (
              <div className="p-6 text-[14px] text-ink-soft">Loading…</div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare
                  className="mx-auto mb-3 h-7 w-7 text-ink-soft"
                  strokeWidth={1.75}
                />
                <p className="text-[14px] text-ink-soft">
                  No conversations yet.
                </p>
              </div>
            ) : (
              threads.map((t) => {
                const isActive = t.id === activeId;
                const name = t.other?.display_name ?? "Member";
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition last:border-b-0 hover:bg-paper-warm ${
                      isActive ? "bg-brand-soft" : ""
                    }`}
                  >
                    <Avatar
                      initials={initialsOf(name)}
                      size={44}
                      src={t.other?.avatar_url}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[14.5px] font-semibold">
                          {name}
                        </span>
                        <span className="flex-shrink-0 text-[12px] text-ink-soft">
                          {timeAgo(t.lastAt)}
                        </span>
                      </div>
                      <p className="truncate text-[13px] text-ink-soft">
                        {t.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Thread */}
          <div className="flex min-h-[440px] flex-col">
            {!active ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <MessageSquare
                    className="mx-auto mb-3 h-8 w-8 text-ink-soft"
                    strokeWidth={1.5}
                  />
                  <p className="text-[15px] font-medium">
                    Select a conversation
                  </p>
                  <p className="mt-1 text-[14px] text-ink-soft">
                    Your messages with other members appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                  <Avatar
                    initials={initialsOf(active.other?.display_name ?? "M")}
                    size={38}
                    src={active.other?.avatar_url}
                  />
                  <div className="text-[15px] font-semibold">
                    {active.other?.display_name ?? "Member"}
                  </div>
                  {active.is_demo && (
                    <span className="ml-auto rounded-full bg-paper-warm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Test thread
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto bg-paper-warm/40 p-5">
                  {messages.length === 0 && (
                    <p className="py-8 text-center text-[14px] text-ink-soft">
                      No messages yet — say hello.
                    </p>
                  )}
                  {messages.map((m, i) => {
                    const mine = m.sender_id === user.id;
                    const prev = messages[i - 1];
                    const grouped = prev && prev.sender_id === m.sender_id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"} ${
                          grouped ? "mt-0.5" : "mt-3"
                        }`}
                      >
                        <div
                          className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
                            mine
                              ? "bg-brand text-white"
                              : "border border-line bg-white"
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <form
                  onSubmit={send}
                  className="flex items-center gap-2.5 border-t border-line px-4 py-3"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    className="flex-1 rounded-full border border-line bg-paper-warm px-4 py-2.5 text-[14.5px] outline-none focus:border-transparent focus:ring-2 focus:ring-brand"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    aria-label="Send"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" strokeWidth={2} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

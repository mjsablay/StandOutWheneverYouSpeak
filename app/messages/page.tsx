"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { CONVERSATIONS } from "@/lib/members";
import { useAuth } from "@/lib/mock-auth";

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading, hasFullAccess } = useAuth();
  const [activeSlug, setActiveSlug] = useState(CONVERSATIONS[0].slug);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/messages");
  }, [loading, user, router]);

  if (loading || !user) return <PageSkeleton />;

  const isMember = hasFullAccess;
  const active = CONVERSATIONS.find((c) => c.slug === activeSlug)!;

  if (!isMember) {
    return (
      <Section>
        <Wrap className="max-w-[560px]">
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-10 text-center">
            <div className="mb-3 text-4xl">💬</div>
            <h1 className="mb-2 text-2xl font-extrabold">
              Messaging is a member feature
            </h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Speakers&apos; Circle members can message each other, arrange
              practice sessions, and swap feedback.
            </p>
            <Link
              href="/checkout?next=/messages"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Upgrade — $10 CAD/mo
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  return (
    <Section>
      <Wrap>
        <h1 className="mb-6 text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight">
          Messages
        </h1>

        <div className="grid gap-5 overflow-hidden md:grid-cols-[300px_1fr]">
          {/* Conversation list */}
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {CONVERSATIONS.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveSlug(c.slug)}
                className={`flex w-full items-center gap-3.5 border-b border-line px-5 py-4 text-left transition last:border-0 hover:bg-paper-warm ${
                  c.slug === activeSlug ? "bg-brand-soft" : ""
                }`}
              >
                <Avatar initials={c.initials} size={42} variant={c.variant} />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-baseline justify-between gap-2">
                    <span className="truncate text-[14.5px] font-bold">
                      {c.name}
                    </span>
                    <span className="flex-shrink-0 text-[12px] text-ink-soft">
                      {c.time}
                    </span>
                  </div>
                  <p className="truncate text-[13px] leading-relaxed text-ink-soft">
                    {c.preview}
                  </p>
                </div>
                {c.unread && (
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand" />
                )}
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className="flex min-h-[440px] flex-col rounded-2xl border border-line bg-white">
            <div className="flex items-center gap-3.5 border-b border-line px-6 py-4">
              <Avatar
                initials={active.initials}
                size={42}
                variant={active.variant}
              />
              <div className="flex-1">
                <div className="text-[15px] font-bold leading-snug">
                  {active.name}
                </div>
                <Link
                  href={`/members/${active.slug}`}
                  className="text-[13px] font-semibold text-brand hover:underline"
                >
                  View profile
                </Link>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
              {active.thread.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-[14.5px] leading-relaxed ${
                    m.from === "me"
                      ? "ml-auto rounded-br-md bg-brand text-white"
                      : "mr-auto rounded-bl-md bg-paper-warm"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {sent.map((t, i) => (
                <div
                  key={`sent-${i}`}
                  className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-brand px-5 py-3.5 text-[14.5px] leading-relaxed text-white"
                >
                  {t}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                setSent((s) => [...s, draft.trim()]);
                setDraft("");
              }}
              className="flex gap-3 border-t border-line px-6 py-5"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 rounded-[10px] border border-line px-4 py-3 text-[14.5px] outline-none focus:border-transparent focus:ring-2 focus:ring-brand"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand px-6 py-3 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { FlaskConical, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/mock-auth";

/**
 * Test-data tools.
 *
 * Creates a conversation between you and another real member so the
 * messaging features can be exercised end to end. Everything created here is
 * flagged is_demo, so "Clear test data" removes it cleanly without touching
 * anything real.
 */

type Member = { id: string; display_name: string | null; email: string };

const SAMPLE_THREAD = [
  "Hi! I saw you're working on Handling Curveballs too — fancy a practice session this week?",
  "Yes please. I keep freezing when someone interrupts mid-point.",
  "Same. Thursday evening work for you? I'll play the difficult exec.",
];

const SAMPLE_NOTIFICATIONS = [
  { kind: "practice", title: "Practice request accepted", body: "Your session is confirmed for Thursday at 7pm." },
  { kind: "feedback", title: "New feedback on your recording", body: "Someone left notes on your Compelling Delivery attempt." },
  { kind: "points", title: "You earned 50 points", body: "Completed lesson: Impact Defined." },
];

export default function TestData({
  members,
  onChange,
}: {
  members: Member[];
  onChange: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [partner, setPartner] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const others = members.filter((m) => m.id !== user?.id);

  const say = (msg: string) => {
    setNote(msg);
    setTimeout(() => setNote(null), 3500);
  };

  const seedConversation = async () => {
    if (!user || !partner) return;
    setBusy("convo");

    const { data: convo, error: cErr } = await supabase
      .from("conversations")
      .insert({ created_by: user.id, is_demo: true })
      .select("id")
      .single();

    if (cErr || !convo) {
      say(cErr?.message ?? "Could not create conversation.");
      setBusy(null);
      return;
    }

    const { error: pErr } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: convo.id, user_id: user.id },
        { conversation_id: convo.id, user_id: partner },
      ]);

    if (pErr) {
      say(pErr.message);
      setBusy(null);
      return;
    }

    await supabase.from("messages").insert(
      SAMPLE_THREAD.map((body, i) => ({
        conversation_id: convo.id,
        sender_id: i % 2 === 0 ? partner : user.id,
        body,
      })),
    );

    setBusy(null);
    say("Test conversation created — open Messages to try it.");
    onChange();
  };

  const seedNotifications = async () => {
    if (!user) return;
    setBusy("notifs");
    const { error } = await supabase.from("notifications").insert(
      SAMPLE_NOTIFICATIONS.map((n) => ({ ...n, user_id: user.id, is_demo: true })),
    );
    setBusy(null);
    say(error ? error.message : "Test notifications created.");
    onChange();
  };

  const clearAll = async () => {
    setBusy("clear");
    await supabase.from("notifications").delete().eq("is_demo", true);
    await supabase.from("conversations").delete().eq("is_demo", true);
    setBusy(null);
    say("Test data cleared.");
    onChange();
  };

  return (
    <div className="mb-8 rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2.5 border-b border-line bg-paper-warm px-6 py-4">
        <FlaskConical className="h-[18px] w-[18px] text-ink-soft" strokeWidth={2} />
        <h2 className="font-semibold">Test data</h2>
        <span className="ml-auto text-[13px] text-ink-soft">
          Everything created here is marked as test and removable in one click
        </span>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-[15px] font-semibold">
            Create a conversation
          </h3>
          <p className="mb-3 text-[13.5px] text-ink-soft">
            Starts a thread between you and another member, with a few messages
            already in it.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="min-w-[180px] flex-1 rounded-lg border border-line px-3 py-2 text-[14px]"
            >
              <option value="">Choose a member…</option>
              {others.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name || m.email}
                </option>
              ))}
            </select>
            <button
              onClick={seedConversation}
              disabled={!partner || busy !== null}
              className="rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-dark disabled:opacity-45"
            >
              {busy === "convo" ? "Creating…" : "Create"}
            </button>
          </div>
          {others.length === 0 && (
            <p className="mt-2 text-[13px] text-ink-soft">
              You need at least one other member before you can test messaging.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-1.5 text-[15px] font-semibold">
            Create notifications
          </h3>
          <p className="mb-3 text-[13.5px] text-ink-soft">
            Adds three sample notifications to your own account.
          </p>
          <button
            onClick={seedNotifications}
            disabled={busy !== null}
            className="rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-warm disabled:opacity-45"
          >
            {busy === "notifs" ? "Creating…" : "Create samples"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
        <span className="text-[13.5px] text-ink-soft">
          {note ?? "Remove all test conversations and notifications."}
        </span>
        <button
          onClick={clearAll}
          disabled={busy !== null}
          className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[14px] font-semibold text-ink-soft hover:bg-paper-warm hover:text-ink disabled:opacity-45"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          {busy === "clear" ? "Clearing…" : "Clear test data"}
        </button>
      </div>
    </div>
  );
}

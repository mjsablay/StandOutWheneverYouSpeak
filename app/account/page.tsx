"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, Avatar, Check, PageSkeleton } from "@/components/ui";
import { useAuth, initialsOf, type MockUser } from "@/lib/mock-auth";

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[14.5px] text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-brand";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, updateProfile, signOut, hasFullAccess, isAdmin } =
    useAuth();
  const [edits, setEdits] = useState<Partial<MockUser>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/account");
  }, [loading, user, router]);

  if (loading || !user) return <PageSkeleton />;

  // Saved profile as the base, with any unsaved edits layered on top —
  // avoids syncing state in an effect.
  const form: Partial<MockUser> = { ...user, ...edits };

  const isMember = hasFullAccess;
  const set =
    (k: keyof MockUser) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEdits((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Section>
      <Wrap>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-3 inline-block text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
              Your profile
            </span>
            <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
              Showcase yourself.
            </h1>
            <p className="mt-2 max-w-[560px] text-[17px] text-ink-soft">
              Add a bio, your links, and where you study or work — so practice
              partners get to know you.
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="rounded-lg border border-line bg-white px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
          >
            Sign out
          </button>
        </div>

        {/* Membership status */}
        <div
          className={`mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6 ${
            isMember
              ? "border-accent bg-accent-soft"
              : "border-line bg-paper-warm"
          }`}
        >
          <div>
            <div className="mb-1 text-[13px] font-bold uppercase tracking-wider text-ink-soft">
              Membership
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-xl font-extrabold">
              {user.tier === "circle" ? "Speakers' Circle" : "Front Row (free)"}
              {isAdmin && (
                <span className="rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-white">
                  Administrator
                </span>
              )}
            </div>
            <p className="mt-1 text-[14px] text-ink-soft">
              {isMember
                ? "Everything unlocked — all lessons, AI practice, and the community."
                : "Preview lessons and free events. Upgrade for full access."}
            </p>
          </div>
          {isMember ? (
            <Link
              href="/community"
              className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
            >
              Go to community
            </Link>
          ) : (
            <Link
              href="/checkout?next=/account"
              className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-ink hover:bg-accent-dark"
            >
              Upgrade — $10 CAD/mo
            </Link>
          )}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="rounded-2xl border border-line bg-white p-8">
            <h2 className="mb-5 text-lg font-bold">Edit your profile</h2>

            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-semibold">
                Display name
              </label>
              <input
                className={field}
                value={form.name ?? ""}
                onChange={set("name")}
                placeholder="Aisha Khan"
              />
            </div>
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-semibold">
                Headline
              </label>
              <input
                className={field}
                value={form.headline ?? ""}
                onChange={set("headline")}
                placeholder="Marketing student · aspiring keynote speaker"
              />
            </div>
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-semibold">Bio</label>
              <textarea
                rows={4}
                className={`${field} resize-y`}
                value={form.bio ?? ""}
                onChange={set("bio")}
                placeholder="A few sentences about you and your speaking goals…"
              />
            </div>
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-semibold">
                LinkedIn URL
              </label>
              <input
                className={field}
                value={form.linkedin ?? ""}
                onChange={set("linkedin")}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">
                  School <span className="font-normal text-ink-soft">(optional)</span>
                </label>
                <input
                  className={field}
                  value={form.school ?? ""}
                  onChange={set("school")}
                  placeholder="University of Toronto"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">
                  Company <span className="font-normal text-ink-soft">(optional)</span>
                </label>
                <input
                  className={field}
                  value={form.company ?? ""}
                  onChange={set("company")}
                  placeholder="RBC"
                />
              </div>
            </div>
            <div className="mb-5 grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">Role</label>
                <input
                  className={field}
                  value={form.role ?? ""}
                  onChange={set("role")}
                  placeholder="Analyst"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">
                  Location
                </label>
                <input
                  className={field}
                  value={form.location ?? ""}
                  onChange={set("location")}
                  placeholder="Toronto, ON"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                await updateProfile(edits);
                setEdits({});
                setSaved(true);
                setTimeout(() => setSaved(false), 2200);
              }}
              className="w-full rounded-lg bg-accent px-5 py-3 font-semibold text-ink transition hover:bg-accent-dark"
            >
              {saved ? "Saved ✓" : "Save profile"}
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-line bg-white p-8">
            <h2 className="mb-5 text-lg font-bold">How members see you</h2>
            <div className="mb-4 flex items-center gap-4">
              <Avatar
                initials={initialsOf(form.name || user.email)}
                size={72}
                variant={isMember ? "accent" : "brand"}
              />
              <div>
                <div className="text-xl font-extrabold">
                  {form.name || "Your name"}
                </div>
                <div className="text-sm text-ink-soft">
                  {form.headline || "Add a headline"}
                </div>
              </div>
            </div>

            <p className="mb-3.5 text-[14.5px] text-ink-soft">
              {form.bio || "Your bio will appear here."}
            </p>

            <div className="mb-3.5 flex flex-wrap gap-2">
              {form.school && (
                <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  🎓 {form.school}
                </span>
              )}
              {form.company && (
                <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  💼 {form.role ? `${form.role} · ` : ""}
                  {form.company}
                </span>
              )}
              {form.location && (
                <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  📍 {form.location}
                </span>
              )}
            </div>

            {form.linkedin && (
              <a
                href={form.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand hover:underline"
              >
                LinkedIn ↗
              </a>
            )}

            <div className="mt-5 flex gap-7 border-t border-line pt-4">
              <div>
                <div className="text-xl font-extrabold">0</div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">
                  Points
                </div>
              </div>
              <div>
                <div className="text-xl font-extrabold">—</div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">
                  Rank
                </div>
              </div>
              <div>
                <div className="text-xl font-extrabold">🔥 0</div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">
                  Day streak
                </div>
              </div>
            </div>

            {!isMember && (
              <div className="mt-5 rounded-xl bg-paper-warm p-4 text-[14px] text-ink-soft">
                <Check /> Speakers&apos; Circle members appear in the community
                directory where others can request practice sessions.
              </div>
            )}
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

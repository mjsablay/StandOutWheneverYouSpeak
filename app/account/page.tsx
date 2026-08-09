"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, Avatar, Check, PageSkeleton } from "@/components/ui";
import { useAuth, initialsOf, type Profile } from "@/lib/mock-auth";
import {
  SCHOOLS,
  COMPANIES,
  ROLES,
  LOCATIONS,
  BIO_MAX,
  deriveHeadline,
} from "@/lib/profile-options";

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[14.5px] text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-brand";

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold">
      {children}
      {optional && (
        <span className="font-normal text-ink-soft"> (optional)</span>
      )}
    </label>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={field}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    loading,
    updateProfile,
    uploadAvatar,
    signOut,
    hasFullAccess,
    isAdmin,
  } = useAuth();

  const [edits, setEdits] = useState<Partial<Profile>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/account");
  }, [loading, user, router]);

  if (loading || !user) return <PageSkeleton />;

  const form: Partial<Profile> = { ...user, ...edits };
  const isMember = hasFullAccess;
  const bioLength = (form.bio ?? "").length;
  const bioOver = bioLength > BIO_MAX;

  const set =
    (k: keyof Profile) =>
    (v: string) =>
      setEdits((f) => ({ ...f, [k]: v }));

  const fullName =
    [form.first_name, form.last_name].filter(Boolean).join(" ").trim() ||
    "Your name";

  const previewHeadline = deriveHeadline({
    headline: form.headline,
    headline_mode: form.headline_mode,
    school: form.school,
    company: form.company,
    role_title: form.role_title,
  });

  return (
    <Section>
      <Wrap>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-3 inline-block text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
              Edit profile
            </span>
            <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
              Showcase yourself.
            </h1>
            <p className="mt-2 max-w-[560px] text-[17px] text-ink-soft">
              Add a photo, your details, and a short bio so practice partners
              get to know you.
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

        {/* Membership */}
        <div
          className={`mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6 ${
            isMember ? "border-accent bg-accent-soft" : "border-line bg-paper-warm"
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

        {error && (
          <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
            {error}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* ---------------- Editor ---------------- */}
          <div className="rounded-2xl border border-line bg-white p-8">
            <h2 className="mb-5 text-lg font-bold">Your details</h2>

            {/* Photo */}
            <div className="mb-6 flex items-center gap-5">
              <Avatar
                initials={initialsOf(fullName)}
                size={80}
                variant={isMember ? "accent" : "brand"}
                src={form.avatar_url}
                alt={fullName}
              />
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError(null);
                    const res = await uploadAvatar(file);
                    setUploading(false);
                    if (res.error) setError(res.error);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-warm disabled:opacity-60"
                >
                  {uploading
                    ? "Uploading…"
                    : form.avatar_url
                      ? "Change photo"
                      : "Upload photo"}
                </button>
                <p className="mt-2 text-[12.5px] text-ink-soft">
                  JPG, PNG or WebP · max 2 MB
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="first">First name</Label>
                <input
                  id="first"
                  className={field}
                  value={form.first_name ?? ""}
                  onChange={(e) => set("first_name")(e.target.value)}
                  placeholder="Aisha"
                />
              </div>
              <div>
                <Label htmlFor="last">Last name</Label>
                <input
                  id="last"
                  className={field}
                  value={form.last_name ?? ""}
                  onChange={(e) => set("last_name")(e.target.value)}
                  placeholder="Khan"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="mb-3.5">
              <Label htmlFor="headline" optional>
                Headline
              </Label>
              <input
                id="headline"
                className={field}
                value={form.headline ?? ""}
                onChange={(e) => set("headline")(e.target.value)}
                placeholder="Marketing student · aspiring keynote speaker"
              />
              <div className="mt-2.5 rounded-xl bg-paper-warm p-3.5">
                <div className="mb-2 text-[12.5px] font-semibold text-ink-soft">
                  If you leave the headline blank, show:
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["school", "My school"],
                      ["work", "My role & company"],
                      ["custom", "Nothing"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => set("headline_mode")(mode)}
                      className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition ${
                        (form.headline_mode ?? "custom") === mode
                          ? "bg-brand text-white"
                          : "border border-line bg-white hover:bg-white/60"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-3.5">
              <Label htmlFor="bio" optional>
                Bio
              </Label>
              <textarea
                id="bio"
                rows={4}
                maxLength={BIO_MAX}
                className={`${field} resize-y`}
                value={form.bio ?? ""}
                onChange={(e) => set("bio")(e.target.value)}
                placeholder="A few sentences about you and your speaking goals…"
              />
              <div
                className={`mt-1.5 text-right text-[12.5px] ${
                  bioLength > BIO_MAX - 40 ? "font-semibold text-brand" : "text-ink-soft"
                }`}
              >
                {bioLength} / {BIO_MAX}
              </div>
            </div>

            {/* Structured fields */}
            <div className="mb-3.5">
              <Label htmlFor="school" optional>
                School
              </Label>
              <Select
                id="school"
                value={form.school ?? ""}
                onChange={set("school")}
                options={SCHOOLS}
                placeholder="Select your school"
              />
            </div>

            <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="company" optional>
                  Company
                </Label>
                <Select
                  id="company"
                  value={form.company ?? ""}
                  onChange={set("company")}
                  options={COMPANIES}
                  placeholder="Select"
                />
              </div>
              <div>
                <Label htmlFor="role" optional>
                  Role
                </Label>
                <Select
                  id="role"
                  value={form.role_title ?? ""}
                  onChange={set("role_title")}
                  options={ROLES}
                  placeholder="Select"
                />
              </div>
            </div>

            <div className="mb-3.5">
              <Label htmlFor="location" optional>
                Location
              </Label>
              <Select
                id="location"
                value={form.location ?? ""}
                onChange={set("location")}
                options={LOCATIONS}
                placeholder="Select your location"
              />
            </div>

            <div className="mb-5">
              <Label htmlFor="linkedin" optional>
                LinkedIn profile URL
              </Label>
              <input
                id="linkedin"
                type="url"
                className={field}
                value={form.linkedin ?? ""}
                onChange={(e) => set("linkedin")(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
              <p className="mt-1.5 text-[12.5px] text-ink-soft">
                Shown on your profile as “{fullName} on LinkedIn”.
              </p>
            </div>

            <button
              disabled={bioOver}
              onClick={async () => {
                setError(null);
                const res = await updateProfile(edits);
                if (res.error) {
                  setError(res.error);
                  return;
                }
                setEdits({});
                setSaved(true);
                setTimeout(() => setSaved(false), 2200);
              }}
              className="w-full rounded-lg bg-accent px-5 py-3 font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-50"
            >
              {saved ? "Saved ✓" : "Save profile"}
            </button>
          </div>

          {/* ---------------- Preview ---------------- */}
          <div className="rounded-2xl border border-line bg-white p-8">
            <h2 className="mb-5 text-lg font-bold">How members see you</h2>

            <div className="mb-4 flex items-center gap-4">
              <Avatar
                initials={initialsOf(fullName)}
                size={72}
                variant={isMember ? "accent" : "brand"}
                src={form.avatar_url}
                alt={fullName}
              />
              <div>
                <div className="text-xl font-extrabold">{fullName}</div>
                <div className="text-sm text-ink-soft">
                  {previewHeadline || "Add a headline"}
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
                  💼 {form.role_title ? `${form.role_title} · ` : ""}
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
                {fullName} on LinkedIn ↗
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

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import PhotoFramer from "@/components/PhotoFramer";
import { useAuth, initialsOf, type Profile } from "@/lib/mock-auth";
import { LIMITS, deriveHeadline } from "@/lib/profile-options";

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand";

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  max,
  optional,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max: number;
  optional?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
        {label}
        {optional && <span className="font-normal text-ink-soft"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={field}
      />
    </div>
  );
}

/** LinkedIn-style visibility switch. */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
        checked ? "bg-brand" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
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
  const dirty = Object.keys(edits).length > 0;

  const set = (k: keyof Profile) => (v: string | boolean) =>
    setEdits((f) => ({ ...f, [k]: v }));

  const fullName =
    [form.first_name, form.last_name].filter(Boolean).join(" ").trim() ||
    "Your name";

  const headline = deriveHeadline({
    headline: form.headline,
    headline_mode: form.headline_mode,
    school: form.school,
    company: form.company,
    role_title: form.role_title,
  });

  const save = async () => {
    setError(null);
    const res = await updateProfile(edits);
    if (res.error) return setError(res.error);
    setEdits({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <Section>
      <Wrap className="max-w-[980px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight">
              Edit profile
            </h1>
            <p className="mt-1.5 text-[16px] text-ink-soft">
              This is how you appear to other members.
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

        {error && (
          <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
            {error}
          </div>
        )}

        {/* ---------- Preview card (LinkedIn style) ---------- */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="h-24 bg-brand" />
          <div className="px-7 pb-7">
            <div className="-mt-12 mb-4">
              <span className="inline-block rounded-full border-4 border-white bg-white">
                <Avatar
                  initials={initialsOf(fullName)}
                  size={96}
                  variant={isMember ? "accent" : "brand"}
                  src={form.avatar_url}
                  position={form.avatar_position}
                  alt={fullName}
                />
              </span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-extrabold tracking-tight">
                  {fullName}
                </h2>
                {headline && (
                  <p className="text-[15.5px] text-ink-soft">{headline}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-ink-soft">
                  {form.show_location !== false && form.location && (
                    <span>{form.location}</span>
                  )}
                  {form.linkedin && (
                    <>
                      {form.show_location !== false && form.location && (
                        <span aria-hidden>·</span>
                      )}
                      <a
                        href={form.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand hover:underline"
                      >
                        {fullName} on LinkedIn
                      </a>
                    </>
                  )}
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-[12.5px] font-bold ${
                  isMember
                    ? "bg-accent-soft text-accent-ink"
                    : "bg-brand-soft text-brand"
                }`}
              >
                {isAdmin
                  ? "Administrator"
                  : user.tier === "circle"
                    ? "Speakers' Circle"
                    : "Front Row"}
              </span>
            </div>

            {form.bio && (
              <p className="mt-4 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
                {form.bio}
              </p>
            )}

            {((form.show_school !== false && form.school) ||
              (form.show_company !== false && form.company)) && (
              <div className="mt-5 space-y-2.5 border-t border-line pt-4">
                {form.show_school !== false && form.school && (
                  <div className="flex items-center gap-2.5 text-[14.5px]">
                    <span aria-hidden>🎓</span>
                    <span>{form.school}</span>
                  </div>
                )}
                {form.show_company !== false && form.company && (
                  <div className="flex items-center gap-2.5 text-[14.5px]">
                    <span aria-hidden>💼</span>
                    <span>
                      {form.role_title ? `${form.role_title} at ` : ""}
                      {form.company}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Photo ---------- */}
        <div className="mb-6 rounded-2xl border border-line bg-white p-7">
          <h3 className="mb-1 text-[17px] font-bold">Profile photo</h3>
          <p className="mb-5 text-[14px] text-ink-soft">
            Drag the photo or use the sliders to frame your face.
          </p>

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

          {form.avatar_url ? (
            <>
              <PhotoFramer
                src={form.avatar_url}
                value={form.avatar_position ?? "50% 50%"}
                onChange={(pos) => set("avatar_position")(pos)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-5 rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-warm disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Replace photo"}
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-5">
              <Avatar initials={initialsOf(fullName)} size={96} />
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload a photo"}
                </button>
                <p className="mt-2 text-[12.5px] text-ink-soft">
                  JPG, PNG or WebP · max 2 MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---------- Basics ---------- */}
        <div className="mb-6 rounded-2xl border border-line bg-white p-7">
          <h3 className="mb-5 text-[17px] font-bold">Basics</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="first"
              label="First name"
              value={form.first_name ?? ""}
              onChange={set("first_name")}
              placeholder="Aisha"
              max={LIMITS.firstName}
            />
            <Field
              id="last"
              label="Last name"
              value={form.last_name ?? ""}
              onChange={set("last_name")}
              placeholder="Khan"
              max={LIMITS.lastName}
            />
          </div>

          <div className="mb-4">
            <Field
              id="headline"
              label="Headline"
              value={form.headline ?? ""}
              onChange={set("headline")}
              placeholder="Marketing student · aspiring keynote speaker"
              max={LIMITS.headline}
              optional
            />
            <div className="mt-2.5 rounded-xl bg-paper-warm p-3.5">
              <div className="mb-2 text-[12.5px] font-semibold text-ink-soft">
                If you leave this blank, show instead:
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

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-[13px] font-semibold">
              Bio <span className="font-normal text-ink-soft">(optional)</span>
            </label>
            <textarea
              id="bio"
              rows={4}
              maxLength={LIMITS.bio}
              value={form.bio ?? ""}
              onChange={(e) => set("bio")(e.target.value)}
              placeholder="A few sentences about you and your speaking goals…"
              className={`${field} resize-y`}
            />
            <div
              className={`mt-1.5 text-right text-[12.5px] ${
                bioLength > LIMITS.bio - 40
                  ? "font-semibold text-brand"
                  : "text-ink-soft"
              }`}
            >
              {bioLength} / {LIMITS.bio}
            </div>
          </div>
        </div>

        {/* ---------- Details + visibility ---------- */}
        <div className="mb-6 rounded-2xl border border-line bg-white p-7">
          <h3 className="mb-1 text-[17px] font-bold">Details</h3>
          <p className="mb-5 text-[14px] text-ink-soft">
            Use the switches to choose what other members can see.
          </p>

          {/* School */}
          <div className="mb-4 border-b border-line pb-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-[14px] font-semibold">Show my school</span>
              <Toggle
                label="Show my school"
                checked={form.show_school !== false}
                onChange={(v) => set("show_school")(v)}
              />
            </div>
            <Field
              id="school"
              label="School"
              value={form.school ?? ""}
              onChange={set("school")}
              placeholder="University of Toronto"
              max={LIMITS.school}
              optional
            />
          </div>

          {/* Work */}
          <div className="mb-4 border-b border-line pb-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-[14px] font-semibold">
                Show my role &amp; company
              </span>
              <Toggle
                label="Show my role and company"
                checked={form.show_company !== false}
                onChange={(v) => set("show_company")(v)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="company"
                label="Company"
                value={form.company ?? ""}
                onChange={set("company")}
                placeholder="RBC"
                max={LIMITS.company}
                optional
              />
              <Field
                id="role"
                label="Role"
                value={form.role_title ?? ""}
                onChange={set("role_title")}
                placeholder="Analyst"
                max={LIMITS.role}
                optional
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-4 border-b border-line pb-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-[14px] font-semibold">Show my location</span>
              <Toggle
                label="Show my location"
                checked={form.show_location !== false}
                onChange={(v) => set("show_location")(v)}
              />
            </div>
            <Field
              id="location"
              label="Location"
              value={form.location ?? ""}
              onChange={set("location")}
              placeholder="Toronto, ON"
              max={LIMITS.location}
              optional
            />
          </div>

          <Field
            id="linkedin"
            label="LinkedIn profile URL"
            type="url"
            value={form.linkedin ?? ""}
            onChange={set("linkedin")}
            placeholder="https://linkedin.com/in/username"
            max={LIMITS.linkedin}
            optional
          />
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Appears as “{fullName} on LinkedIn”.
          </p>
        </div>

        {/* ---------- Save bar ---------- */}
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-[0_8px_28px_rgba(20,24,31,.10)]">
          <span className="text-[14px] text-ink-soft">
            {saved
              ? "All changes saved."
              : dirty
                ? "You have unsaved changes."
                : "Everything is up to date."}
          </span>
          <div className="flex gap-3">
            {dirty && (
              <button
                onClick={() => setEdits({})}
                className="rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
              >
                Discard
              </button>
            )}
            <button
              onClick={save}
              disabled={!dirty}
              className="rounded-lg bg-accent px-6 py-2.5 text-[14.5px] font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-45"
            >
              {saved ? "Saved ✓" : "Save changes"}
            </button>
          </div>
        </div>

        {!isMember && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper-warm p-6">
            <p className="max-w-[520px] text-[14.5px] text-ink-soft">
              Speakers&apos; Circle members appear in the community directory,
              where others can find them and request practice sessions.
            </p>
            <Link
              href="/checkout?next=/account"
              className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
            >
              Upgrade
            </Link>
          </div>
        )}
      </Wrap>
    </Section>
  );
}

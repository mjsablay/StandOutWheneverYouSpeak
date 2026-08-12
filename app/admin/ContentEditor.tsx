"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Plus, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import {
  CONTENT_KEYS,
  FALLBACK_HERO,
  FALLBACK_STATS,
  emptyFounder,
  initialsFrom,
  type AboutHero,
  type AboutStat,
  type Founder,
} from "@/lib/content";

/**
 * Edits the About page without touching code.
 * Everything here is public marketing copy — see the site_content table.
 */

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[14.5px] outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand";

export default function ContentEditor() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [hero, setHero] = useState<AboutHero>(FALLBACK_HERO);
  const [stats, setStats] = useState<AboutStat[]>(FALLBACK_STATS);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("site_content").select("key,value");
    const byKey = Object.fromEntries(
      (data ?? []).map((r) => [r.key as string, r.value]),
    );
    if (byKey[CONTENT_KEYS.aboutHero]) setHero(byKey[CONTENT_KEYS.aboutHero]);
    if (byKey[CONTENT_KEYS.aboutStats]) setStats(byKey[CONTENT_KEYS.aboutStats]);
    if (byKey[CONTENT_KEYS.aboutFounders])
      setFounders(byKey[CONTENT_KEYS.aboutFounders]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const save = async () => {
    setSaving(true);
    setNote(null);
    const rows = [
      { key: CONTENT_KEYS.aboutHero, value: hero, updated_by: user?.id ?? null },
      { key: CONTENT_KEYS.aboutStats, value: stats, updated_by: user?.id ?? null },
      {
        key: CONTENT_KEYS.aboutFounders,
        value: founders,
        updated_by: user?.id ?? null,
      },
    ];
    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    setNote(error ? error.message : "Saved. The About page updates within a minute.");
    setTimeout(() => setNote(null), 5000);
  };

  const setFounder = (i: number, patch: Partial<Founder>) =>
    setFounders((f) => f.map((x, n) => (n === i ? { ...x, ...patch } : x)));

  const applyMyProfile = (i: number) => {
    if (!user?.avatar_url) {
      setNote("Upload a photo on your profile first.");
      setTimeout(() => setNote(null), 4000);
      return;
    }
    setFounder(i, {
      photo_url: user.avatar_url,
      photo_position: user.avatar_position ?? "50% 50%",
      linkedin: user.linkedin || "",
    });
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 border-b border-line bg-paper-warm px-6 py-4 text-left"
      >
        <FileText className="h-[18px] w-[18px] text-ink-soft" strokeWidth={2} />
        <h2 className="font-semibold">About page content</h2>
        <span className="ml-auto text-[13px] text-ink-soft">
          {open ? "Hide" : "Edit headline, stats and founder bios"}
        </span>
      </button>

      {open && (
        <div className="p-6">
          {loading ? (
            <p className="py-6 text-center text-[14px] text-ink-soft">
              Loading…
            </p>
          ) : (
            <>
              {/* Hero */}
              <section className="mb-8">
                <h3 className="mb-3 text-[15px] font-semibold">Headline</h3>
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <input
                    className={field}
                    value={hero.headline}
                    onChange={(e) =>
                      setHero({ ...hero, headline: e.target.value })
                    }
                    placeholder="First line"
                  />
                  <input
                    className={field}
                    value={hero.headline_accent}
                    onChange={(e) =>
                      setHero({ ...hero, headline_accent: e.target.value })
                    }
                    placeholder="Second line (shown in blue)"
                  />
                </div>
                <textarea
                  rows={3}
                  className={`${field} resize-y`}
                  value={hero.body}
                  onChange={(e) => setHero({ ...hero, body: e.target.value })}
                  placeholder="Supporting paragraph"
                />
              </section>

              {/* Stats */}
              <section className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold">Proof numbers</h3>
                  <button
                    onClick={() =>
                      setStats([...stats, { figure: "", label: "" }])
                    }
                    className="flex items-center gap-1.5 text-[13.5px] font-semibold text-brand hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Add
                  </button>
                </div>
                <div className="space-y-2.5">
                  {stats.map((s, i) => (
                    <div key={i} className="flex gap-2.5">
                      <input
                        className={`${field} max-w-[160px]`}
                        value={s.figure}
                        onChange={(e) =>
                          setStats(
                            stats.map((x, n) =>
                              n === i ? { ...x, figure: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="3,000+"
                      />
                      <input
                        className={field}
                        value={s.label}
                        onChange={(e) =>
                          setStats(
                            stats.map((x, n) =>
                              n === i ? { ...x, label: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="people coached"
                      />
                      <button
                        onClick={() =>
                          setStats(stats.filter((_, n) => n !== i))
                        }
                        aria-label="Remove"
                        className="rounded-lg border border-line px-3 text-ink-soft hover:bg-paper-warm"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Founders */}
              <section className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold">Founders</h3>
                  <button
                    onClick={() => setFounders([...founders, emptyFounder()])}
                    className="flex items-center gap-1.5 text-[13.5px] font-semibold text-brand hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Add person
                  </button>
                </div>

                <div className="space-y-5">
                  {founders.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-line p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-4">
                        <Avatar
                          initials={f.initials || initialsFrom(f.name)}
                          size={56}
                          src={f.photo_url || null}
                          position={f.photo_position}
                          variant={f.dark ? "brand" : "accent"}
                        />
                        <button
                          onClick={() => applyMyProfile(i)}
                          className="rounded-lg border border-line px-3.5 py-2 text-[13.5px] font-semibold hover:bg-paper-warm"
                        >
                          Use my profile photo &amp; LinkedIn
                        </button>
                        <button
                          onClick={() =>
                            setFounders(founders.filter((_, n) => n !== i))
                          }
                          className="ml-auto flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Remove
                        </button>
                      </div>

                      <div className="mb-3 grid gap-3 sm:grid-cols-2">
                        <input
                          className={field}
                          value={f.name}
                          onChange={(e) =>
                            setFounder(i, { name: e.target.value })
                          }
                          placeholder="Full name"
                        />
                        <input
                          className={field}
                          value={f.role}
                          onChange={(e) =>
                            setFounder(i, { role: e.target.value })
                          }
                          placeholder="Founder & Head Coach"
                        />
                      </div>

                      <input
                        className={`${field} mb-3`}
                        value={f.headline}
                        onChange={(e) =>
                          setFounder(i, { headline: e.target.value })
                        }
                        placeholder="Managing Director, Black Isle Consultants"
                      />

                      <label className="mb-1.5 block text-[13px] font-semibold">
                        Credential chips
                        <span className="font-normal text-ink-soft">
                          {" "}
                          — one per line
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        className={`${field} mb-3 resize-y`}
                        value={f.credentials.join("\n")}
                        onChange={(e) =>
                          setFounder(i, {
                            credentials: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder={"3,000+ people coached\n10 years teaching"}
                      />

                      <label className="mb-1.5 block text-[13px] font-semibold">
                        Bio
                      </label>
                      <textarea
                        rows={5}
                        className={`${field} mb-3 resize-y`}
                        value={f.bio}
                        onChange={(e) => setFounder(i, { bio: e.target.value })}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          className={field}
                          value={f.linkedin}
                          onChange={(e) =>
                            setFounder(i, { linkedin: e.target.value })
                          }
                          placeholder="https://linkedin.com/in/username"
                        />
                        <input
                          className={field}
                          value={f.photo_url}
                          onChange={(e) =>
                            setFounder(i, { photo_url: e.target.value })
                          }
                          placeholder="Photo URL (or use the button above)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-accent px-6 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-accent-dark disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <a
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                  View the page
                </a>
                {note && (
                  <span className="text-[14px] text-ink-soft">{note}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Profile field limits and display helpers.
 *
 * Fields are freeform text (people's schools, employers and cities are too
 * varied for a fixed list), but every one is length-capped both here and by
 * a CHECK constraint in the database, so a profile can't be used to publish
 * arbitrary content.
 */

export const LIMITS = {
  firstName: 50,
  lastName: 50,
  headline: 120,
  bio: 300,
  school: 80,
  company: 80,
  role: 80,
  location: 80,
  linkedin: 200,
} as const;

/** Kept for backwards compatibility with existing imports. */
export const BIO_MAX = LIMITS.bio;

export type HeadlineMode = "custom" | "school" | "work";

/** Builds the headline shown on a profile, based on the member's choice. */
export function deriveHeadline(p: {
  headline?: string | null;
  headline_mode?: HeadlineMode | null;
  school?: string | null;
  company?: string | null;
  role_title?: string | null;
}): string {
  if (p.headline?.trim()) return p.headline.trim();

  if (p.headline_mode === "school" && p.school) {
    return `Student at ${p.school}`;
  }

  if (p.headline_mode === "work") {
    if (p.role_title && p.company) return `${p.role_title} at ${p.company}`;
    if (p.company) return p.company;
    if (p.role_title) return p.role_title;
  }

  return "";
}

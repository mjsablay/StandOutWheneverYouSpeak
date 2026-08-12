/**
 * Editable site copy.
 *
 * Lives in the `site_content` table so it can be changed from the admin
 * console without a code change or deploy. Anything here is public by
 * definition — never put private data in this table.
 */

export type AboutHero = {
  headline: string;
  headline_accent: string;
  body: string;
};

export type AboutStat = {
  figure: string;
  label: string;
};

export type Founder = {
  name: string;
  initials: string;
  role: string;
  headline: string;
  credentials: string[];
  bio: string;
  linkedin: string;
  photo_url: string;
  photo_position: string;
  dark: boolean;
};

export const CONTENT_KEYS = {
  aboutHero: "about.hero",
  aboutStats: "about.stats",
  aboutFounders: "about.founders",
} as const;

/** Used if the database is unreachable, so pages never render blank. */
export const FALLBACK_HERO: AboutHero = {
  headline: "Speaking well isn't a talent.",
  headline_accent: "It's a method you can learn.",
  body: "Stand Out exists because that method already works — it has for thousands of people, in boardrooms and lecture halls across the country.",
};

export const FALLBACK_STATS: AboutStat[] = [
  { figure: "3,000+", label: "people coached" },
  { figure: "10 years", label: "of teaching this method" },
  { figure: "35", label: "organisations trained" },
];

export const emptyFounder = (): Founder => ({
  name: "",
  initials: "",
  role: "",
  headline: "",
  credentials: [],
  bio: "",
  linkedin: "",
  photo_url: "",
  photo_position: "50% 50%",
  dark: false,
});

/** Initials from a full name, for the avatar fallback. */
export const initialsFrom = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

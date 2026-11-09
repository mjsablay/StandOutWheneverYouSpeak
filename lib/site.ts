/**
 * Central content + config for the marketing site.
 * Editing copy here updates it everywhere it appears.
 */

import { PLAN } from "@/lib/pricing";

/** The AI practice coach, as Barry named her in the programme blueprint. */
export const COACH_NAME = "Katya";

export const SITE = {
  name: "Stand Out Whenever You Speak",
  tagline: "Speak with impact and influence",
  /** Kept in lib/pricing.ts so nothing on the site can quote a stale price. */
  price: `$${PLAN.amount}`,
  currency: PLAN.currency,
} as const;

/**
 * PRE-LAUNCH MODE
 * ---------------
 * While true, the public sees only the waitlist home, About Us and Contact;
 * courses, events, community, leaderboard and pricing are hidden from the
 * navigation and redirect to the home page. Approved members and admins get
 * the whole site — cohorts are let in while the door stays shut to everyone
 * else. Pending and declined accounts see the waitlist holding page.
 *
 * Set to false to open the full site to anyone who signs up. That single
 * change is the public launch.
 */
export const PRELAUNCH = true;

/** Paths anyone may visit during pre-launch. */

export const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About Us" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

/** The reduced navigation shown during pre-launch. */
export const PRELAUNCH_NAV_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

export const COMPANIES: [string, string][] = [
  ["RBC", "rbc"],
  ["BMO", "bmo"],
  ["CIBC", "cibc"],
  ["Citibank", "citi"],
  ["Peoples Bank", "peoples-bank"],
  ["MaRS", "mars"],
  ["Manulife", "manulife"],
  ["Lubrizol", "lubrizol"],
  ["TJX Canada", "tjx"],
  ["Kijiji", "kijiji"],
  ["Indeed", "indeed"],
  ["Samsung", "samsung"],
  ["Nissan", "nissan"],
  ["Schindler", "schindler"],
  ["GM", "gm"],
  ["Fortinet", "fortinet"],
  ["Air Canada", "air-canada"],
  ["Deloitte", "deloitte"],
  ["Wrigley", "wrigley"],
  ["University of Toronto", "uoft"],
  ["The Globe and Mail", "globe-and-mail"],
  ["Canaccord", "canaccord"],
  ["Merrithew", "merrithew"],
  ["VGW", "vgw"],
  ["CPA Canada", "cpa"],
  ["EQ Bank", "equitable"],
  ["401 Group of Companies", "401-group"],
  ["Maersk", "maersk"],
  ["Coeur Mining", "coeur"],
  ["Maple Reinders", "maple-reinders"],
  ["Desjardins", "desjardins"],
  ["Kenaidan", "kenaidan"],
  ["Sani Marc", "sani-marc"],
  ["Smart Centres", "smartcentres"],
  ["Sunlife", "sunlife"],
];

// Course + lesson structure now lives in lib/courses.ts (it carries video
// filenames and per-lesson slugs). Import COURSES from there.




/**
 * How points are earned. `live` means the platform actually awards it today
 * (see migration 0008 — points come from a database trigger, never from the
 * browser). The rest are planned and shown as such, so the leaderboard never
 * promises something that can't happen yet.
 */
export const POINTS_RULES = [
  { label: "Watch a lesson", points: 50, live: true },
  { label: "Pass a lesson quiz", points: 25, live: true },
  { label: "AI practice session", points: 15, live: false },
  { label: "Live peer practice session", points: 40, live: false },
  { label: "Give feedback on a member's recording", points: 20, live: false },
  { label: "Attend a live event", points: 40, live: false },
  { label: "Finish a full course", points: 300, live: false },
  { label: "7-day streak bonus", points: 100, live: false },
] as const;

/**
 * Public team details.
 * Email addresses are deliberately NOT listed — published addresses get
 * scraped and spammed. All contact goes through the request form.
 */
/**
 * Public team details.
 * Photos, headlines, bios and LinkedIn come from each founder's own profile
 * (see the team_profiles view) — the text here is the fallback.
 * Email addresses are deliberately absent: published addresses get scraped.
 */
export const TEAM = [
  {
    initials: "BK",
    name: "Barry Kuntz",
    role: "Founder & Head Coach",
    headline: "Founder, CLEAR Executive and Corporate Development · Author of Pause",
    credentials: [
      "3,500+ leaders coached",
      "17 years coaching",
      "Author of Pause",
    ],
    bio: "Barry has spent 17 years coaching leaders to speak with impact — more than 3,500 executives, senior managers and emerging leaders since founding CLEAR Executive and Corporate Development in 2009. Before that came a career in business leadership, including senior roles at General Motors of Canada in sales, marketing and public affairs, so he knows the pressure of a boardroom from both sides of the table. His clients have included RBC, BMO, Manulife, Air Canada, Deloitte, McKinsey and Samsung, along with university presidents, TEDx speakers and Dragons' Den contestants. His method rests on a single conviction: speaking with impact is a skill you learn, not a talent you're born with.",
    contactBlurb:
      "Coaching, curriculum, and corporate or team-training enquiries.",
    dark: true,
  },
  {
    initials: "MS",
    name: "Michael Jordan Sablay",
    role: "Co-Founder",
    headline: "Manager, Office of Generative AI at Deloitte",
    credentials: [
      "15,000 professionals enabled",
      "$500M+ transformations",
      "250+ consultants taught",
    ],
    bio: "Michael leads the Value Analytics and AI adoption strategy inside Deloitte's Office of Generative AI, where he built the enablement programme now reaching roughly 15,000 professionals across Canada and Chile. Eight years of delivering $500M+ enterprise transformations taught him that the work turns on something no system handles for you: holding a room, briefing an executive, making a complicated thing land. He teaches that skill too — 10 leadership programmes at Deloitte University for 250+ consultants, and six professionals he coaches directly. He's building Stand Out so the practice that used to require a room full of people is available to anyone, any time.",
    contactBlurb: "Partnerships, platform, product, and general enquiries.",
    dark: false,
  },
];

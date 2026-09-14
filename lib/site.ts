/**
 * Central content + config for the marketing site.
 * Editing copy here updates it everywhere it appears.
 */

/** The AI practice coach, as Barry named her in the programme blueprint. */
export const COACH_NAME = "Katya";

export const SITE = {
  name: "Stand Out Whenever You Speak",
  tagline: "Speak with impact and influence",
  price: "$10",
  currency: "CAD",
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
  { href: "/courses", label: "Courses" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
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

export const FAQS = [
  [
    "How do I get access?",
    "Request a place with your email, and we'll review it. We're opening Stand Out in stages so each intake gets proper attention, and you'll get an email as soon as your place is ready. There's no charge to request access.",
  ],
  [
    "What's the difference between the Front Row and Speakers' Circle?",
    "Front Row is free — you get selected lessons, free live events, and a spot on the leaderboard. Speakers' Circle ($10 CAD/month) unlocks every lesson, practice with Katya — your Speak with Impact coach — the full member community, and all live workshops and cohort classes.",
  ],
  [
    "How much does it cost?",
    "Speakers' Circle is $10 CAD per month. There's no long-term commitment — cancel anytime, and the Front Row plan is free forever.",
  ],
  [
    "What's the difference between Leadership Voice and Campus Voice?",
    "Leadership Voice is built for professionals — influencing colleagues, clients, and management. Campus Voice is built for students — speaking up in class, interviews, and group projects. Campus Voice is coming soon.",
  ],
  [
    "Do I need any public speaking experience?",
    "Not at all. Eight out of ten people feel nervous presenting — the courses start from the fundamentals and build up, whether you're a nervous beginner or an experienced speaker looking to sharpen.",
  ],
  [
    "How does the AI practice work?",
    "Katya is your Speak with Impact practice coach. You meet her at the end of Lesson 5B with your self-introduction, and in Speakers' Circle you bring her a two-to-three-minute presentation on any of 80 topics. Choose where you want help — your Frame, your Masterful Notes or your Delivery — and she coaches one thing at a time: a strength, one priority improvement, then you try again. She scores against Barry's rubric when you ask.",
  ],
  [
    "Can I practice with real people?",
    "Yes. Speakers' Circle members get access to the community, where you can find practice partners, join peer practice nights, and post recordings for feedback.",
  ],
  [
    "How do points and the leaderboard work?",
    "You earn points for watching lessons and passing their quizzes today, with practice sessions, feedback and live events joining as those features open. Points place you on the leaderboard and reward showing up consistently.",
  ],
  [
    "Who teaches the courses?",
    "The curriculum comes from Barry Kuntz, founder of CLEAR Executive and Corporate Development, who has coached more than 3,500 leaders to speak with impact over 17 years.",
  ],
] as const;

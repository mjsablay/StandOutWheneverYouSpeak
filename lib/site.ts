/**
 * Central content + config for the marketing site.
 * Editing copy here updates it everywhere it appears.
 */

export const SITE = {
  name: "Stand Out Whenever You Speak",
  tagline: "Speak with impact and influence",
  price: "$10",
  currency: "CAD",
} as const;

/**
 * PRE-LAUNCH MODE
 * ---------------
 * While true, everyone except administrators sees only the waitlist home,
 * About Us and Contact. Courses, events, community, leaderboard and pricing
 * are hidden from the navigation and redirect to the home page.
 *
 * Set to false to open the full site. That single change is the launch.
 */
export const PRELAUNCH = true;

/** Paths anyone may visit during pre-launch. */
export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/signin",
  "/signup",
  "/auth",
] as const;

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

export const COURSE_LINKS = [
  { href: "/courses#leadership-voice", label: "Leadership Voice", soon: false },
  { href: "/courses#campus-voice", label: "Campus Voice", soon: true },
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
  ["Equitable Bank", "equitable"],
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

export const UPCOMING_EVENTS = [
  {
    month: "Jul",
    day: "30",
    title: "Peer Practice Night — Spontaneous Speaking",
    details: "6:30 PM ET · Zoom · Small-group breakout rooms",
    tier: "member" as const,
  },
  {
    month: "Aug",
    day: "06",
    title: "Open House — What It Takes to Speak Like a Pro",
    details: "7:00 PM ET · Zoom · Open to everyone",
    tier: "free" as const,
  },
  {
    month: "Aug",
    day: "13",
    title: "Handling Curveballs — Live Workshop",
    details: "7:00 PM ET · Zoom · Hosted by Barry Kuntz",
    tier: "member" as const,
  },
];

export const PAST_EVENTS = [
  {
    month: "Jul",
    day: "16",
    title: "Storytelling for Impact — Workshop",
    details: "Recap & recording available to members",
  },
  {
    month: "Jul",
    day: "09",
    title: "Managing Nerves — Open House",
    details: "Recap & recording available to members",
  },
];

export const LEADERBOARD = [
  { rank: 1, initials: "AK", name: "Aisha K.", streak: 21, points: 2485 },
  { rank: 2, initials: "PR", name: "Priya R.", streak: 14, points: 2210 },
  { rank: 3, initials: "DM", name: "Daniel M.", streak: 9, points: 1940 },
  { rank: 4, initials: "JT", name: "Jordan T.", streak: 6, points: 1720 },
  { rank: 5, initials: "SL", name: "Sam L.", streak: 3, points: 1455 },
];

export const POINTS_RULES = [
  ["Complete a lesson", 50],
  ["Submit a lesson exercise", 25],
  ["AI practice session", 15],
  ["Live peer practice session", 40],
  ["Give feedback on a member's recording", 20],
  ["Attend a live event", 40],
  ["Finish a full course", 300],
  ["7-day streak bonus", 100],
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
    headline: "Managing Director, Black Isle Consultants · Author of Pause",
    credentials: [
      "3,000+ people coached",
      "10 years teaching",
      "Author of Pause",
    ],
    bio: "Barry has spent the last decade teaching people how to structure a presentation for impact and deliver it with compelling style — more than 3,000 of them, across banks, law firms, universities and boardrooms. His method rests on a single conviction: speaking with impact is a critical life skill, not a talent you're born with. Everything in this platform comes from that work.",
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
    "Front Row is free — you get selected lessons, free live events, and a spot on the leaderboard. Speakers' Circle ($10 CAD/month) unlocks every lesson, unlimited AI practice, the full member community, and all live workshops and cohort classes.",
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
    "Your AI speaking coach runs realistic practice sessions — throwing curveball questions, interrupting like a real audience, and giving feedback on your structure and delivery. Every session remembers the last, so your weak spots become your reps.",
  ],
  [
    "Can I practice with real people?",
    "Yes. Speakers' Circle members get access to the community, where you can find practice partners, join peer practice nights, and post recordings for feedback.",
  ],
  [
    "How do points and the leaderboard work?",
    "You earn points for completing lessons, practicing, giving feedback, and attending events. Points place you on the leaderboard and reward showing up consistently — including streak bonuses for practicing multiple days in a row.",
  ],
  [
    "Who teaches the courses?",
    "The curriculum comes from Barry Kuntz, Managing Director of Black Isle Consultants, who has taught over 3,000 people to speak with impact over the past decade.",
  ],
] as const;

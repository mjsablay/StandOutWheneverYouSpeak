/**
 * Demo member directory.
 * Single source of truth for the leaderboard, community, and member profiles
 * so the same person shows consistent data everywhere.
 * Replaced by the `profiles` table in Supabase later.
 */

export type Member = {
  slug: string;
  initials: string;
  name: string;
  headline: string;
  bio: string;
  school?: string;
  company?: string;
  role?: string;
  location: string;
  linkedin: string;
  email: string;
  working: string;
  course: string;
  focus: string[];
  points: number;
  rank: number;
  streak: number;
  variant: "brand" | "accent" | "dark";
  badges: string[];
};

export const MEMBERS: Member[] = [
  {
    slug: "aisha-khan",
    initials: "AK",
    name: "Aisha Khan",
    headline: "Marketing student · aspiring keynote speaker",
    bio: "Third-year marketing student working on speaking up in interviews and pitching with confidence. Always up for a practice session on storytelling.",
    school: "University of Toronto",
    company: "RBC",
    role: "Marketing Intern",
    location: "Toronto, ON",
    linkedin: "https://linkedin.com/in/aishakhan",
    email: "aisha.khan@example.com",
    working: "Interjecting",
    course: "Leadership Voice",
    focus: ["Interviews", "Storytelling", "Managing nerves"],
    points: 2485,
    rank: 1,
    streak: 21,
    variant: "brand",
    badges: ["Leadership Voice · in progress", "Storytelling ✓", "Top practicer"],
  },
  {
    slug: "priya-raman",
    initials: "PR",
    name: "Priya Raman",
    headline: "Consultant working on nerves before big rooms",
    bio: "Management consultant who presents to executive committees monthly. Focused on staying composed when the room pushes back.",
    company: "Deloitte",
    role: "Senior Consultant",
    location: "Toronto, ON",
    linkedin: "https://linkedin.com/in/priyaraman",
    email: "priya.raman@example.com",
    working: "Pesky Nerves Managed",
    course: "Leadership Voice",
    focus: ["Executive presence", "Q&A", "Nerves"],
    points: 2210,
    rank: 2,
    streak: 14,
    variant: "dark",
    badges: ["Leadership Voice · in progress", "Curveballs ✓"],
  },
  {
    slug: "daniel-mercer",
    initials: "DM",
    name: "Daniel Mercer",
    headline: "Team lead learning to pitch with confidence",
    bio: "Leads a product team of nine. Working on turning detailed thinking into stories people remember after the meeting ends.",
    company: "RBC",
    role: "Product Lead",
    location: "Mississauga, ON",
    linkedin: "https://linkedin.com/in/danielmercer",
    email: "daniel.mercer@example.com",
    working: "Storytelling for Impact",
    course: "Leadership Voice",
    focus: ["Storytelling", "Pitching", "Structure"],
    points: 1940,
    rank: 3,
    streak: 9,
    variant: "accent",
    badges: ["Leadership Voice · in progress", "Structure ✓"],
  },
  {
    slug: "jordan-tao",
    initials: "JT",
    name: "Jordan Tao",
    headline: "Engineer turning technical detail into stories",
    bio: "Staff engineer who presents architecture decisions to non-technical stakeholders. Practising how to open strong and stay on message.",
    company: "Samsung",
    role: "Staff Engineer",
    location: "Vancouver, BC",
    linkedin: "https://linkedin.com/in/jordantao",
    email: "jordan.tao@example.com",
    working: "Compelling Delivery",
    course: "Leadership Voice",
    focus: ["Delivery", "Simplifying detail"],
    points: 1720,
    rank: 4,
    streak: 6,
    variant: "brand",
    badges: ["Leadership Voice · in progress"],
  },
  {
    slug: "sam-lopez",
    initials: "SL",
    name: "Sam Lopez",
    headline: "Founder practising the investor pitch",
    bio: "Early-stage founder rehearsing the raise. Wants sharper openings and better recovery when questions come early.",
    company: "Independent",
    role: "Founder",
    location: "Ottawa, ON",
    linkedin: "https://linkedin.com/in/samlopez",
    email: "sam.lopez@example.com",
    working: "Handling Curveballs",
    course: "Leadership Voice",
    focus: ["Pitching", "Curveballs", "Openings"],
    points: 1455,
    rank: 5,
    streak: 3,
    variant: "accent",
    badges: ["Leadership Voice · in progress"],
  },
];

export const getMember = (slug: string) =>
  MEMBERS.find((m) => m.slug === slug);

/* ---------------- Demo notifications & messages ---------------- */

export const NOTIFICATIONS = [
  {
    id: 1,
    icon: "🤝",
    text: "Priya Raman accepted your practice request",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    icon: "💬",
    text: "Daniel Mercer left feedback on your recording",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    icon: "🏆",
    text: "You earned 50 points for completing Compelling Delivery",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 4,
    icon: "📅",
    text: "Peer Practice Night starts in 3 days",
    time: "3 days ago",
    unread: false,
  },
];

export const CONVERSATIONS = [
  {
    slug: "priya-raman",
    initials: "PR",
    name: "Priya Raman",
    variant: "dark" as const,
    preview: "Thursday at 7 works for me — shall we run the Q&A drill?",
    time: "2h",
    unread: true,
    thread: [
      {
        from: "them" as const,
        text: "Hi! Saw you're working on Interjecting too. Want to practise together this week?",
      },
      {
        from: "me" as const,
        text: "Yes please. I keep freezing when someone cuts in mid-point.",
      },
      {
        from: "them" as const,
        text: "Thursday at 7 works for me — shall we run the Q&A drill?",
      },
    ],
  },
  {
    slug: "daniel-mercer",
    initials: "DM",
    name: "Daniel Mercer",
    variant: "accent" as const,
    preview: "Your opening was much stronger this time.",
    time: "1d",
    unread: false,
    thread: [
      {
        from: "them" as const,
        text: "Watched your recording — your opening was much stronger this time.",
      },
      { from: "me" as const, text: "Thanks! I cut the throat-clearing intro." },
    ],
  },
];

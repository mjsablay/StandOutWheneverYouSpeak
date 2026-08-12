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
    badges: ["Leadership Voice · in progress", "Storytelling", "Top practicer"],
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
    badges: ["Leadership Voice · in progress", "Curveballs"],
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
    badges: ["Leadership Voice · in progress", "Structure"],
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

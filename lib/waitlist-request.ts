/**
 * The waitlist request — one shape, shared by the public form, the API route
 * that stores it and the admin screen that reads it, so the three can't drift.
 *
 * Every list here is mirrored by a CHECK constraint in
 * supabase/migrations/0006_waitlist_requests.sql. Adding an option means
 * changing both; the database is the one that actually enforces it.
 */

export const CONTEXTS = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Working professional" },
  { value: "leader", label: "I lead a team" },
  { value: "educator", label: "Teacher or coach" },
  { value: "other", label: "Something else" },
] as const;

export const COURSE_INTERESTS = [
  { value: "leadership", label: "Leadership Voice — for work and boardrooms" },
  { value: "campus", label: "Campus Voice — for students" },
  { value: "both", label: "Both" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const SPEAKING_FREQUENCIES = [
  { value: "rarely", label: "Hardly ever" },
  { value: "few_times_year", label: "A few times a year" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Most days" },
] as const;

export type Context = (typeof CONTEXTS)[number]["value"];
export type CourseInterest = (typeof COURSE_INTERESTS)[number]["value"];
export type SpeakingFrequency = (typeof SPEAKING_FREQUENCIES)[number]["value"];
export type RequestStatus = "new" | "invited" | "joined" | "declined";

export const LIMITS = {
  firstName: 50,
  lastName: 50,
  email: 200,
  organisation: 80,
  roleTitle: 80,
  location: 80,
  linkedin: 200,
  referral: 120,
  goal: 600,
  notes: 1000,
} as const;

/** Short enough that nobody writes an essay, long enough to be revealing. */
export const GOAL_MIN = 10;

export type WaitlistRequestInput = {
  email: string;
  first_name: string;
  last_name: string;
  context: Context;
  organisation?: string | null;
  role_title?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  course_interest: CourseInterest;
  goal: string;
  speaking_frequency?: SpeakingFrequency | null;
  referral?: string | null;
};

export type WaitlistRequest = WaitlistRequestInput & {
  id: string;
  created_at: string;
  status: RequestStatus;
  invited_at: string | null;
  reviewed_by: string | null;
  joined_profile_id: string | null;
  notes: string | null;
};

const labelFrom = <T extends readonly { value: string; label: string }[]>(
  options: T,
  value: string | null | undefined,
) => options.find((o) => o.value === value)?.label ?? null;

export const contextLabel = (v: string | null | undefined) =>
  labelFrom(CONTEXTS, v);
export const courseLabel = (v: string | null | undefined) =>
  labelFrom(COURSE_INTERESTS, v);
export const frequencyLabel = (v: string | null | undefined) =>
  labelFrom(SPEAKING_FREQUENCIES, v);

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Waiting on you",
  invited: "Invited",
  joined: "Joined",
  declined: "Declined",
};

/**
 * Validates a submission the same way the database will, so someone gets a
 * useful message instead of a constraint error. Returns a field-keyed map of
 * problems; an empty object means it's good to send.
 */
export function validateRequest(
  input: Partial<WaitlistRequestInput>,
): Record<string, string> {
  const problems: Record<string, string> = {};
  const trimmed = (s?: string | null) => (s ?? "").trim();

  if (!trimmed(input.first_name)) problems.first_name = "Your first name, please.";
  if (!trimmed(input.last_name)) problems.last_name = "And your last name.";

  const email = trimmed(input.email);
  if (!email) problems.email = "We need an address to invite you at.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    problems.email = "That doesn't look like an email address.";

  if (!input.context) problems.context = "Pick whichever is closest.";
  if (!input.course_interest) problems.course_interest = "Pick whichever is closest.";

  const goal = trimmed(input.goal);
  if (goal.length < GOAL_MIN)
    problems.goal = "A sentence is plenty — it's how your place gets decided.";
  else if (goal.length > LIMITS.goal)
    problems.goal = `Keep it under ${LIMITS.goal} characters.`;

  return problems;
}

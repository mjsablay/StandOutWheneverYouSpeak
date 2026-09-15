/**
 * The one place the price and its terms are written down.
 *
 * Before this, "$10 CAD / month" was typed into the pricing card, the
 * checkout page, the FAQ and a page description, and the FAQ promised
 * "cancel anytime" while Barry's programme blueprint proposes a three-month
 * minimum. Copy that contradicts itself is a refund argument waiting to
 * happen, so every surface now reads from here.
 *
 * THE OPEN DECISION
 * `minimumMonths` is 0, which is what the live site has always promised.
 * Barry's blueprint proposes 3 (see Advoc(Motiv)8/Thursday-Follow-Up.md,
 * decision 1). Changing the number here changes every sentence on the site
 * that mentions the commitment — but it does NOT change what Stripe
 * charges. The subscription terms live on the Price in the Stripe
 * dashboard, so a real minimum term needs both: the number here, and a
 * Price configured to match.
 */

export const PLAN = {
  name: "Speakers' Circle",
  free: "Front Row",
  amount: 10,
  currency: "CAD",
  /** Billing period. Matches the Stripe Price's recurring interval. */
  interval: "month",
  /** 0 = cancel whenever you like. Any other number states a minimum term. */
  minimumMonths: 0,
} as const;

/** "$10 CAD" */
export const priceLabel = `$${PLAN.amount} ${PLAN.currency}`;

/** "$10 CAD / month" */
export const priceWithInterval = `${priceLabel} / ${PLAN.interval}`;

/** One sentence on how long you're committed to. */
export const commitmentLine: string =
  PLAN.minimumMonths > 0
    ? `Minimum ${PLAN.minimumMonths} months, then cancel anytime.`
    : "Cancel anytime.";

/** What Speakers' Circle includes. Used by the pricing card and checkout. */
export const CIRCLE_INCLUDES = [
  "Every lesson in both courses",
  "Coaching sessions with Katya",
  "Full member community access",
  "All live events, workshops and cohort classes",
] as const;

/** What the free tier includes. */
export const FRONT_ROW_INCLUDES = [
  "Selected lessons from both courses",
  "Free live events and open houses",
  "Earn points and appear on the leaderboard",
] as const;

/**
 * Stripe subscription statuses that mean "this person has paid and should
 * have access". Everything else — past_due, unpaid, canceled, incomplete,
 * paused — does not. A subscription set to cancel at period end is still
 * `active` until that moment, so it correctly stays here until it lapses.
 */
export const ENTITLED_STATUSES = ["active", "trialing"] as const;

export const isEntitled = (status: string | null | undefined) =>
  !!status && (ENTITLED_STATUSES as readonly string[]).includes(status);

/** Plain-language version of a Stripe status, for the account page. */
export const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Free trial",
  past_due: "Payment failed",
  unpaid: "Unpaid",
  canceled: "Cancelled",
  incomplete: "Awaiting payment",
  incomplete_expired: "Expired before payment",
  paused: "Paused",
};

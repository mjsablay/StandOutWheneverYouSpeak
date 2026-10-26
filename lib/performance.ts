export type Presentation = {
  id: string; assessed_on: string; title: string; frame: number; staying: number;
  delivery: number; evidence: string; recorded_at: string;
};
export type PerformanceAward = { id: string; month: string; points: number; current_score: number; presentation_ids: string[] };
export type PerformanceReport = {
  snapshot: { count: number; baseline: number | null; current: number | null; new_presentations: number; presentation_ids: string[]; best_ids: string[] };
  presentations: Presentation[]; awards: PerformanceAward[];
};
export const PERFORMANCE_LEVELS = [
  { name: "Rock Star", points: 500, score: 4.4 },
  { name: "Distinguished", points: 350, score: 4 },
  { name: "Expert", points: 225, score: 3.5 },
  { name: "Intermediate", points: 100, score: 2.8 },
];
export function performanceLevel(baseline: number | null, current: number | null, points: number) {
  if (baseline === null) return "Establishing baseline";
  return PERFORMANCE_LEVELS.find(level => points >= level.points && current !== null && current >= level.score)?.name ?? "Novice";
}
export function torontoDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function monthLabel(value: string) {
  return new Date(`${value.slice(0, 7)}-01T12:00:00Z`).toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
}
export const scoreLabel = (value: number | null) => value === null ? "—" : Number(value).toFixed(2);

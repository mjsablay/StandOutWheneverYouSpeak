/**
 * Curated dropdown options for member profiles.
 *
 * These are deliberately closed lists rather than free text, so profiles
 * can't be used to post arbitrary content. Every list ends with "Other" —
 * without an escape hatch people either abandon the form or pick something
 * false, and both are worse than an imprecise label.
 *
 * Expand these lists as real members join; they're just data.
 */

export const BIO_MAX = 300;

export const OTHER = "Other";

export const SCHOOLS = [
  "University of Toronto",
  "Toronto Metropolitan University",
  "York University",
  "McMaster University",
  "Queen's University",
  "Western University",
  "University of Waterloo",
  "Wilfrid Laurier University",
  "University of Guelph",
  "University of Ottawa",
  "Carleton University",
  "McGill University",
  "Concordia University",
  "University of British Columbia",
  "Simon Fraser University",
  "University of Alberta",
  "University of Calgary",
  "Dalhousie University",
  "Seneca Polytechnic",
  "Humber Polytechnic",
  "George Brown College",
  "Centennial College",
  "Sheridan College",
  OTHER,
] as const;

export const COMPANIES = [
  "RBC",
  "BMO",
  "CIBC",
  "Scotiabank",
  "TD",
  "Citibank",
  "Equitable Bank",
  "Peoples Bank",
  "Canaccord",
  "Desjardins",
  "Sun Life",
  "Manulife",
  "Deloitte",
  "CPA Canada",
  "MaRS Discovery District",
  "Air Canada",
  "Maersk",
  "Samsung",
  "Nissan",
  "General Motors",
  "Fortinet",
  "Indeed",
  "Kijiji",
  "TJX Canada",
  "The Globe and Mail",
  "University of Toronto",
  "Schindler",
  "Lubrizol",
  "Wrigley",
  "Merrithew",
  "Maple Reinders",
  "Kenaidan",
  "SmartCentres",
  "Sani Marc",
  "Coeur Mining",
  "401 Group of Companies",
  "VGW",
  "Student — not working",
  "Self-employed",
  OTHER,
] as const;

export const ROLES = [
  "Student",
  "Intern / Co-op",
  "Analyst",
  "Associate",
  "Specialist",
  "Coordinator",
  "Consultant",
  "Engineer",
  "Designer",
  "Marketing",
  "Sales",
  "Account Manager",
  "Project Manager",
  "Product Manager",
  "Team Lead",
  "Manager",
  "Senior Manager",
  "Director",
  "Vice President",
  "Executive / C-suite",
  "Founder / Owner",
  "Educator / Instructor",
  OTHER,
] as const;

export const LOCATIONS = [
  "Toronto, ON",
  "Mississauga, ON",
  "Brampton, ON",
  "Markham, ON",
  "Vaughan, ON",
  "Hamilton, ON",
  "Ottawa, ON",
  "Kitchener–Waterloo, ON",
  "London, ON",
  "Windsor, ON",
  "Kingston, ON",
  "Montréal, QC",
  "Québec City, QC",
  "Halifax, NS",
  "Moncton, NB",
  "St. John's, NL",
  "Winnipeg, MB",
  "Regina, SK",
  "Saskatoon, SK",
  "Calgary, AB",
  "Edmonton, AB",
  "Vancouver, BC",
  "Victoria, BC",
  "Remote — Canada",
  "Outside Canada",
  OTHER,
] as const;

/** Builds the headline shown on a profile, based on the member's choice. */
export function deriveHeadline(p: {
  headline?: string | null;
  headline_mode?: "custom" | "school" | "work" | null;
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

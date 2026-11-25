/**
 * The dates of the Julinsamling, as plain "YYYY-MM-DD" strings that compare in the right order and know nothing about
 * time zones. Pure functions with no file access, so the browser tests, the build and the menu island can all use them.
 */

/**
 * Where the Julinsamling stands on a day:
 * - `innan`: before the start date.
 * - `pagar`: from the start date to and including the end date.
 * - `avslutad`: after the end date.
 * - `ingen`: the association has not written both dates, so there is no campaign.
 */
export type Julinsamlingslage = "innan" | "pagar" | "avslutad" | "ingen";

const MANADER = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
] as const;

/** Whether the text is a real date written as "YYYY-MM-DD". */
export function arDatum(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  return new Date(`${text}T00:00:00Z`).toISOString().slice(0, 10) === text;
}

/** "2026-12-23" as "23 december". */
export function skrivDatum(datum: string): string {
  const [, manad, dag] = datum.split("-").map(Number);
  return `${dag} ${MANADER[manad - 1]}`;
}

/** Where the campaign stands on `idag`. */
export function lageForDag(idag: string, start: string | undefined, slut: string | undefined): Julinsamlingslage {
  if (!start || !slut) return "ingen";
  if (idag < start) return "innan";
  return idag <= slut ? "pagar" : "avslutad";
}

/** Today in Sweden as "YYYY-MM-DD", whatever time zone the build or the browser is in. */
export function idagISverige(nu: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(nu);
}

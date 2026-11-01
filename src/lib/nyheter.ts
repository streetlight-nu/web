import type { Amne } from "./nyheter-schema";

/** What each topic (Ämne) is called, and which colour its knot's core has. */
export const amnesNamn: Record<Amne, string> = {
  rapport: "Rapport från Addis Abeba",
  forening: "Nyhet från föreningen",
  familj: "Berättelse från en familj",
  tack: "Tack till faddrarna",
};

const manader = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** "14 sep 2026", as in the prototype. Dates are calendar days, so read them in UTC. */
export function formateraDatum(datum: Date): string {
  return `${datum.getUTCDate()} ${manader[datum.getUTCMonth()]} ${datum.getUTCFullYear()}`;
}

/** The value for `<time datetime>`: "2026-09-14". */
export function isoDatum(datum: Date): string {
  return datum.toISOString().slice(0, 10);
}

interface MedDatum {
  id: string;
  data: { date: Date };
}

/** Newest first. Posts from the same day keep a stable order by their slug. */
export function nyastForst<T extends MedDatum>(inlagg: T[]): T[] {
  return [...inlagg].sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

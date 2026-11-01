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

/** The newest post, which "Senaste nytt" on the start page always shows. */
export function senaste<T extends MedDatum>(inlagg: T[]): T | undefined {
  return nyastForst(inlagg)[0];
}

/** The posts grouped per year, newest year and newest post first, as along the thread on /nyheter. */
export function perAr<T extends MedDatum>(inlagg: T[]): { ar: number; inlagg: T[] }[] {
  const ar: { ar: number; inlagg: T[] }[] = [];
  for (const post of nyastForst(inlagg)) {
    const year = post.data.date.getUTCFullYear();
    if (ar.at(-1)?.ar !== year) ar.push({ ar: year, inlagg: [] });
    ar.at(-1)!.inlagg.push(post);
  }
  return ar;
}

/** True while at least one example post (Exempelinlägg) is left, so the list shows its notice. */
export function harExempel(inlagg: { data: { example: boolean } }[]): boolean {
  return inlagg.some((post) => post.data.example);
}

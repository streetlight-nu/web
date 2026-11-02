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

/**
 * Newest first. Inlägg from the same day keep a stable order by their slug. The one place inlägg are
 * sorted: allaNyheter() hands the pages this order, and senaste() and perAr() expect it.
 */
export function nyastForst<T extends MedDatum>(inlagg: T[]): T[] {
  return [...inlagg].sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

/** The newest inlägg, which "Senaste nytt" on the start page always shows. Expects nyastForst() order. */
export function senaste<T extends MedDatum>(inlagg: T[]): T | undefined {
  return inlagg[0];
}

/** The inlägg grouped per year, newest year and newest inlägg first, as along the thread on /nyheter. Expects nyastForst() order. */
export function perAr<T extends MedDatum>(inlagg: T[]): { ar: number; inlagg: T[] }[] {
  const ar: { ar: number; inlagg: T[] }[] = [];
  for (const ettInlagg of inlagg) {
    const year = ettInlagg.data.date.getUTCFullYear();
    if (ar.at(-1)?.ar !== year) ar.push({ ar: year, inlagg: [] });
    ar.at(-1)!.inlagg.push(ettInlagg);
  }
  return ar;
}

/** True while at least one Exempelinlägg is left, so the list shows its notice. */
export function harExempel(inlagg: { data: { example: boolean } }[]): boolean {
  return inlagg.some((ettInlagg) => ettInlagg.data.example);
}

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Data files: the JSON files in `src/data/` that the association fills in through Pages CMS
 * (föreningsuppgifter, julkampanj). Each file is read and checked once per build and then reused.
 */
const lasta = new Map<string, unknown>();

/** Reads a data file, checks it with `tolka`, and remembers the result for the rest of the build. */
export function lasDatafil<T>(fil: string, tolka: (data: unknown) => T): T {
  const sokvag = resolve(fil);
  if (!lasta.has(sokvag)) lasta.set(sokvag, tolka(JSON.parse(readFileSync(sokvag, "utf8"))));
  return lasta.get(sokvag) as T;
}

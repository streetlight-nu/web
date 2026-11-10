import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "astro/zod";

/**
 * Data files: the JSON files in `src/data/` that the association fills in through Pages CMS. Each file is
 * declared once with `datafil()`: where it lives, which environment variable points the browser tests' builds
 * at a test file instead, which entry in `.pages.yml` edits it, and the schema that checks it. All of them are
 * listed in `src/lib/datafiler.ts`, and one unit test checks every one against `.pages.yml`.
 */
const lasta = new Map<string, unknown>();

/** Reads a data file, checks it with `tolka`, and remembers the result for the rest of the build. */
export function lasDatafil<T>(fil: string, tolka: (data: unknown) => T): T {
  const sokvag = resolve(fil);
  if (!lasta.has(sokvag)) lasta.set(sokvag, tolka(JSON.parse(readFileSync(sokvag, "utf8"))));
  return lasta.get(sokvag) as T;
}

/** One data file, as declared with `datafil()`. */
export interface Datafil<T> {
  /** The file in the repo, the same path as in `.pages.yml`. */
  fil: string;
  /** An environment variable that, when set, points to another file (the browser tests' builds). */
  miljovariabel: string;
  /** The `name` of the file's entry under `content` in `.pages.yml`. */
  cmsNamn: string;
  /** The schema the file's contents must pass. Its fields are the form's fields in `.pages.yml`. */
  schema: z.ZodType<T>;
  /** Checks contents read from the file. Unknown fields and malformed values throw, which fails the build. */
  tolka(data: unknown): T;
  /** Reads and checks the file (or the one the environment variable names), once per build. */
  hamta(): T;
}

/** Declares a data file. `fel` begins the message when the file does not pass its schema. */
export function datafil<S extends z.ZodType>(def: {
  fil: string;
  miljovariabel: string;
  cmsNamn: string;
  schema: S;
  fel: string;
}): Datafil<z.output<S>> {
  const tolka = (data: unknown): z.output<S> => {
    const resultat = def.schema.safeParse(data);
    if (!resultat.success) throw new Error(`${def.fel}:\n${z.prettifyError(resultat.error)}`);
    return resultat.data;
  };
  return {
    fil: def.fil,
    miljovariabel: def.miljovariabel,
    cmsNamn: def.cmsNamn,
    schema: def.schema as z.ZodType<z.output<S>>,
    tolka,
    hamta: () => lasDatafil(process.env[def.miljovariabel] || def.fil, tolka),
  };
}

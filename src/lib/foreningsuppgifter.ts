import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "astro/zod";

/**
 * Föreningsuppgifter: the public facts that show who the association is and how to give.
 *
 * They live in one data file, `src/data/foreningsuppgifter.json`, which the association fills in
 * through Pages CMS (see `.pages.yml`). Components get them only from here and never write a value
 * themselves. A field that is missing or empty is `undefined`, and is shown as the chip "fylls i".
 */
export interface Foreningsuppgifter {
  organisationsnummer?: string;
  /** The 90-konto for gifts. */
  nittiokonto?: string;
  swish?: string;
  kontaktperson?: string;
  epost?: string;
  /** Link to the latest annual report (årsredovisning). */
  arsredovisning?: string;
}

/** The data file. FORENINGSUPPGIFTER_FIL points elsewhere, so the browser tests can build with a filled-in test file. */
export const DATAFIL = "src/data/foreningsuppgifter.json";

// An empty or blank field means "not given yet".
const optional = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || undefined);

const schema = z.strictObject({
  organisationsnummer: optional,
  nittiokonto: optional,
  swish: optional,
  kontaktperson: optional,
  epost: optional.pipe(z.email({ message: "epost måste vara en e-postadress" }).optional()),
  arsredovisning: optional.pipe(
    z.url({ protocol: /^https?$/, message: "arsredovisning måste vara en länk (https://…)" }).optional(),
  ),
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export function parseForeningsuppgifter(data: unknown): Foreningsuppgifter {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Föreningsuppgifterna är felaktiga:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

let cached: Foreningsuppgifter | undefined;

/** Reads the föreningsuppgifter from the data file, once per build. */
export function getForeningsuppgifter(): Foreningsuppgifter {
  if (!cached) {
    const file = process.env.FORENINGSUPPGIFTER_FIL || DATAFIL;
    cached = parseForeningsuppgifter(JSON.parse(readFileSync(resolve(file), "utf8")));
  }
  return cached;
}

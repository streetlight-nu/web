import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "astro/zod";

import { arEpostadress, valfri } from "./falt";

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

const ifylldText = z.string().trim();

const foreningsuppgifterSchema = z.strictObject({
  organisationsnummer: valfri(ifylldText),
  nittiokonto: valfri(ifylldText),
  swish: valfri(ifylldText),
  kontaktperson: valfri(ifylldText),
  epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  arsredovisning: valfri(
    ifylldText.pipe(z.url({ protocol: /^https?$/, message: "arsredovisning måste vara en länk (https://…)" })),
  ),
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export function tolkaForeningsuppgifter(data: unknown): Foreningsuppgifter {
  const resultat = foreningsuppgifterSchema.safeParse(data);
  if (!resultat.success) {
    throw new Error(`Föreningsuppgifterna är felaktiga:\n${z.prettifyError(resultat.error)}`);
  }
  return resultat.data;
}

let lasta: Foreningsuppgifter | undefined;

/** Reads the föreningsuppgifter from the data file, once per build. */
export function hamtaForeningsuppgifter(): Foreningsuppgifter {
  if (!lasta) {
    const fil = process.env.FORENINGSUPPGIFTER_FIL || DATAFIL;
    lasta = tolkaForeningsuppgifter(JSON.parse(readFileSync(resolve(fil), "utf8")));
  }
  return lasta;
}

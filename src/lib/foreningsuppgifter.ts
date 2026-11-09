import { z } from "astro/zod";

import { lasDatafil } from "./datafil";
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
  /** The association's page on Facebook (https://www.facebook.com/…). */
  facebook?: string;
  /** The association's account on Instagram (https://www.instagram.com/…). */
  instagram?: string;
}

/** The data file. FORENINGSUPPGIFTER_FIL points elsewhere, so the browser tests can build with a filled-in test file. */
export const DATAFIL = "src/data/foreningsuppgifter.json";

const ifylldText = z.string().trim();

/** A link to the association's own page on one social network: https, on that network's domain. */
function profillank(falt: string, doman: string) {
  const meddelande = `${falt} måste vara en länk till ${doman} (https://www.${doman}/…)`;
  return ifylldText.pipe(
    z.url({ protocol: /^https$/, hostname: new RegExp(`^(www\\.)?${doman.replace(".", "\\.")}$`), message: meddelande }),
  );
}

const foreningsuppgifterSchema = z.strictObject({
  organisationsnummer: valfri(ifylldText),
  nittiokonto: valfri(ifylldText),
  swish: valfri(ifylldText),
  kontaktperson: valfri(ifylldText),
  epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  arsredovisning: valfri(
    ifylldText.pipe(z.url({ protocol: /^https?$/, message: "arsredovisning måste vara en länk (https://…)" })),
  ),
  facebook: valfri(profillank("facebook", "facebook.com")),
  instagram: valfri(profillank("instagram", "instagram.com")),
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export function tolkaForeningsuppgifter(data: unknown): Foreningsuppgifter {
  const resultat = foreningsuppgifterSchema.safeParse(data);
  if (!resultat.success) {
    throw new Error(`Föreningsuppgifterna är felaktiga:\n${z.prettifyError(resultat.error)}`);
  }
  return resultat.data;
}

/** Reads the föreningsuppgifter from the data file, once per build. */
export function hamtaForeningsuppgifter(): Foreningsuppgifter {
  return lasDatafil(process.env.FORENINGSUPPGIFTER_FIL || DATAFIL, tolkaForeningsuppgifter);
}

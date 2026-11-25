import { z } from "astro/zod";

import { datafil } from "./datafil";
import { arEpostadress, valfri } from "./falt";
import { arDatum } from "./julpaketdatum";

/**
 * Ge ett julpaket: the campaign's own facts on the page /julpaket, beside the föreningsuppgifter.
 *
 * They live in one data file, `src/data/julpaket.json`, which the association fills in through
 * Pages CMS (see `.pages.yml`). The page gets them only from here and never writes a value itself.
 * A field that is missing or empty is `undefined`, and is not shown.
 * Amounts and the goal are not here: Repejo shows them in its checkout and progress bar.
 */
export interface Julpaket {
  /** The first day of Ge ett julpaket, "YYYY-MM-DD" (src/lib/julpaketperiod.ts). Without both dates there is no campaign. */
  startdatum?: string;
  /** The last day of Ge ett julpaket, "YYYY-MM-DD", which is also the last day to give a julpaket with a card. */
  slutdatum?: string;
  /** What a julpaket contains and what it means for the families. */
  vadJulpaketGor?: string;
  /** The campaign's own e-mail for questions. Without one, the föreningsuppgifter's e-mail is used. */
  epost?: string;
}

const ifylldText = z.string().trim();

const datum = (namn: string) =>
  ifylldText.refine(arDatum, { message: `${namn} måste vara ett datum skrivet som ÅÅÅÅ-MM-DD, till exempel 2026-12-23` });

export const julpaketSchema = z
  .strictObject({
    startdatum: valfri(datum("startdatum")),
    slutdatum: valfri(datum("slutdatum")),
    vadJulpaketGor: valfri(ifylldText),
    epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  })
  .refine((d) => !d.startdatum || !d.slutdatum || d.startdatum <= d.slutdatum, {
    message: "slutdatum får inte vara före startdatum",
    path: ["slutdatum"],
  });

/** The data file. JULPAKET_FIL points elsewhere, so the browser tests can build with a test file. */
export const JULPAKET_DATAFIL = datafil({
  fil: "src/data/julpaket.json",
  miljovariabel: "JULPAKET_FIL",
  cmsNamn: "julpaket",
  schema: julpaketSchema,
  fel: "Uppgifterna för Ge ett julpaket är felaktiga",
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export const tolkaJulpaket: (data: unknown) => Julpaket = JULPAKET_DATAFIL.tolka;

/** Reads the campaign's facts from the data file, once per build. */
export function hamtaJulpaket(): Julpaket {
  return JULPAKET_DATAFIL.hamta();
}

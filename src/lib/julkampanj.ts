import { z } from "astro/zod";

import { datafil } from "./datafil";
import { arEpostadress, valfri } from "./falt";
import { arDatum } from "./julperiod";

/**
 * Julkampanjen: the campaign's own facts on the page /julpaket, beside the föreningsuppgifter.
 *
 * They live in one data file, `src/data/julkampanj.json`, which the association fills in through
 * Pages CMS (see `.pages.yml`). The page gets them only from here and never writes a value itself.
 * A field that is missing or empty is `undefined`, and is not shown.
 * Amounts and the goal are not here: Repejo shows them in its checkout and progress bar.
 */
export interface Julkampanj {
  /** The first day of the Julinsamling, "YYYY-MM-DD" (src/lib/julinsamling.ts). Without both dates there is no campaign. */
  startdatum?: string;
  /** The last day of the Julinsamling, "YYYY-MM-DD", which is also the last day to give a julpaket with a card. */
  slutdatum?: string;
  /** What a julpaket contains and what it means for the families. */
  vadJulklappenGor?: string;
  /** The campaign's own e-mail for questions. Without one, the föreningsuppgifter's e-mail is used. */
  epost?: string;
}

const ifylldText = z.string().trim();

const datum = (namn: string) =>
  ifylldText.refine(arDatum, { message: `${namn} måste vara ett datum skrivet som ÅÅÅÅ-MM-DD, till exempel 2026-12-23` });

export const julkampanjSchema = z
  .strictObject({
    startdatum: valfri(datum("startdatum")),
    slutdatum: valfri(datum("slutdatum")),
    vadJulklappenGor: valfri(ifylldText),
    epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  })
  .refine((d) => !d.startdatum || !d.slutdatum || d.startdatum <= d.slutdatum, {
    message: "slutdatum får inte vara före startdatum",
    path: ["slutdatum"],
  });

/** The data file. JULKAMPANJ_FIL points elsewhere, so the browser tests can build with a test file. */
export const JULKAMPANJ_DATAFIL = datafil({
  fil: "src/data/julkampanj.json",
  miljovariabel: "JULKAMPANJ_FIL",
  cmsNamn: "julkampanj",
  schema: julkampanjSchema,
  fel: "Julkampanjens uppgifter är felaktiga",
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export const tolkaJulkampanj: (data: unknown) => Julkampanj = JULKAMPANJ_DATAFIL.tolka;

/** Reads the campaign's facts from the data file, once per build. */
export function hamtaJulkampanj(): Julkampanj {
  return JULKAMPANJ_DATAFIL.hamta();
}

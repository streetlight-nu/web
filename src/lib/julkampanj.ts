import { z } from "astro/zod";

import { datafil } from "./datafil";
import { arEpostadress, valfri } from "./falt";

/**
 * Julkampanjen: the campaign's own facts on the page /julklapp, beside the föreningsuppgifter.
 *
 * They live in one data file, `src/data/julkampanj.json`, which the association fills in through
 * Pages CMS (see `.pages.yml`). The page gets them only from here and never writes a value itself.
 * A field that is missing or empty is `undefined`, and is shown as the chip "fylls i".
 * Amounts and the goal are not here: Repejo shows them in its checkout and progress bar.
 */
export interface Julkampanj {
  /** The last day to give a julklapp with a card, as the association writes it, e.g. "20 december". */
  sistaDag?: string;
  /** What a julklapp does for the children and the families. */
  vadJulklappenGor?: string;
  /** The campaign's own e-mail for questions. Without one, the föreningsuppgifter's e-mail is used. */
  epost?: string;
  /** Whether the campaign is shown on the home page and in the menu. Off (missing) by default, so it ends without code after Christmas. */
  visasPaStartsidan?: boolean;
}

const ifylldText = z.string().trim();

export const julkampanjSchema = z.strictObject({
  sistaDag: valfri(ifylldText),
  vadJulklappenGor: valfri(ifylldText),
  epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  visasPaStartsidan: valfri(z.boolean({ error: "visasPaStartsidan måste vara ibockad eller inte (true eller false)" })),
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

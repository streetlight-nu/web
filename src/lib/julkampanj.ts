import { z } from "astro/zod";

import { lasDatafil } from "./datafil";
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

/** The data file. JULKAMPANJ_FIL points elsewhere, so the browser tests can build with a filled-in test file. */
export const DATAFIL = "src/data/julkampanj.json";

const ifylldText = z.string().trim();

export const julkampanjSchema = z.strictObject({
  sistaDag: valfri(ifylldText),
  vadJulklappenGor: valfri(ifylldText),
  epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  visasPaStartsidan: valfri(z.boolean()),
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export function tolkaJulkampanj(data: unknown): Julkampanj {
  const resultat = julkampanjSchema.safeParse(data);
  if (!resultat.success) {
    throw new Error(`Julkampanjens uppgifter är felaktiga:\n${z.prettifyError(resultat.error)}`);
  }
  return resultat.data;
}

/** Reads the campaign's facts from the data file, once per build. */
export function hamtaJulkampanj(): Julkampanj {
  return lasDatafil(process.env.JULKAMPANJ_FIL || DATAFIL, tolkaJulkampanj);
}

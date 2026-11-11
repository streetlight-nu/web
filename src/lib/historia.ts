import { z } from "astro/zod";

import { datafil } from "./datafil";
import { valfri } from "./falt";
import { valfriSidbild } from "./sidbild";

/**
 * Vår historia: the timeline from 1995 until today, on the page /historia.
 *
 * It lives in one data file, `src/data/historia.json`, which the association fills in through
 * Pages CMS (see `.pages.yml`). Every text is optional: a field that is missing or empty is
 * `undefined`, and the page shows the chip "fylls i" in its place, so nothing is made up.
 * The texts are written so that a parent and a child can read them together.
 */

const text = valfri(z.string().trim());

export const handelseSchema = z.strictObject({
  /** The year, or years, e.g. "1995" or "2003–2004". */
  ar: text,
  rubrik: text,
  text: text,
  /** Words to remember, shown large after the text, e.g. "Det räcker med en." Without quotation marks. */
  citat: text,
  /** A question a parent can talk about with their child after reading. */
  fraga: text,
});

export const periodSchema = z.strictObject({
  /** The period's years, e.g. "1995–1999". Shown as its heading and in the jump menu. */
  rubrik: z.string().trim().min(1, "varje period behöver en rubrik, till exempel 1995–1999"),
  namn: text,
  sammanfattning: text,
  /** A photo from the period, shown under the summary. */
  bild: valfriSidbild,
  handelser: z.array(handelseSchema),
});

export const historiaSchema = z.strictObject({
  ingress: text,
  perioder: z.array(periodSchema).min(1, "historien behöver minst en period"),
  /** A photo for Idag, at the end of the timeline. */
  idagBild: valfriSidbild,
});

export type Handelse = z.infer<typeof handelseSchema>;
export type Period = z.infer<typeof periodSchema>;
export type Historia = z.infer<typeof historiaSchema>;

/** The data file. HISTORIA_FIL points elsewhere, so the browser tests can build with a test file. */
export const HISTORIA_DATAFIL = datafil({
  fil: "src/data/historia.json",
  miljovariabel: "HISTORIA_FIL",
  cmsNamn: "historia",
  schema: historiaSchema,
  fel: "Historien är felaktig",
});

/** Checks the contents of the data file. Unknown fields and a period without a heading fail the build. */
export const tolkaHistoria: (data: unknown) => Historia = HISTORIA_DATAFIL.tolka;

/** The timeline from the data file, read once per build. */
export function hamtaHistoria(): Historia {
  return HISTORIA_DATAFIL.hamta();
}

/** An id for a period's anchor, from its heading: "1995–1999" becomes "period-1995-1999". */
export function periodId(rubrik: string): string {
  const slug = rubrik
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `period-${slug || "utan-rubrik"}`;
}

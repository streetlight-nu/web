import { z } from "astro/zod";

import { datafil } from "./datafil";
import { valfri } from "./falt";
import { valfriSidbild } from "./sidbild";

/**
 * Om föreningen: who we are, what we believe in, how it began, the boards and how to get in touch,
 * on the page /om-foreningen.
 *
 * The texts live in one data file, `src/data/om-foreningen.json`, which the association edits through
 * Pages CMS (see `.pages.yml`). The headings are the page's own; only the texts under them are here.
 * Every text is optional: a field that is missing or empty is `undefined`, and the page shows the chip
 * "fylls i" in its place, so nothing is made up. The one exception is Vår grund: with all its fields
 * empty, the section is left out, so the association can turn it off.
 * The contact details are not here: they come from the föreningsuppgifter.
 */

const text = valfri(z.string().trim());

export const tankeSchema = z.strictObject({
  /** A short sentence that carries the thought, e.g. "Skolan öppnar vägen." */
  rubrik: text,
  text: text,
});

export const personSchema = z.strictObject({
  namn: text,
  /** The person's role in the board, e.g. "Ordförande". */
  roll: text,
});

export const styrelseSchema = z.strictObject({
  forening: z.string().trim().min(1, "varje styrelse behöver föreningens namn, till exempel Streetlight Sverige"),
  personer: z.array(personSchema),
});

export const grundSchema = z.strictObject({
  text: text,
  citat: text,
  /** Where the quote comes from, e.g. "1 Kor 12:26". */
  kalla: text,
});

export const omForeningenSchema = z.strictObject({
  ingress: text,
  vision: text,
  visionText: text,
  tror: z.array(tankeSchema),
  /** Så började det. Paragraphs are separated by an empty line. */
  borjan: text,
  borjanBild: valfriSidbild,
  /** Två föreningar, ett arbete. Paragraphs are separated by an empty line. */
  foreningar: text,
  foreningarBild: valfriSidbild,
  grund: grundSchema.optional(),
  styrelser: z.array(styrelseSchema),
  /** A photo for Vilka vi är, under its heading. */
  vilkaBild: valfriSidbild,
});

export type Tanke = z.infer<typeof tankeSchema>;
export type Styrelse = z.infer<typeof styrelseSchema>;
export type OmForeningen = z.infer<typeof omForeningenSchema>;

/** The data file. OM_FORENINGEN_FIL points elsewhere, so the browser tests can build with a test file. */
export const OM_FORENINGEN_DATAFIL = datafil({
  fil: "src/data/om-foreningen.json",
  miljovariabel: "OM_FORENINGEN_FIL",
  cmsNamn: "omForeningen",
  schema: omForeningenSchema,
  fel: "Om föreningen är felaktig",
});

/** Checks the contents of the data file. Unknown fields and a board without a name fail the build. */
export const tolkaOmForeningen: (data: unknown) => OmForeningen = OM_FORENINGEN_DATAFIL.tolka;

/** The texts from the data file, read once per build. */
export function hamtaOmForeningen(): OmForeningen {
  return OM_FORENINGEN_DATAFIL.hamta();
}

/** A text written in Pages CMS, split into paragraphs at each empty line. */
export function stycken(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((stycke) => stycke.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** Vår grund is shown only when the association has written something in it. */
export function visaGrund(grund: OmForeningen["grund"]): grund is NonNullable<OmForeningen["grund"]> {
  return Boolean(grund && (grund.text || grund.citat));
}

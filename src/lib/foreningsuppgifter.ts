import { z } from "astro/zod";

import { datafil } from "./datafil";
import { arEpostadress, valfri } from "./falt";
import { href } from "./utils";

/**
 * Föreningsuppgifter: the public facts that show who the association is and how to give.
 *
 * They live in one data file, `src/data/foreningsuppgifter.json`, which the association fills in
 * through Pages CMS (see `.pages.yml`). Components get them only from here and never write a value
 * themselves. A field that is missing or empty is `undefined`.
 *
 * How each uppgift is shown is decided here too, with `visaUppgift()`: its label (as in GLOSSARY.md), the text
 * and link when it is filled in, and nothing more when it is not: a missing uppgift is not shown. The component Uppgift and
 * the answers in Vanliga frågor show the uppgifter through it, so every page names and links them the same way.
 */
export interface Foreningsuppgifter {
  organisationsnummer?: string;
  /** The postal address, on one line: "Gatan 1, 123 45 Staden". Shown on Villkor och kontakt. */
  postadress?: string;
  /** The phone number for questions about a gift. Shown on Villkor och kontakt. */
  telefon?: string;
  /** The bankgiro for gifts (the field is still named after the 90-konto it once was). */
  nittiokonto?: string;
  swish?: string;
  epost?: string;
  /** The latest annual report (årsredovisning): a link (https://…) or a path on the site (/dokument/….pdf). */
  arsredovisning?: string;
  /** The association's page on Facebook (https://www.facebook.com/…). */
  facebook?: string;
  /** The association's account on Instagram (https://www.instagram.com/…). */
  instagram?: string;
}

const ifylldText = z.string().trim();

/** An https link, or a path on the site such as /dokument/streetlight-arsredovisning-2025.pdf (a file in public/). */
function arLankEllerSokvag(varde: string): boolean {
  return /^\/(?!\/)\S+$/.test(varde) || z.url({ protocol: /^https?$/ }).safeParse(varde).success;
}

/** A link to the association's own page on one social network: https, on that network's domain. */
function profillank(falt: string, doman: string) {
  const meddelande = `${falt} måste vara en länk till ${doman} (https://www.${doman}/…)`;
  return ifylldText.pipe(
    z.url({ protocol: /^https$/, hostname: new RegExp(`^(www\\.)?${doman.replace(".", "\\.")}$`), message: meddelande }),
  );
}

const foreningsuppgifterSchema = z.strictObject({
  organisationsnummer: valfri(ifylldText),
  postadress: valfri(ifylldText),
  telefon: valfri(ifylldText),
  nittiokonto: valfri(ifylldText),
  swish: valfri(ifylldText),
  epost: valfri(ifylldText.refine(arEpostadress, { message: "epost måste vara en e-postadress" })),
  arsredovisning: valfri(
    ifylldText.refine(arLankEllerSokvag, {
      message: "arsredovisning måste vara en länk (https://…) eller en sökväg på webbplatsen (/dokument/…)",
    }),
  ),
  facebook: valfri(profillank("facebook", "facebook.com")),
  instagram: valfri(profillank("instagram", "instagram.com")),
});

/** The data file. FORENINGSUPPGIFTER_FIL points elsewhere, so the browser tests can build with a test file. */
export const FORENINGSUPPGIFTER_DATAFIL = datafil({
  fil: "src/data/foreningsuppgifter.json",
  miljovariabel: "FORENINGSUPPGIFTER_FIL",
  cmsNamn: "foreningsuppgifter",
  schema: foreningsuppgifterSchema,
  fel: "Föreningsuppgifterna är felaktiga",
});

/** Checks the contents of the data file. Unknown fields and malformed values fail the build. */
export const tolkaForeningsuppgifter: (data: unknown) => Foreningsuppgifter = FORENINGSUPPGIFTER_DATAFIL.tolka;

/** Reads the föreningsuppgifter from the data file, once per build. */
export function hamtaForeningsuppgifter(): Foreningsuppgifter {
  return FORENINGSUPPGIFTER_DATAFIL.hamta();
}

/** Every uppgift, in the order the pages list them. */
export const UPPGIFTER = [
  "organisationsnummer",
  "postadress",
  "telefon",
  "nittiokonto",
  "swish",
  "epost",
  "arsredovisning",
  "facebook",
  "instagram",
] as const satisfies readonly (keyof Foreningsuppgifter)[];
export type Uppgift = (typeof UPPGIFTER)[number];

/** The social networks where the association can be followed, in the order the pages show them. */
export const SOCIALA = ["facebook", "instagram"] as const satisfies readonly Uppgift[];

/** One uppgift as the pages show it. */
export interface VisadUppgift {
  /** The label, as in GLOSSARY.md, e.g. "Bankgiro". */
  etikett: string;
  /** The text to show, or `undefined` while the association has not filled it in. */
  text?: string;
  /** Where the text links, when the uppgift is a link (mailto: or https:), and it is filled in. */
  lank?: string;
}

const VISNING: Record<Uppgift, { etikett: string; lank?: (varde: string) => string; text?: string }> = {
  organisationsnummer: { etikett: "Organisationsnummer" },
  postadress: { etikett: "Postadress" },
  telefon: { etikett: "Telefon", lank: (varde) => `tel:${varde.replace(/[^\d+]/g, "")}` },
  nittiokonto: { etikett: "Bankgiro" },
  swish: { etikett: "Swish för gåvor" },
  epost: { etikett: "E-post", lank: (varde) => `mailto:${varde}` },
  arsredovisning: {
    etikett: "Senaste årsredovisning",
    lank: (varde) => (varde.startsWith("/") ? href(varde) : varde),
    text: "Läs årsredovisningen",
  },
  facebook: { etikett: "Facebook", lank: (varde) => varde, text: "Facebook" },
  instagram: { etikett: "Instagram", lank: (varde) => varde, text: "Instagram" },
};

/** How one uppgift is shown: from the data file, or from `uppgifter` when given (the tests, Vanliga frågor). */
export function visaUppgift(namn: Uppgift, uppgifter: Foreningsuppgifter = hamtaForeningsuppgifter()): VisadUppgift {
  const { etikett, lank, text } = VISNING[namn];
  const varde = uppgifter[namn];
  if (varde === undefined) return { etikett };
  return { etikett, text: text ?? varde, lank: lank?.(varde) };
}

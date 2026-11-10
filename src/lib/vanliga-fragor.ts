import { z } from "astro/zod";

import { valfri } from "./falt";
import { type Foreningsuppgifter, type Uppgift, UPPGIFTER, visaUppgift } from "./foreningsuppgifter";

/**
 * Vanliga frågor: the questions on the page /vanliga-fragor.
 *
 * Each question is one Markdown file in `src/content/fragor/`, which the association writes through
 * Pages CMS (see `.pages.yml`): the question, its group and its order in the frontmatter, the answer
 * as the body. An answer can name a föreningsuppgift, e.g. `{swish}`, so each fact is written once.
 */

/** The page's groups, in the order they are shown. */
export const GRUPPER = [
  { namn: "fadder", rubrik: "Att vara fadder" },
  { namn: "barnen", rubrik: "Barnen och familjerna" },
  { namn: "foreningen", rubrik: "Föreningen" },
] as const;

export type Grupp = (typeof GRUPPER)[number]["namn"];

export const fragaSchema = z.strictObject({
  fraga: z.string().trim().min(1, "varje fråga behöver en fråga"),
  grupp: z.enum(GRUPPER.map((g) => g.namn) as [Grupp, ...Grupp[]], {
    error: `grupp måste vara en av ${GRUPPER.map((g) => g.namn).join(", ")}`,
  }),
  /** Lower comes first within the group. Questions without one come last, in alphabetical order. */
  ordning: valfri(z.number()),
});

export type Fraga = z.infer<typeof fragaSchema>;

interface FragaPost {
  id: string;
  data: Fraga;
}

/** The anchor of one question, so another page can link straight to its answer: #fraga-<file name>. */
export function fragaId(id: string): string {
  return `fraga-${id}`;
}

/** The questions per group, in the groups' order and then by `ordning` and question. Empty groups are left out. */
export function perGrupp<T extends FragaPost>(fragor: T[]) {
  const sist = Number.POSITIVE_INFINITY;
  return GRUPPER.map(({ namn, rubrik }) => ({
    namn,
    rubrik,
    fragor: fragor
      .filter((f) => f.data.grupp === namn)
      .sort(
        (a, b) => (a.data.ordning ?? sist) - (b.data.ordning ?? sist) || a.data.fraga.localeCompare(b.data.fraga, "sv"),
      ),
  })).filter((grupp) => grupp.fragor.length > 0);
}

const escapa = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fyllsI = (text: string) => `<span class="sl-todo">${text}</span>`;

/** One föreningsuppgift written into an answer as foreningsuppgifter.ts shows it, or its chip while it is missing. */
function skrivUppgift(namn: Uppgift, uppgifter: Foreningsuppgifter): string {
  const { text, lank, saknas } = visaUppgift(namn, uppgifter);
  if (text === undefined) return fyllsI(saknas);
  return lank ? `<a href="${escapa(lank)}">${escapa(text)}</a>` : escapa(text);
}

/** The names an answer can use in braces, e.g. {swish}: every föreningsuppgift. */
export const UPPGIFTSNAMN: readonly string[] = UPPGIFTER;

/**
 * Fills the föreningsuppgifter into an answer's rendered HTML: `{swish}` becomes the Swish number, or the
 * chip "fylls i" while it is missing. Only text is touched, never a tag's attributes or code. An empty
 * answer becomes "fylls i av föreningen". An unknown name, or an image the page cannot show, stops the
 * build, so a mistake never reaches the page.
 */
export function fyllIUppgifter(html: string, uppgifter: Foreningsuppgifter): string {
  if (!html.trim()) return `<p>${fyllsI("fylls i av föreningen")}</p>`;
  if (/<img\b/i.test(html)) {
    throw new Error("Ett svar i Vanliga frågor har en bild. Svaren kan bara ha text, listor och länkar.");
  }
  let iKod = 0;
  return html
    .split(/(<[^>]*>)/)
    .map((del) => {
      if (del.startsWith("<")) {
        if (/^<(code|pre)\b/i.test(del)) iKod++;
        else if (/^<\/(code|pre)>/i.test(del)) iKod = Math.max(0, iKod - 1);
        return del;
      }
      if (iKod > 0) return del;
      return del.replace(/\{\s*([^{}\s]+)\s*\}/g, (hela, namn: string) => {
        const uppgift = UPPGIFTER.find((u) => u.toLowerCase() === namn.toLowerCase());
        if (!uppgift) {
          throw new Error(
            `Ett svar i Vanliga frågor nämner ${hela}, som inte finns. Använd en av: ${UPPGIFTSNAMN.map((n) => `{${n}}`).join(", ")}`,
          );
        }
        return skrivUppgift(uppgift, uppgifter);
      });
    })
    .join("");
}

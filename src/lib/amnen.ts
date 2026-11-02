/**
 * The four topics (Ämne) an inlägg can have, in the order the design system lists them. The one
 * place they are defined: the schema, the topic names on the pages, the knot's colour and the drop-down
 * in `.pages.yml` (checked by tests/unit/pages-cms.test.ts) all read from here.
 *
 * `knutfarg` is the core of the topic's knot on the gold thread: red for a report, cobalt for
 * association news, green for a family story and ink for a thank-you.
 */
export const AMNEN = [
  { varde: "rapport", namn: "Rapport från Addis Abeba", knutfarg: "var(--color-thread-red)" },
  { varde: "forening", namn: "Nyhet från föreningen", knutfarg: "var(--color-thread-cobalt)" },
  { varde: "familj", namn: "Berättelse från en familj", knutfarg: "var(--color-green)" },
  { varde: "tack", namn: "Tack till faddrarna", knutfarg: "var(--color-ink)" },
] as const;

export type Amne = (typeof AMNEN)[number]["varde"];

/** The topics' values, as the schema and Pages CMS store them. */
export const amnesvarden = AMNEN.map((amne) => amne.varde) as [Amne, ...Amne[]];

/** Looks up a topic by its value. */
export function amne(varde: Amne) {
  return AMNEN.find((amne) => amne.varde === varde)!;
}

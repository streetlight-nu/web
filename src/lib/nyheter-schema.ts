import { z } from "astro/zod";

/** The four topics (Ämne) a post can have, in the order the design system lists them. */
export const amnen = ["rapport", "forening", "familj", "tack"] as const;
export type Amne = (typeof amnen)[number];

const text = z.string().trim().min(1);

/**
 * An optional field. Pages CMS writes a field the editor left empty as `''` (or `null`),
 * which means the same as leaving it out.
 */
function valfri<T extends z.ZodType>(falt: T) {
  return z.preprocess((varde) => (varde === "" || varde === null ? undefined : varde), falt.optional());
}

/**
 * The schema for a post (Inlägg) in the Nyheter collection. It knows nothing about Astro,
 * so it can be tested on its own. Astro passes its `image()` helper, which turns the path
 * into an image that is optimised at build time; without it the path stays a string.
 */
export function inlaggSchema<Bild extends z.ZodType = z.ZodString>(image?: Bild) {
  return z
    .object({
      title: text,
      // YAML gives a Date for `2026-09-14`, the CMS may give a string. An empty field must
      // not slip through as 1970, which `z.coerce.date()` would make of null.
      date: z.union([z.date(), text.pipe(z.coerce.date())]),
      topic: z.enum(amnen),
      place: valfri(text),
      lede: text,
      image: valfri((image ?? z.string()) as Bild),
      imageAlt: valfri(text),
      showsChildren: z.boolean().default(false),
      consent: z.boolean().default(false),
      /** An example post (Exempelinlägg): made up to show the template, marked "Exempel". */
      example: z.boolean().default(false),
    })
    .superRefine((inlagg, ctx) => {
      if (inlagg.image !== undefined && !inlagg.imageAlt) {
        ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "En bild måste ha en alt-text (imageAlt)." });
      }
      if (inlagg.topic === "familj" && !inlagg.consent) {
        ctx.addIssue({
          code: "custom",
          path: ["consent"],
          message: "En Berättelse från en familj kräver familjens samtycke (consent).",
        });
      }
      if (inlagg.showsChildren && !inlagg.consent) {
        ctx.addIssue({
          code: "custom",
          path: ["consent"],
          message: "En bild där barn visas kräver familjens samtycke (consent).",
        });
      }
    });
}

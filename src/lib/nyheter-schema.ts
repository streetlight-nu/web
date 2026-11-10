import { z } from "astro/zod";

import { amnesvarden } from "./amnen";
import { valfri } from "./falt";


/** A text that must be filled in: not empty and not only blanks. */
const ifylldText = z.string().trim().min(1);

/**
 * The schema for an inlägg in the Nyheter collection. It knows nothing about Astro,
 * so it can be tested on its own. Astro passes its `image()` helper, which turns the path
 * into an image that is optimised at build time; without it the path stays a string.
 */
export function inlaggSchema<Bild extends z.ZodType = z.ZodString>(image?: Bild) {
  return z
    .object({
      title: ifylldText,
      // YAML gives a Date for `2026-09-14`, the CMS may give a string. An empty field must
      // not slip through as 1970, which `z.coerce.date()` would make of null.
      date: z.union([z.date(), ifylldText.pipe(z.coerce.date())]),
      topic: z.enum(amnesvarden),
      place: valfri(ifylldText),
      lede: ifylldText,
      image: valfri((image ?? z.string()) as Bild),
      imageAlt: valfri(ifylldText),
      /** An Exempelinlägg: made up to show the template, marked "Exempel". */
      example: z.boolean().default(false),
    })
    .superRefine((inlagg, ctx) => {
      if (inlagg.image !== undefined && !inlagg.imageAlt) {
        ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "En bild måste ha en alt-text (imageAlt)." });
      }
    });
}

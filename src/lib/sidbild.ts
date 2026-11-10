import { z } from "astro/zod";

import { valfri } from "./falt";

/**
 * A photo on one of the site's own pages (Om föreningen, Vår historia), uploaded through Pages CMS.
 *
 * Pages CMS uploads it to `src/assets/sidor` (the media folder `sidor` in `.pages.yml`) and writes
 * the path as `/src/assets/sidor/<file>`, which the component Foto finds and optimises at build
 * time. Until a photo is uploaded the page shows a placeholder with a suggested photo.
 * The same rule as for an inlägg: a photo needs an alt text, or it stops the build. The site does
 * not check consent; the association does that before uploading.
 */

/** Where Pages CMS puts the pages' photos, and how the path starts in the data files. */
export const SIDBILDER = "/src/assets/sidor/";

const ifylldText = z.string().trim().min(1);

export const sidbildSchema = z
  .strictObject({
    src: valfri(
      ifylldText.refine((src) => src.startsWith(SIDBILDER), {
        message: `Fotot ska laddas upp i mappen för sidornas foton (${SIDBILDER}).`,
      }),
    ),
    alt: valfri(ifylldText),
  })
  .superRefine((bild, ctx) => {
    if (bild.src === undefined) return;
    if (!bild.alt) {
      ctx.addIssue({ code: "custom", path: ["alt"], message: "Ett foto måste ha en alt-text." });
    }
  });

/** An optional photo field: missing, null or with an empty file all mean "no photo yet". */
export const valfriSidbild = valfri(sidbildSchema);

export type Sidbild = z.infer<typeof sidbildSchema>;

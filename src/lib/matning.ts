import { z } from "astro/zod";

import { datafil } from "./datafil";
import { valfri } from "./falt";

/**
 * Mätning: the id of the association's Google Tag Manager container, which measures visits and gifts together with
 * Repejo's events (ADR 0004).
 *
 * The id lives in one data file, `src/data/matning.json`, which the association fills in through Pages CMS (see
 * `.pages.yml`). Without an id the site loads nothing and shows no Kakrutan, as before. With one, the container is
 * loaded only after the visitor has accepted in the Kakrutan (`src/components/Kakruta.astro`).
 */
export interface Matning {
  /** The container's id, for example "GTM-ABC1234". Missing: no measurement. */
  gtmId?: string;
}

/** The same rule as the `gtmId` field's pattern in `.pages.yml`. */
export const GTM_ID = /^GTM-[A-Z0-9]+$/;

export const matningSchema = z.strictObject({
  gtmId: valfri(
    z
      .string()
      .trim()
      .regex(GTM_ID, {
        message: "gtmId måste börja med GTM- och sedan ha versaler och siffror",
      }),
  ),
});

/** The data file. MATNING_FIL points elsewhere, so the browser tests can build with a test file. */
export const MATNING_DATAFIL = datafil({
  fil: "src/data/matning.json",
  miljovariabel: "MATNING_FIL",
  cmsNamn: "matning",
  schema: matningSchema,
  fel: "Mätningens uppgifter är felaktiga",
});

/** Checks the contents of the data file. Unknown fields and malformed ids fail the build. */
export const tolkaMatning: (data: unknown) => Matning = MATNING_DATAFIL.tolka;

/** Reads the measurement settings from the data file, once per build. */
export function hamtaMatning(): Matning {
  return MATNING_DATAFIL.hamta();
}

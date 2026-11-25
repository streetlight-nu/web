import { hamtaJulkampanj } from "./julkampanj";
import { idagISverige, lageForDag, skrivDatum, type Julinsamlingslage } from "./julperiod";

/**
 * Julinsamlingen runs between two dates the association writes in Pages CMS (`startdatum` and `slutdatum` in
 * src/data/julkampanj.json). While it runs, the menu link, the section on the home page and Repejo's julpaket
 * checkout are shown. Before and after it, /julpaket stays, with Repejo's Swish checkout for a one-off gift instead.
 *
 * The site is static, so the build writes the page as it stands on the build day. The browser then looks at the
 * dates again and swaps what differs (`Julvaxel.astro`, `JulinsamlingSkript.astro`). So the campaign starts and ends on
 * its dates without a new build; a visitor without JavaScript sees the page as of the last build.
 * While developing (`astro dev`) the campaign always runs. The browser tests set the day with `page.clock`.
 */
export interface Julinsamling {
  /** The state on the build day, which is what the HTML shows until the browser's script has looked at the date. */
  lage: Julinsamlingslage;
  start?: string;
  slut?: string;
  /** Written for a visitor: "29 november". */
  startText?: string;
  slutText?: string;
  /** Set when the state does not follow the date (`astro dev`), so the browser keeps it. */
  fast?: Julinsamlingslage;
}

/** Reads the dates, once per build. */
export function hamtaJulinsamling(): Julinsamling {
  const { startdatum: start, slutdatum: slut } = hamtaJulkampanj();
  const texter = {
    start,
    slut,
    startText: start && skrivDatum(start),
    slutText: slut && skrivDatum(slut),
  };
  if (import.meta.env.DEV) return { ...texter, lage: "pagar", fast: "pagar" };
  return { ...texter, lage: lageForDag(idagISverige(), start, slut) };
}

import { hamtaJulpaket } from "./julpaket";
import { flyttaDatum, idagISverige, LANK_MARGINAL_DAGAR, lageForDag, skrivDatum, visaLank, type Julpaketlage } from "./julpaketdatum";

/**
 * Ge ett julpaket runs between two dates the association writes in Pages CMS (`startdatum` and `slutdatum` in
 * src/data/julpaket.json). While it runs, the section on the home page and Repejo's julpaket checkout are shown.
 * The link in the menu is shown a week longer on each side. Before and after it, /julpaket stays, with Repejo's Swish checkout for a one-off gift instead.
 *
 * The site is static, so the build writes the page as it stands on the build day. The browser then looks at the
 * dates again and swaps what differs (`Julvaxel.astro`, `JulpaketSkript.astro`). So the campaign starts and ends on
 * its dates without a new build; a visitor without JavaScript sees the page as of the last build.
 * While developing (`astro dev`) the campaign always runs. The browser tests set the day with `page.clock`.
 */
export interface Julpaketperiod {
  /** The state on the build day, which is what the HTML shows until the browser's script has looked at the date. */
  lage: Julpaketlage;
  start?: string;
  slut?: string;
  /** Written for a visitor: "29 november". */
  startText?: string;
  slutText?: string;
  /** Whether the link in the menu is shown on the build day: from a week before the start to a week after the end. */
  lank: boolean;
  /** The first and last day the link in the menu is shown. */
  lankFran?: string;
  lankTill?: string;
  /** Set when the state does not follow the date (`astro dev`), so the browser keeps it. */
  fast?: Julpaketlage;
}

/** Reads the dates, once per build. */
export function hamtaJulpaketperiod(): Julpaketperiod {
  const { startdatum: start, slutdatum: slut } = hamtaJulpaket();
  const texter = {
    start,
    slut,
    lankFran: start && flyttaDatum(start, -LANK_MARGINAL_DAGAR),
    lankTill: slut && flyttaDatum(slut, LANK_MARGINAL_DAGAR),
    startText: start && skrivDatum(start),
    slutText: slut && skrivDatum(slut),
  };
  if (import.meta.env.DEV) return { ...texter, lage: "pagar", lank: true, fast: "pagar" };
  const idag = idagISverige();
  return { ...texter, lage: lageForDag(idag, start, slut), lank: visaLank(idag, start, slut) };
}

/**
 * Repejo (https://repejo.se): the association's fundraising service, which handles payment, the checkout
 * and the progress bar towards the fundraising goal. It is an external service the campaign page calls (ADR 0003).
 */

/** Repejo's host. The browser tests stub it. */
export const REPEJO_HOST = "https://app.repejo.se";

/** The association's organisation id at Repejo. */
export const REPEJO_ORGANISATION = "org_2ipufW9fncbNaQ5aFFYTLH";

/** The short code of the Christmas campaign "Ge en julklapp som sprider hopp". */
export const JULKAMPANJ_KORTKOD = "TSpuB";

/** The short code of the checkout for becoming a fadder (the gold field "Bli fadder" on the page Bli fadder). */
export const FADDER_KORTKOD = "7r3dB";

/** The short code of the Swish checkout for a one-off gift (the row "Swisha en gåva" under Fler sätt att stödja oss). */
export const SWISH_KORTKOD = "pUnFu";

/** Repejo's own page for a campaign: the fallback when its script does not load. */
export function kampanjsida(kortkod: string): string {
  return `${REPEJO_HOST}/s/${kortkod}`;
}

/**
 * Repejo's categories for the fundraisers a visitor starts themselves (p2p), behind `<repejo-p2p-create-button>` on
 * Engagera dig. A category is Repejo's own value; `null` until the association has given it, and the page then shows
 * the chip "fylls i" instead of a button.
 */
export const INSAMLINGSKATEGORI = {
  fodelsedag: "birthday",
  jubileum: null,
  sportevent: null,
} as const satisfies Record<string, string | null>;

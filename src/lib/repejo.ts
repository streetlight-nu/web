/**
 * Repejo (https://repejo.se): the association's fundraising service, which handles payment, the checkout
 * and the progress bar towards the fundraising goal. It is the only external service a page may call,
 * and only a page that needs it (ADR 0003).
 */

/** Repejo's host. The browser tests allow requests to it only on the campaign page. */
export const REPEJO_HOST = "https://app.repejo.se";

/** The association's organisation id at Repejo. */
export const REPEJO_ORGANISATION = "org_2ipufW9fncbNaQ5aFFYTLH";

/** The short code of the Christmas campaign "Ge en julklapp som sprider hopp". */
export const JULKAMPANJ_KORTKOD = "TSpuB";

/** Repejo's own page for a campaign: the fallback when its script does not load. */
export function kampanjsida(kortkod: string): string {
  return `${REPEJO_HOST}/s/${kortkod}`;
}

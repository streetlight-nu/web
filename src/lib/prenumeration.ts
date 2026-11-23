/**
 * Prenumeration: a person asks to get the association's news by e-mail.
 *
 * The form is the association's own form at Wix (https://streetlightnu.wixforms.com), embedded in the section
 * "Få nyheterna med e-post" on Nyheter. What the visitor fills in goes to Wix and never to this site. It is an
 * external service the page calls (ADR 0003).
 */

/** Wix's host. The browser tests stub it. */
export const WIX_HOST = "https://streetlightnu.wixforms.com";

/** The address of the form "Nyhetsbrev registrering", the one place the form is named. */
export const PRENUMERATION_URL = `${WIX_HOST}/f/7530735656188773442`;

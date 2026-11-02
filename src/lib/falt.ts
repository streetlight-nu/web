import { z } from "astro/zod";

/**
 * Shared rules for the fields people fill in: in Pages CMS (Nyheter, Föreningsuppgifter) and in the
 * intresseanmälan form.
 */

/**
 * An optional field. Pages CMS writes a field the editor left empty as `''` (or `null`), and a blank
 * field means the same: all three count as missing, as if the field were left out.
 */
export function valfri<T extends z.ZodType>(falt: T) {
  return z.preprocess(
    (varde) => (varde === null || (typeof varde === "string" && varde.trim() === "") ? undefined : varde),
    falt.optional(),
  );
}

/** The same rule as the `epost` field's pattern in `.pages.yml`: something@something.domain, no spaces. */
const EPOSTADRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when the text, without surrounding blanks, looks like an e-mail address. */
export function arEpostadress(text: string): boolean {
  return EPOSTADRESS.test(text.trim());
}

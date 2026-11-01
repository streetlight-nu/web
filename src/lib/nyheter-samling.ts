import { getCollection } from "astro:content";

import { nyastForst } from "./nyheter";

/**
 * Every post in Nyheter, newest first. The one place the pages read the collection from:
 * /nyheter, each post's "Nyare" and "Äldre", and "Senaste nytt" on the start page.
 */
export async function allaNyheter() {
  return nyastForst(await getCollection("nyheter"));
}

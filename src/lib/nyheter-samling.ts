import { getCollection } from "astro:content";

import { nyastForst } from "./nyheter";

/**
 * Every inlägg in Nyheter, newest first. The one place the pages read the collection from:
 * /nyheter, each inlägg's "Nyare" and "Äldre", and "Senaste nytt" on the start page.
 */
export async function allaNyheter() {
  const inlagg = await getCollection("nyheter");
  return nyastForst(inlagg);
}

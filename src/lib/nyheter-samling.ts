import { getCollection } from "astro:content";

import { kontrolleraBrodtextensBilder } from "./brodtextens-bilder";
import { nyastForst } from "./nyheter";

/**
 * Every post in Nyheter, newest first. The one place the pages read the collection from:
 * /nyheter, each post's "Nyare" and "Äldre", and "Senaste nytt" on the start page.
 * A post with images in its body text but without consent stops the build here.
 */
export async function allaNyheter() {
  const inlagg = await getCollection("nyheter");
  kontrolleraBrodtextensBilder(inlagg);
  return nyastForst(inlagg);
}

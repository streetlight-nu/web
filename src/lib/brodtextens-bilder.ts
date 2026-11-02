/**
 * Bilder i brödtexten. Schemat ser bara inläggets fält, inte brödtexten, så samtycket för bilder
 * som redaktören lägger in i texten kontrolleras här, när bygget läser samlingen.
 */

interface InlaggMedBrodtext {
  id: string;
  body?: string;
  data: { consent: boolean; example: boolean };
}

// A Markdown image, `![alt](src)` or `![alt][ref]`, or an HTML <img>.
const BILD = /!\[[^\]]*\]\s*[([]|<img\b/i;

/** True when the body text shows at least one image. */
export function harBilderIBrodtexten(brodtext: string): boolean {
  return BILD.test(brodtext);
}

/**
 * Stops the build when a post that is not an example post (Exempelinlägg) has images in its body
 * text without the family's consent. One error names every such post.
 */
export function kontrolleraBrodtextensBilder(inlagg: InlaggMedBrodtext[]): void {
  const utanSamtycke = inlagg.filter(
    ({ body, data }) => !data.example && !data.consent && harBilderIBrodtexten(body ?? ""),
  );
  if (utanSamtycke.length === 0) return;
  throw new Error(
    "Ett inlägg med bilder i brödtexten kräver familjens samtycke (consent). " +
      "Kryssa i ”Familjen har gett sitt samtycke” när familjen har sagt ja, eller ta bort bilderna:\n" +
      utanSamtycke.map(({ id }) => `  - src/content/nyheter/${id}.md`).join("\n"),
  );
}

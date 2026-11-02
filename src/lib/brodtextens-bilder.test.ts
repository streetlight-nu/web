import { describe, expect, test } from "vitest";

import { kontrolleraBrodtextensBilder } from "./brodtextens-bilder";

const inlagg = (id: string, body: string, data: { consent?: boolean; example?: boolean } = {}) => ({
  id,
  body,
  data: { consent: false, example: false, ...data },
});

const markdownbild = "Första skoldagen.\n\n![Två barn på skolgården](../../assets/nyheter/skolgarden.jpg)\n";
const htmlbild = 'Första skoldagen.\n\n<figure><img src="../../assets/nyheter/skolgarden.jpg" alt="Skolgården"></figure>\n';

describe("bilder i brödtexten", () => {
  test("stoppar bygget när ett inlägg har en Markdown-bild i brödtexten utan samtycke", () => {
    expect(() => kontrolleraBrodtextensBilder([inlagg("skolstart", markdownbild)])).toThrow(/skolstart/);
  });

  test("stoppar bygget när ett inlägg har en <img> i brödtexten utan samtycke", () => {
    expect(() => kontrolleraBrodtextensBilder([inlagg("skolstart", htmlbild)])).toThrow(/samtycke/);
  });

  test("godtar bilder i brödtexten när familjen har gett sitt samtycke", () => {
    expect(() => kontrolleraBrodtextensBilder([inlagg("skolstart", markdownbild, { consent: true })])).not.toThrow();
  });

  test("godtar bilder i brödtexten i ett exempelinlägg", () => {
    expect(() => kontrolleraBrodtextensBilder([inlagg("skolstart", htmlbild, { example: true })])).not.toThrow();
  });

  test("godtar ett inlägg utan bilder i brödtexten, även när det har länkar", () => {
    const text = "Läs [årsredovisningen](https://example.se/arsredovisning.pdf). Foto: <span>platshållare</span>";
    expect(() => kontrolleraBrodtextensBilder([inlagg("arsmote", text)])).not.toThrow();
    expect(() => kontrolleraBrodtextensBilder([{ id: "tomt", data: { consent: false, example: false } }])).not.toThrow();
  });

  test("nämner varje inlägg som saknar samtycke i ett och samma fel", () => {
    expect(() =>
      kontrolleraBrodtextensBilder([inlagg("skolstart", markdownbild), inlagg("ok", "Text"), inlagg("julen", htmlbild)]),
    ).toThrow(/skolstart[\s\S]*julen/);
  });
});

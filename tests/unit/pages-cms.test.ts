import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { AMNEN } from "@/lib/amnen";
import { inlaggSchema } from "@/lib/nyheter-schema";

const rot = path.resolve(import.meta.dirname, "../..");
const fixturer = path.join(import.meta.dirname, "fixtures/pages-cms");

/** Splits a Markdown file into its frontmatter (parsed as YAML, as Astro does) and its body. */
function lasInlagg(fil: string) {
  const text = readFileSync(path.join(fixturer, fil), "utf8");
  const [, frontmatter, brodtext] = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  return { data: parse(frontmatter), brodtext };
}

interface Falt {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { values?: { name: string; label: string }[]; format?: string };
}

interface Samling {
  name: string;
  label: string;
  type: string;
  path: string;
  filename: string;
  view: { primary: string };
  fields: Falt[];
}

const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  media: { input: string; output: string };
  content: Samling[];
};
const nyheter = konfiguration.content.find((samling) => samling.name === "nyheter")!;

describe("ett inlägg sparat i Pages CMS", () => {
  test("klarar schemat när alla fält är ifyllda, med bild, barn och samtycke", () => {
    const { data } = lasInlagg("berattelse-med-barnfoto.md");
    const resultat = inlaggSchema().safeParse(data);
    expect(resultat.error?.issues).toBeUndefined();
    expect(resultat.data?.topic).toBe("familj");
  });

  test("klarar schemat när de valfria fälten har lämnats tomma", () => {
    const { data } = lasInlagg("rapport-utan-valfria-falt.md");
    const resultat = inlaggSchema().safeParse(data);
    expect(resultat.error?.issues).toBeUndefined();
    expect(resultat.data?.place).toBeUndefined();
    expect(resultat.data?.image).toBeUndefined();
  });

  test("avvisas fortfarande när ett tomt fält är obligatoriskt", () => {
    const { data } = lasInlagg("rapport-utan-valfria-falt.md");
    expect(inlaggSchema().safeParse({ ...data, lede: "" }).success).toBe(false);
    expect(inlaggSchema().safeParse({ ...data, date: "" }).success).toBe(false);
    expect(inlaggSchema().safeParse({ ...data, image: "../../assets/nyheter/a.jpg" }).success).toBe(false);
  });
});

describe("samlingen Nyheter i .pages.yml", () => {
  test("ligger i samma mapp som Astros samling", () => {
    expect(nyheter).toMatchObject({ label: "Nyheter", type: "collection", path: "src/content/nyheter" });
  });

  test("namnger nya inlägg med Pages CMS dokumenterade platshållare, så att titeln blir adressen", () => {
    // Pages CMS (lib/schema.ts, generateFilename): datumdelarna, {primary} för huvudfältet och {fields.<namn>}.
    const kanda = ["year", "month", "day", "hour", "minute", "second", "primary"];
    const platshallare = [...nyheter.filename.matchAll(/\{([^}]+)\}/g)].map(([, namn]) => namn);
    expect(platshallare.length).toBeGreaterThan(0);
    for (const namn of platshallare) {
      const falt = namn.startsWith("fields.") && nyheter.fields.some((f) => `fields.${f.name}` === namn);
      expect(kanda.includes(namn) || falt, `{${namn}}`).toBe(true);
    }
    expect(nyheter.filename).toMatch(/\.md$/);
    expect(nyheter.view.primary).toBe("title");
  });

  test("har exakt schemats fält, plus brödtexten", () => {
    const schemafalt = Object.keys(inlaggSchema().shape);
    expect(nyheter.fields.map((falt) => falt.name).sort()).toEqual([...schemafalt, "body"].sort());
  });

  test("markerar samma fält som obligatoriska som schemat", () => {
    const obligatoriska = nyheter.fields.filter((falt) => falt.required).map((falt) => falt.name);
    expect(obligatoriska.sort()).toEqual(["date", "lede", "title", "topic"]);
  });

  test("ger ämnet som en rullista med de fyra ämnena och deras svenska namn", () => {
    const amne = nyheter.fields.find((falt) => falt.name === "topic")!;
    expect(amne.type).toBe("select");
    expect(amne.options?.values).toEqual(AMNEN.map(({ varde, namn }) => ({ name: varde, label: namn })));
  });

  test("sparar brödtexten som Markdown med rich text", () => {
    const brodtext = nyheter.fields.find((falt) => falt.name === "body")!;
    expect(brodtext.type).toBe("rich-text");
    expect(brodtext.options?.format).toBe("markdown");
  });

  test("har bara svenska etiketter", () => {
    for (const falt of nyheter.fields) expect(falt.label).not.toBe(falt.name);
  });
});

describe("bilder från Pages CMS", () => {
  test("laddas upp under src/, där bygget optimerar dem, inte i public/", () => {
    expect(konfiguration.media.input).toMatch(/^src\/assets\//);
  });

  test("skrivs med en sökväg som från inläggets mapp leder till uppladdningsmappen", () => {
    const fran = path.join(rot, nyheter.path);
    expect(path.resolve(fran, konfiguration.media.output)).toBe(path.resolve(rot, konfiguration.media.input));
  });

  test("i fixturen pekar på uppladdningsmappen, både bilden och bilden i brödtexten", () => {
    const { data, brodtext } = lasInlagg("berattelse-med-barnfoto.md");
    expect(data.image.startsWith(`${konfiguration.media.output}/`)).toBe(true);
    expect(brodtext).toContain(`](${konfiguration.media.output}/`);
  });
});

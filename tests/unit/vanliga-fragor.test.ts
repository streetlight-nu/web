import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { fragaSchema, fyllIUppgifter, GRUPPER, perGrupp, UPPGIFTSNAMN } from "@/lib/vanliga-fragor";

interface Falt {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  description?: string;
  options?: { values?: { name: string; label: string }[]; format?: string };
}

const rot = path.resolve(import.meta.dirname, "../..");
const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  content: { name: string; type: string; path: string; filename: string; view: { primary: string }; fields: Falt[] }[];
};
const samling = konfiguration.content.find((del) => del.name === "vanligaFragor")!;

describe("en fråga sparad i Pages CMS", () => {
  test("klarar schemat med bara frågan och gruppen ifyllda", () => {
    expect(fragaSchema.parse({ fraga: " Hur väljs barnen ut? ", grupp: "barnen", ordning: null })).toEqual({
      fraga: "Hur väljs barnen ut?",
      grupp: "barnen",
    });
  });

  test("stoppar bygget utan fråga, med en okänd grupp eller ett okänt fält", () => {
    expect(() => fragaSchema.parse({ fraga: "", grupp: "fadder" })).toThrow();
    expect(() => fragaSchema.parse({ fraga: "Varför?", grupp: "okand" })).toThrow();
    expect(() => fragaSchema.parse({ fraga: "Varför?", grupp: "fadder", svar: "Därför." })).toThrow();
  });
});

describe("frågorna per grupp", () => {
  const fraga = (id: string, grupp: string, ordning?: number) => ({ id, data: { fraga: id, grupp, ordning } });

  test("står i gruppernas ordning, och inom en grupp efter ordning och sedan fråga", () => {
    const grupper = perGrupp([
      fraga("medlem", "foreningen"),
      fraga("b", "fadder", 2),
      fraga("a", "fadder"),
      fraga("c", "fadder", 1),
      fraga("valjs", "barnen", 1),
    ] as never);
    expect(grupper.map((g) => [g.rubrik, g.fragor.map((f) => f.id)])).toEqual([
      ["Att vara fadder", ["c", "b", "a"]],
      ["Barnen och familjerna", ["valjs"]],
      ["Föreningen", ["medlem"]],
    ]);
  });

  test("en grupp utan frågor visas inte", () => {
    expect(perGrupp([fraga("valjs", "barnen")] as never).map((g) => g.rubrik)).toEqual(["Barnen och familjerna"]);
  });
});

describe("föreningsuppgifter i ett svar", () => {
  const ifyllda = {
    swish: "123 456 78 90",
    epost: "info@example.org",
    kontaktperson: "Anna <Andersson>",
    organisationsnummer: "802000-0000",
    nittiokonto: "90 00 00-0",
    arsredovisning: "https://example.org/ar.pdf",
  };

  test("ersätts med föreningens uppgifter", () => {
    expect(fyllIUppgifter("<p>Swish: {swish}. Fråga {kontaktperson} på {epost}.</p>", ifyllda)).toBe(
      '<p>Swish: 123 456 78 90. Fråga Anna &lt;Andersson&gt; på <a href="mailto:info@example.org">info@example.org</a>.</p>',
    );
    expect(fyllIUppgifter("<p>{arsredovisning}</p>", ifyllda)).toBe(
      '<p><a href="https://example.org/ar.pdf">Läs årsredovisningen</a></p>',
    );
  });

  test("visas som ”fylls i” när uppgiften saknas", () => {
    expect(fyllIUppgifter("<p>{swish}, {epost}, {organisationsnummer}, {arsredovisning}</p>", {})).toBe(
      '<p><span class="sl-todo">nummer fylls i</span>, <span class="sl-todo">e-post fylls i</span>, ' +
        '<span class="sl-todo">nummer fylls i</span>, <span class="sl-todo">länk fylls i</span></p>',
    );
  });

  test("ett tomt svar visas som ”fylls i av föreningen”", () => {
    expect(fyllIUppgifter("", ifyllda)).toBe('<p><span class="sl-todo">fylls i av föreningen</span></p>');
    expect(fyllIUppgifter("  \n", ifyllda)).toBe('<p><span class="sl-todo">fylls i av föreningen</span></p>');
  });

  test("stoppar bygget vid en okänd uppgift, så att ett stavfel inte syns på sidan", () => {
    expect(() => fyllIUppgifter("<p>{swihs}</p>", ifyllda)).toThrow(/\{swihs\}/);
  });

  test("tål mellanslag och stor bokstav inom klamrarna", () => {
    expect(fyllIUppgifter("<p>{ Swish }</p>", ifyllda)).toBe("<p>123 456 78 90</p>");
  });

  test("rör inte klamrar i en länkadress eller i kod", () => {
    const html = '<p><a href="https://example.org/?q={swish}">x</a> <code>{swish}</code> {swish}</p>';
    expect(fyllIUppgifter(html, ifyllda)).toBe(
      '<p><a href="https://example.org/?q={swish}">x</a> <code>{swish}</code> 123 456 78 90</p>',
    );
  });

  test("stoppar bygget när ett svar har en bild, som sidan inte kan visa", () => {
    expect(() => fyllIUppgifter('<p><img src="x.jpg" alt="Barn"></p>', ifyllda)).toThrow(/bild/);
  });
});

describe("samlingen Vanliga frågor i .pages.yml", () => {
  test("sparar en Markdown-fil per fråga i src/content/fragor, med frågan som filnamn", () => {
    expect(samling).toMatchObject({ type: "collection", path: "src/content/fragor", filename: "{primary}.md" });
    expect(samling.view.primary).toBe("fraga");
  });

  test("har schemats fält och svaret som brödtext, med svenska etiketter", () => {
    expect(samling.fields.map((f) => f.name).sort()).toEqual([...Object.keys(fragaSchema.shape), "body"].sort());
    expect(samling.fields.find((f) => f.name === "body")).toMatchObject({ type: "rich-text", options: { format: "markdown" } });
    for (const falt of samling.fields) expect(falt.label).not.toBe(falt.name);
  });

  test("svarsfältets hjälptext nämner varje föreningsuppgift som går att skriva in", () => {
    const beskrivning = samling.fields.find((f) => f.name === "body")!.description!;
    for (const namn of UPPGIFTSNAMN) expect(beskrivning).toContain(`{${namn}}`);
  });

  test("grupperna i formuläret är sidans grupper", () => {
    const grupp = samling.fields.find((f) => f.name === "grupp")!;
    expect(grupp.options!.values).toEqual(GRUPPER.map(({ namn, rubrik }) => ({ name: namn, label: rubrik })));
  });
});

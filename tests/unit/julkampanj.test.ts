import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { DATAFIL, julkampanjSchema, tolkaJulkampanj } from "@/lib/julkampanj";

interface Falt {
  name: string;
  label: string;
  type: string;
}

const rot = path.resolve(import.meta.dirname, "../..");
const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  content: { name: string; type: string; path: string; format: string; fields: Falt[] }[];
};
const julkampanj = konfiguration.content.find((del) => del.name === "julkampanj")!;

describe("julkampanjens uppgifter i src/data/julkampanj.json", () => {
  // Only the schema: the association fills the file in through Pages CMS, so its values are not the tests' business.
  test("datafilen i repot klarar schemat", () => {
    const data = JSON.parse(readFileSync(path.join(rot, DATAFIL), "utf8"));
    expect(() => tolkaJulkampanj(data)).not.toThrow();
  });

  test("tomma fält räknas som inte ifyllda", () => {
    expect(tolkaJulkampanj({ sistaDag: "", vadJulklappenGor: "   ", epost: "" })).toEqual({});
  });

  test("stoppar bygget när e-posten inte är en e-postadress eller ett okänt fält finns", () => {
    expect(() => tolkaJulkampanj({ epost: "inte en adress" })).toThrow(/epost/);
    expect(() => tolkaJulkampanj({ belopp: "100 kr" })).toThrow();
  });
});

describe("formuläret Julkampanjen i .pages.yml", () => {
  test("redigerar samma datafil som sidan läser", () => {
    expect(julkampanj).toMatchObject({ type: "file", path: DATAFIL, format: "json" });
  });

  test("har exakt schemats fält, med svenska etiketter", () => {
    expect(julkampanj.fields.map((f) => f.name).sort()).toEqual(Object.keys(julkampanjSchema.shape).sort());
    for (const falt of julkampanj.fields) expect(falt.label).not.toBe(falt.name);
  });
});

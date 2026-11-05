import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import data from "@/data/historia.json";
import { handelseSchema, historiaSchema, periodId, periodSchema, tolkaHistoria } from "@/lib/historia";

interface Falt {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  list?: boolean;
  fields?: Falt[];
}

const rot = path.resolve(import.meta.dirname, "../..");
const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  content: (Falt & { path: string; format: string })[];
};
const historia = konfiguration.content.find((del) => del.name === "historia")!;
const namn = (falt: Falt[]) => falt.map((f) => f.name).sort();

describe("historien i src/data/historia.json", () => {
  test("klarar schemat", () => {
    expect(() => tolkaHistoria(data)).not.toThrow();
  });

  test("räknar tomma fält som saknade, så att sidan visar ”fylls i”", () => {
    const tolkad = tolkaHistoria({
      ingress: "",
      perioder: [{ rubrik: "1995–1999", namn: null, handelser: [{ ar: " ", rubrik: "Starten" }] }],
    });
    expect(tolkad.ingress).toBeUndefined();
    expect(tolkad.perioder[0].namn).toBeUndefined();
    expect(tolkad.perioder[0].handelser[0]).toEqual({ rubrik: "Starten" });
  });

  test("stoppar bygget när en period saknar rubrik eller ett okänt fält finns", () => {
    expect(() => tolkaHistoria({ perioder: [{ rubrik: "", handelser: [] }] })).toThrow(/rubrik/);
    expect(() => tolkaHistoria({ perioder: [{ rubrik: "1995", handelser: [], foto: "x" }] })).toThrow();
    expect(() => tolkaHistoria({ perioder: [] })).toThrow();
  });

  test("ger varje period ett ankare utan tankstreck och specialtecken", () => {
    expect(periodId("1995–1999")).toBe("period-1995-1999");
    expect(periodId("2020–idag")).toBe("period-2020-idag");
    expect(periodId("Början")).toBe("period-borjan");
  });
});

describe("formuläret Vår historia i .pages.yml", () => {
  test("redigerar samma datafil som sidan läser", () => {
    expect(historia).toMatchObject({ type: "file", path: "src/data/historia.json", format: "json" });
  });

  test("har exakt schemats fält på varje nivå", () => {
    expect(namn(historia.fields!)).toEqual(Object.keys(historiaSchema.shape).sort());
    const perioder = historia.fields!.find((f) => f.name === "perioder")!;
    expect(perioder).toMatchObject({ type: "object", list: true });
    expect(namn(perioder.fields!)).toEqual(Object.keys(periodSchema.shape).sort());
    const handelser = perioder.fields!.find((f) => f.name === "handelser")!;
    expect(handelser).toMatchObject({ type: "object", list: true });
    expect(namn(handelser.fields!)).toEqual(Object.keys(handelseSchema.shape).sort());
  });

  test("kräver bara periodens årtal, som schemat", () => {
    const perioder = historia.fields!.find((f) => f.name === "perioder")!;
    const obligatoriska = perioder.fields!.filter((f) => f.required).map((f) => f.name);
    expect(obligatoriska).toEqual(["rubrik"]);
  });

  test("har bara svenska etiketter", () => {
    const alla = (falt: Falt[]): Falt[] => falt.flatMap((f) => [f, ...alla(f.fields ?? [])]);
    for (const falt of alla(historia.fields!)) expect(falt.label).not.toBe(falt.name);
  });
});

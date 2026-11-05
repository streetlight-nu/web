import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import data from "@/data/om-foreningen.json";
import {
  grundSchema,
  omForeningenSchema,
  personSchema,
  styrelseSchema,
  stycken,
  tankeSchema,
  tolkaOmForeningen,
  visaGrund,
} from "@/lib/om-foreningen";

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
const om = konfiguration.content.find((del) => del.name === "omForeningen")!;
const namn = (falt: Falt[]) => falt.map((f) => f.name).sort();
const falt = (lista: Falt[], name: string) => lista.find((f) => f.name === name)!;

describe("texterna i src/data/om-foreningen.json", () => {
  test("klarar schemat", () => {
    expect(() => tolkaOmForeningen(data)).not.toThrow();
  });

  test("räknar tomma fält som saknade, så att sidan visar ”fylls i”", () => {
    const tolkad = tolkaOmForeningen({
      ingress: "",
      vision: null,
      tror: [{ rubrik: " ", text: "Text" }],
      styrelser: [{ forening: "Streetlight Etiopien", personer: [{ namn: "", roll: "" }] }],
    });
    expect(tolkad.ingress).toBeUndefined();
    expect(tolkad.vision).toBeUndefined();
    expect(tolkad.tror[0]).toEqual({ text: "Text" });
    expect(tolkad.styrelser[0].personer[0]).toEqual({});
  });

  test("stoppar bygget när en styrelse saknar förening eller ett okänt fält finns", () => {
    expect(() => tolkaOmForeningen({ tror: [], styrelser: [{ forening: "", personer: [] }] })).toThrow(/förening/);
    expect(() => tolkaOmForeningen({ tror: [], styrelser: [], bild: "x" })).toThrow();
  });

  test("delar en text i stycken vid varje tom rad", () => {
    expect(stycken("Ett.\nFortsätter.\n\n  Två.  \n\n\n")).toEqual(["Ett. Fortsätter.", "Två."]);
    expect(stycken(undefined)).toEqual([]);
  });

  test("visar Vår grund bara när föreningen har skrivit något i den", () => {
    expect(visaGrund(undefined)).toBe(false);
    expect(visaGrund({ kalla: "1 Kor 12:26" })).toBe(false);
    expect(visaGrund({ citat: "Citat" })).toBe(true);
  });
});

describe("formuläret Om föreningen i .pages.yml", () => {
  test("redigerar samma datafil som sidan läser", () => {
    expect(om).toMatchObject({ type: "file", path: "src/data/om-foreningen.json", format: "json" });
  });

  test("har exakt schemats fält på varje nivå", () => {
    expect(namn(om.fields!)).toEqual(Object.keys(omForeningenSchema.shape).sort());
    expect(falt(om.fields!, "tror")).toMatchObject({ type: "object", list: true });
    expect(namn(falt(om.fields!, "tror").fields!)).toEqual(Object.keys(tankeSchema.shape).sort());
    expect(falt(om.fields!, "grund")).toMatchObject({ type: "object" });
    expect(falt(om.fields!, "grund").list).toBeUndefined();
    expect(namn(falt(om.fields!, "grund").fields!)).toEqual(Object.keys(grundSchema.shape).sort());
    const styrelser = falt(om.fields!, "styrelser");
    expect(styrelser).toMatchObject({ type: "object", list: true });
    expect(namn(styrelser.fields!)).toEqual(Object.keys(styrelseSchema.shape).sort());
    const personer = falt(styrelser.fields!, "personer");
    expect(personer).toMatchObject({ type: "object", list: true });
    expect(namn(personer.fields!)).toEqual(Object.keys(personSchema.shape).sort());
  });

  test("kräver bara styrelsens förening, som schemat", () => {
    const alla = (lista: Falt[]): Falt[] => lista.flatMap((f) => [f, ...alla(f.fields ?? [])]);
    expect(alla(om.fields!).filter((f) => f.required).map((f) => f.name)).toEqual(["forening"]);
  });

  test("har bara svenska etiketter", () => {
    const alla = (lista: Falt[]): Falt[] => lista.flatMap((f) => [f, ...alla(f.fields ?? [])]);
    for (const f of alla(om.fields!)) expect(f.label).not.toBe(f.name);
  });
});

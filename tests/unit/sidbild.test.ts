import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { tolkaHistoria } from "@/lib/historia";
import { tolkaOmForeningen } from "@/lib/om-foreningen";
import { SIDBILDER, sidbildSchema, valfriSidbild } from "@/lib/sidbild";

interface Falt {
  name: string;
  label: string;
  type: string;
  description?: string;
  options?: { media?: string };
  fields?: Falt[];
}

const rot = path.resolve(import.meta.dirname, "../..");
const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  media: { name: string; input: string; output: string }[];
  content: (Falt & { fields: Falt[] })[];
};
const del = (namn: string) => konfiguration.content.find((d) => d.name === namn)!;
const falt = (lista: Falt[], namn: string) => lista.find((f) => f.name === namn)!;

/** Every photo field on the two pages, as Pages CMS shows them. */
const fotofalt: [string, Falt][] = [
  ["Vår historia, period", falt(falt(del("historia").fields, "perioder").fields!, "bild")],
  ["Vår historia, Idag", falt(del("historia").fields, "idagBild")],
  ["Om föreningen, Så började det", falt(del("omForeningen").fields, "borjanBild")],
  ["Om föreningen, Två föreningar", falt(del("omForeningen").fields, "foreningarBild")],
  ["Om föreningen, Vilka vi är", falt(del("omForeningen").fields, "vilkaBild")],
];

const foto = { src: `${SIDBILDER}merry.jpg`, alt: "Merry och hennes syster framför huset." };

describe("ett foto på Om föreningen och Vår historia", () => {
  test("får saknas, även som Pages CMS sparar ett tomt foto", () => {
    expect(valfriSidbild.parse(undefined)).toBeUndefined();
    expect(valfriSidbild.parse(null)).toBeUndefined();
    expect(sidbildSchema.parse({ src: "", alt: "" })).toEqual({});
  });

  test("klarar schemat med alt-text", () => {
    expect(sidbildSchema.safeParse(foto).success).toBe(true);
  });

  test("stoppar bygget utan alt-text", () => {
    expect(() => sidbildSchema.parse({ ...foto, alt: " " })).toThrow(/alt-text/);
  });

  test("stoppar bygget när fotot ligger utanför sidornas mapp", () => {
    expect(() => sidbildSchema.parse({ ...foto, src: "../../assets/nyheter/merry.jpg" })).toThrow(/mappen/);
  });

  test("går igenom datafilerna, så att ett foto utan alt-text stoppar sidan", () => {
    const utanAlt = { ...foto, alt: "" };
    expect(() => tolkaHistoria({ perioder: [{ rubrik: "1995", handelser: [], bild: utanAlt }] })).toThrow();
    expect(() => tolkaHistoria({ perioder: [{ rubrik: "1995", handelser: [] }], idagBild: utanAlt })).toThrow();
    for (const namn of ["borjanBild", "foreningarBild", "vilkaBild"]) {
      expect(() => tolkaOmForeningen({ tror: [], styrelser: [], [namn]: utanAlt })).toThrow();
    }
  });
});

describe("fotofälten i .pages.yml", () => {
  test("laddar upp till mappen som sidorna läser från", () => {
    const sidor = konfiguration.media.find((mapp) => mapp.name === "sidor")!;
    expect(sidor.input).toBe("src/assets/sidor");
    expect(`${sidor.output}/`).toBe(SIDBILDER);
  });

  test.each(fotofalt)("%s har exakt schemats fält och laddar upp i sidornas mapp", (_, bild) => {
    expect(bild.type).toBe("object");
    expect(bild.fields!.map((f) => f.name).sort()).toEqual(Object.keys(sidbildSchema.shape).sort());
    expect(falt(bild.fields!, "src")).toMatchObject({ type: "image", options: { media: "sidor" } });
  });

  test("har samma etiketter och hjälptexter i alla fotofält", () => {
    const [forsta, ...ovriga] = fotofalt.map(([, bild]) => bild.fields);
    for (const fields of ovriga) expect(fields).toEqual(forsta);
  });
});

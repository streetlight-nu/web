import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { DATAFIL, FUNKTIONER, LAGEN, arPa, funktionerSchema, hamtaFunktioner, tolkaFunktioner } from "@/lib/funktioner";

interface Falt {
  name: string;
  label: string;
  type: string;
  options: { values: { value: string }[] };
}

const rot = path.resolve(import.meta.dirname, "../..");
const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  content: { name: string; type: string; path: string; format: string; fields: Falt[] }[];
};
const funktioner = konfiguration.content.find((del) => del.name === "funktioner")!;

describe("funktionsflaggorna i src/data/funktioner.json", () => {
  test("datafilen i repot klarar schemat", () => {
    const data = JSON.parse(readFileSync(path.join(rot, DATAFIL), "utf8"));
    expect(() => tolkaFunktioner(data)).not.toThrow();
  });

  test("en flagga som saknas, en okänd flagga och ett okänt läge stoppar bygget", () => {
    expect(() => tolkaFunktioner({ julklapp: "pa" })).toThrow(/historia/);
    expect(() => tolkaFunktioner({ julklapp: "pa", historia: "pa", nyFunktion: "pa" })).toThrow();
    expect(() => tolkaFunktioner({ julklapp: "ja", historia: "pa" })).toThrow(/julklapp måste vara pa, av, ejProduktion/);
  });

  test("påslaget läge visas överallt, avstängt ingenstans och ejProduktion bara utanför produktion", () => {
    expect(arPa("pa", true)).toBe(true);
    expect(arPa("pa", false)).toBe(true);
    expect(arPa("av", true)).toBe(false);
    expect(arPa("av", false)).toBe(false);
    expect(arPa("ejProduktion", true)).toBe(false);
    expect(arPa("ejProduktion", false)).toBe(true);
  });
});

describe("hamtaFunktioner", () => {
  const mapp = mkdtempSync(path.join(tmpdir(), "funktioner-"));
  let antal = 0;

  /** A data file of its own per call: lasDatafil remembers each file for the rest of the process. */
  function skrivFil(innehall: object) {
    const fil = path.join(mapp, `funktioner-${antal++}.json`);
    writeFileSync(fil, JSON.stringify(innehall));
    return fil;
  }

  afterEach(() => vi.unstubAllEnvs());

  test("läser filen som FUNKTIONER_FIL pekar på", () => {
    vi.stubEnv("FUNKTIONER_FIL", skrivFil({ julklapp: "av", historia: "pa" }));
    vi.stubEnv("MILJO", "");
    expect(hamtaFunktioner()).toEqual({ julklapp: false, historia: true });
  });

  test("ejProduktion är på utan MILJO och av när MILJO=produktion", () => {
    const fil = skrivFil({ julklapp: "ejProduktion", historia: "pa" });
    vi.stubEnv("FUNKTIONER_FIL", fil);
    vi.stubEnv("MILJO", "");
    expect(hamtaFunktioner()).toEqual({ julklapp: true, historia: true });
    vi.stubEnv("MILJO", "produktion");
    expect(hamtaFunktioner()).toEqual({ julklapp: false, historia: true });
  });

  test("ett annat värde på MILJO räknas inte som produktion", () => {
    vi.stubEnv("FUNKTIONER_FIL", skrivFil({ julklapp: "ejProduktion", historia: "ejProduktion" }));
    vi.stubEnv("MILJO", "test");
    expect(hamtaFunktioner()).toEqual({ julklapp: true, historia: true });
  });

  test("en felaktig fil stoppar bygget", () => {
    vi.stubEnv("FUNKTIONER_FIL", skrivFil({ julklapp: "pa" }));
    expect(() => hamtaFunktioner()).toThrow(/Funktionsflaggorna är felaktiga/);
  });
});

describe("formuläret Funktioner i .pages.yml", () => {
  test("redigerar samma datafil som sajten läser", () => {
    expect(funktioner).toMatchObject({ type: "file", path: DATAFIL, format: "json" });
  });

  test("har exakt flaggornas fält, med svenska etiketter och schemats lägen", () => {
    expect(funktioner.fields.map((f) => f.name).sort()).toEqual(Object.keys(funktionerSchema.shape).sort());
    expect(Object.keys(funktionerSchema.shape).sort()).toEqual([...FUNKTIONER].sort());
    for (const falt of funktioner.fields) {
      expect(falt.label).not.toBe(falt.name);
      expect(falt.type).toBe("select");
      expect(falt.options.values.map((v) => v.value).sort()).toEqual([...LAGEN].sort());
    }
  });
});

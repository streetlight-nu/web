import { afterEach, describe, expect, test, vi } from "vitest";

import { arDatum, flyttaDatum, idagISverige, lageForDag, skrivDatum, visaLank } from "@/lib/julpaketdatum";
import { hamtaJulpaketperiod } from "@/lib/julpaketperiod";

describe("datumen", () => {
  test("ett datum skrivs ÅÅÅÅ-MM-DD och måste finnas", () => {
    expect(arDatum("2026-12-23")).toBe(true);
    expect(arDatum("2026-02-30")).toBe(false);
    expect(arDatum("23 december")).toBe(false);
    expect(arDatum("2026-1-5")).toBe(false);
  });

  test("skrivs för en besökare", () => {
    expect(skrivDatum("2026-11-29")).toBe("29 november");
    expect(skrivDatum("2026-12-03")).toBe("3 december");
  });

  test("dagen räknas i svensk tid", () => {
    expect(idagISverige(new Date("2026-12-23T22:30:00Z"))).toBe("2026-12-23");
    expect(idagISverige(new Date("2026-12-23T23:30:00Z"))).toBe("2026-12-24");
    expect(idagISverige(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
  });
});

describe("Ge ett julpaket går efter datumen", () => {
  const start = "2026-11-29";
  const slut = "2026-12-23";

  test("innan startdatumet", () => {
    expect(lageForDag("2026-11-28", start, slut)).toBe("innan");
    expect(lageForDag("2026-07-01", start, slut)).toBe("innan");
  });

  test("pågår från startdatumet till och med slutdatumet", () => {
    expect(lageForDag("2026-11-29", start, slut)).toBe("pagar");
    expect(lageForDag("2026-12-10", start, slut)).toBe("pagar");
    expect(lageForDag("2026-12-23", start, slut)).toBe("pagar");
  });

  test("avslutad dagen efter slutdatumet", () => {
    expect(lageForDag("2026-12-24", start, slut)).toBe("avslutad");
    expect(lageForDag("2027-01-05", start, slut)).toBe("avslutad");
  });

  test("utan båda datumen finns inget Ge ett julpaket", () => {
    expect(lageForDag("2026-12-10", undefined, slut)).toBe("ingen");
    expect(lageForDag("2026-12-10", start, undefined)).toBe("ingen");
    expect(lageForDag("2026-12-10", undefined, undefined)).toBe("ingen");
  });
});

describe("länken i menyn", () => {
  test("flyttar datum över månads- och årsskiften", () => {
    expect(flyttaDatum("2026-11-29", -7)).toBe("2026-11-22");
    expect(flyttaDatum("2026-12-30", 7)).toBe("2027-01-06");
    expect(flyttaDatum("2026-03-03", -7)).toBe("2026-02-24");
  });

  test("syns från en vecka före startdatumet till en vecka efter slutdatumet", () => {
    const start = "2026-11-29";
    const slut = "2026-12-23";
    expect(visaLank("2026-11-21", start, slut)).toBe(false);
    expect(visaLank("2026-11-22", start, slut)).toBe(true);
    expect(visaLank("2026-12-10", start, slut)).toBe(true);
    expect(visaLank("2026-12-30", start, slut)).toBe(true);
    expect(visaLank("2026-12-31", start, slut)).toBe(false);
  });

  test("utan båda datumen syns den aldrig", () => {
    expect(visaLank("2026-12-10", undefined, "2026-12-23")).toBe(false);
    expect(visaLank("2026-12-10", "2026-11-29", undefined)).toBe(false);
  });
});

describe("hamtaJulpaketperiod", () => {
  afterEach(() => vi.unstubAllEnvs());

  test("under astro dev pågår den alltid, och webbläsaren behåller det", () => {
    vi.stubEnv("DEV", true);
    expect(hamtaJulpaketperiod()).toMatchObject({ lage: "pagar", lank: true, fast: "pagar" });
  });

  test("annars följer bygget datumet, och webbläsaren kontrollerar det igen", () => {
    vi.stubEnv("DEV", false);
    vi.setSystemTime(new Date("2026-12-10T12:00:00Z"));
    const { lage, fast } = hamtaJulpaketperiod();
    expect(fast).toBeUndefined();
    expect(["innan", "pagar", "avslutad", "ingen"]).toContain(lage);
    vi.useRealTimers();
  });
});

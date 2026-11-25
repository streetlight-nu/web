import { afterEach, describe, expect, test, vi } from "vitest";

import { arDatum, idagISverige, lageForDag, skrivDatum } from "@/lib/julperiod";
import { hamtaJulinsamling } from "@/lib/julinsamling";

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

describe("julinsamlingen går efter datumen", () => {
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

  test("utan båda datumen finns ingen julinsamling", () => {
    expect(lageForDag("2026-12-10", undefined, slut)).toBe("ingen");
    expect(lageForDag("2026-12-10", start, undefined)).toBe("ingen");
    expect(lageForDag("2026-12-10", undefined, undefined)).toBe("ingen");
  });
});

describe("hamtaJulinsamling", () => {
  afterEach(() => vi.unstubAllEnvs());

  test("under astro dev pågår den alltid, och webbläsaren behåller det", () => {
    vi.stubEnv("DEV", true);
    expect(hamtaJulinsamling()).toMatchObject({ lage: "pagar", fast: "pagar" });
  });

  test("annars följer bygget datumet, och webbläsaren kontrollerar det igen", () => {
    vi.stubEnv("DEV", false);
    vi.setSystemTime(new Date("2026-12-10T12:00:00Z"));
    const { lage, fast } = hamtaJulinsamling();
    expect(fast).toBeUndefined();
    expect(["innan", "pagar", "avslutad", "ingen"]).toContain(lage);
    vi.useRealTimers();
  });
});

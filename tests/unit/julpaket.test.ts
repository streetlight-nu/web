import { describe, expect, test } from "vitest";

import { tolkaJulpaket } from "@/lib/julpaket";

describe("uppgifterna för Ge ett julpaket i src/data/julpaket.json", () => {
  test("tomma fält räknas som inte ifyllda", () => {
    expect(tolkaJulpaket({ startdatum: "", slutdatum: "  ", vadJulpaketGor: "   ", epost: "" })).toEqual({});
  });

  test("datumen skrivs ÅÅÅÅ-MM-DD och måste finnas", () => {
    expect(tolkaJulpaket({ startdatum: "2026-11-29", slutdatum: "2026-12-23" })).toEqual({
      startdatum: "2026-11-29",
      slutdatum: "2026-12-23",
    });
    expect(() => tolkaJulpaket({ startdatum: "29 november" })).toThrow(/startdatum måste vara ett datum/);
    expect(() => tolkaJulpaket({ slutdatum: "2026-02-30" })).toThrow(/slutdatum måste vara ett datum/);
  });

  test("slutdatumet får inte vara före startdatumet", () => {
    expect(() => tolkaJulpaket({ startdatum: "2026-12-23", slutdatum: "2026-11-29" })).toThrow(/slutdatum får inte vara före startdatum/);
    expect(tolkaJulpaket({ startdatum: "2026-12-23", slutdatum: "2026-12-23" }).slutdatum).toBe("2026-12-23");
  });

  test("datumen styr, så sistaDag och visasPaStartsidan finns inte längre", () => {
    expect(() => tolkaJulpaket({ sistaDag: "23 december" })).toThrow();
    expect(() => tolkaJulpaket({ visasPaStartsidan: true })).toThrow();
  });

  test("stoppar bygget när e-posten inte är en e-postadress eller ett okänt fält finns", () => {
    expect(() => tolkaJulpaket({ epost: "inte en adress" })).toThrow(/epost/);
    expect(() => tolkaJulpaket({ belopp: "100 kr" })).toThrow();
  });
});

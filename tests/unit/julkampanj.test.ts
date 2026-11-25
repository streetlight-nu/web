import { describe, expect, test } from "vitest";

import { tolkaJulkampanj } from "@/lib/julkampanj";

describe("julkampanjens uppgifter i src/data/julkampanj.json", () => {
  test("tomma fält räknas som inte ifyllda", () => {
    expect(tolkaJulkampanj({ startdatum: "", slutdatum: "  ", vadJulklappenGor: "   ", epost: "" })).toEqual({});
  });

  test("datumen skrivs ÅÅÅÅ-MM-DD och måste finnas", () => {
    expect(tolkaJulkampanj({ startdatum: "2026-11-29", slutdatum: "2026-12-23" })).toEqual({
      startdatum: "2026-11-29",
      slutdatum: "2026-12-23",
    });
    expect(() => tolkaJulkampanj({ startdatum: "29 november" })).toThrow(/startdatum måste vara ett datum/);
    expect(() => tolkaJulkampanj({ slutdatum: "2026-02-30" })).toThrow(/slutdatum måste vara ett datum/);
  });

  test("slutdatumet får inte vara före startdatumet", () => {
    expect(() => tolkaJulkampanj({ startdatum: "2026-12-23", slutdatum: "2026-11-29" })).toThrow(/slutdatum får inte vara före startdatum/);
    expect(tolkaJulkampanj({ startdatum: "2026-12-23", slutdatum: "2026-12-23" }).slutdatum).toBe("2026-12-23");
  });

  test("datumen styr, så sistaDag och visasPaStartsidan finns inte längre", () => {
    expect(() => tolkaJulkampanj({ sistaDag: "23 december" })).toThrow();
    expect(() => tolkaJulkampanj({ visasPaStartsidan: true })).toThrow();
  });

  test("stoppar bygget när e-posten inte är en e-postadress eller ett okänt fält finns", () => {
    expect(() => tolkaJulkampanj({ epost: "inte en adress" })).toThrow(/epost/);
    expect(() => tolkaJulkampanj({ belopp: "100 kr" })).toThrow();
  });
});

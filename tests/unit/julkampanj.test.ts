import { describe, expect, test } from "vitest";

import { tolkaJulkampanj } from "@/lib/julkampanj";

describe("julkampanjens uppgifter i src/data/julkampanj.json", () => {
  test("tomma fält räknas som inte ifyllda", () => {
    expect(tolkaJulkampanj({ sistaDag: "", vadJulklappenGor: "   ", epost: "" })).toEqual({});
  });

  test("julkampanjen visas på startsidan bara när rutan är ibockad", () => {
    expect(tolkaJulkampanj({ visasPaStartsidan: true })).toEqual({ visasPaStartsidan: true });
    expect(tolkaJulkampanj({ visasPaStartsidan: false })).toEqual({ visasPaStartsidan: false });
    expect(tolkaJulkampanj({ visasPaStartsidan: null }).visasPaStartsidan).toBeUndefined();
    expect(() => tolkaJulkampanj({ visasPaStartsidan: "ja" })).toThrow(/visasPaStartsidan måste vara ibockad eller inte/);
  });

  test("stoppar bygget när e-posten inte är en e-postadress eller ett okänt fält finns", () => {
    expect(() => tolkaJulkampanj({ epost: "inte en adress" })).toThrow(/epost/);
    expect(() => tolkaJulkampanj({ belopp: "100 kr" })).toThrow();
  });
});


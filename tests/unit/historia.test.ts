import { describe, expect, test } from "vitest";

import { periodId, tolkaHistoria } from "@/lib/historia";

describe("historien i src/data/historia.json", () => {
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


import { describe, expect, test } from "vitest";

import { stycken, tolkaOmForeningen } from "@/lib/om-foreningen";

describe("texterna i src/data/om-foreningen.json", () => {
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

});


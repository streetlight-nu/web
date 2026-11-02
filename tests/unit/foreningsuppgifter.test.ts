import { describe, expect, test } from "vitest";

import { hamtaForeningsuppgifter, tolkaForeningsuppgifter } from "@/lib/foreningsuppgifter";

describe("föreningsuppgifterna", () => {
  test("datafilen i repot har inga ifyllda uppgifter, eftersom föreningen inte har lämnat några", () => {
    expect(hamtaForeningsuppgifter()).toEqual({});
  });

  test("tomma och saknade fält räknas som inte ifyllda", () => {
    expect(tolkaForeningsuppgifter({ organisationsnummer: "", swish: "   ", epost: null })).toEqual({});
  });

  test("ifyllda fält läses med blanksteg borttagna", () => {
    expect(
      tolkaForeningsuppgifter({
        kontaktperson: " Testperson ",
        epost: "test@example.org",
        arsredovisning: "https://example.org/arsredovisning.pdf",
      }),
    ).toEqual({
      kontaktperson: "Testperson",
      epost: "test@example.org",
      arsredovisning: "https://example.org/arsredovisning.pdf",
    });
  });

  test.each([
    ["ett okänt fält", { bankgiro: "123" }],
    ["en e-post som inte är en e-postadress", { epost: "inte en adress" }],
    ["en årsredovisning som inte är en länk", { arsredovisning: "årsredovisning.pdf" }],
    ["ett fält som inte är text", { swish: 1230000000 }],
  ])("avvisar %s", (_, data) => {
    expect(() => tolkaForeningsuppgifter(data)).toThrow(/Föreningsuppgifterna är felaktiga/);
  });
});

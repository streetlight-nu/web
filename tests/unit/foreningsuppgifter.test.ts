import { describe, expect, test } from "vitest";

import { hamtaForeningsuppgifter, SOCIALA, tolkaForeningsuppgifter, UPPGIFTER, visaUppgift } from "@/lib/foreningsuppgifter";

describe("föreningsuppgifterna", () => {
  // Only the schema: the association fills the file in through Pages CMS, so its values are not the tests' business.
  test("datafilen i repot klarar schemat", () => {
    expect(() => hamtaForeningsuppgifter()).not.toThrow();
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
        facebook: "https://www.facebook.com/streetlight",
        instagram: "https://instagram.com/streetlight",
      }),
    ).toEqual({
      kontaktperson: "Testperson",
      epost: "test@example.org",
      arsredovisning: "https://example.org/arsredovisning.pdf",
      facebook: "https://www.facebook.com/streetlight",
      instagram: "https://instagram.com/streetlight",
    });
  });

  test.each([
    ["ett okänt fält", { bankgiro: "123" }],
    ["en e-post som inte är en e-postadress", { epost: "inte en adress" }],
    ["en årsredovisning som inte är en länk", { arsredovisning: "årsredovisning.pdf" }],
    ["en årsredovisning som börjar med två snedstreck", { arsredovisning: "//example.org/ar.pdf" }],
    ["ett fält som inte är text", { swish: 1230000000 }],
    ["en Facebook-länk som inte är en länk", { facebook: "streetlight" }],
    ["en Facebook-länk till en annan webbplats", { facebook: "https://example.org/streetlight" }],
    ["en Instagram-länk utan https", { instagram: "http://www.instagram.com/streetlight" }],
    ["en Instagram-länk till Facebook", { instagram: "https://www.facebook.com/streetlight" }],
  ])("avvisar %s", (_, data) => {
    expect(() => tolkaForeningsuppgifter(data)).toThrow(/Föreningsuppgifterna är felaktiga/);
  });
});

describe("hur en föreningsuppgift visas", () => {
  const ifyllda = {
    organisationsnummer: "802456-3531",
    nittiokonto: "123-4567",
    epost: "info@example.org",
    arsredovisning: "https://example.org/arsredovisning.pdf",
    facebook: "https://www.facebook.com/streetlight",
  };

  test("varje uppgift har en etikett och säger vad som saknas", () => {
    for (const namn of UPPGIFTER) {
      const { etikett, saknas, text, lank } = visaUppgift(namn, {});
      expect(etikett, namn).not.toBe(namn);
      expect(saknas, namn).toMatch(/^(nummer|namn|e-post|länk) fylls i$/);
      expect(text).toBeUndefined();
      expect(lank).toBeUndefined();
    }
  });

  test("bankgirot heter Bankgiro, och nummer visas som de står", () => {
    expect(visaUppgift("nittiokonto", ifyllda)).toEqual({
      etikett: "Bankgiro",
      saknas: "nummer fylls i",
      text: "123-4567",
      lank: undefined,
    });
    expect(visaUppgift("organisationsnummer", ifyllda).text).toBe("802456-3531");
  });

  test("e-post, årsredovisning och sociala medier blir länkar", () => {
    expect(visaUppgift("epost", ifyllda)).toMatchObject({ text: "info@example.org", lank: "mailto:info@example.org" });
    expect(visaUppgift("arsredovisning", ifyllda)).toMatchObject({
      text: "Läs årsredovisningen",
      lank: "https://example.org/arsredovisning.pdf",
    });
    expect(tolkaForeningsuppgifter({ arsredovisning: "/dokument/ar.pdf" }).arsredovisning).toBe("/dokument/ar.pdf");
    expect(visaUppgift("arsredovisning", { arsredovisning: "/dokument/ar.pdf" }).lank).toBe("/dokument/ar.pdf");
    expect(visaUppgift("facebook", ifyllda)).toMatchObject({
      etikett: "Facebook",
      text: "Facebook",
      lank: "https://www.facebook.com/streetlight",
    });
  });

  test("de sociala medierna är Facebook och Instagram, i den ordningen", () => {
    expect(SOCIALA).toEqual(["facebook", "instagram"]);
  });
});

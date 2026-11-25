import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, LAYOUT } from "./helpers";

const sida = "villkor";

// The rules every page keeps (h1, WCAG, skip link, 18 px, the glossary) are in hela-sajten.spec.ts.

test("har titel, en h1 och de tre avsnitten som banken kräver", async ({ page }) => {
  await page.goto(sida);
  await expect(page).toHaveTitle("Villkor och kontakt | Streetlight");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Villkor och kontakt.");
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
    "Kontaktuppgifter",
    "Betalning och leverans",
    "Ångerrätt, retur, reklamation och garanti",
    "Hjälp oss hålla ljusen tända.",
  ]);
  for (const rubrik of ["Ångerrätt", "Återbetalning", "Retur", "Reklamation", "Garanti", "Leverans"]) {
    await expect(page.getByRole("heading", { level: 3, name: rubrik })).toBeVisible();
  }
});

test("länkarna överst leder till avsnitten", async ({ page }) => {
  await page.goto(sida);
  const meny = page.getByRole("navigation", { name: "På den här sidan" });
  await expect(meny.getByRole("link")).toHaveCount(3);
  await expect(meny.getByRole("link", { name: "Kontaktuppgifter" })).toHaveAttribute("href", "#kontakt");
  await expect(page.locator("#betalning-och-leverans")).toBeVisible();
  await expect(page.locator("#angerratt-retur-och-reklamation")).toBeVisible();
});

test("sidfoten länkar hit", async ({ page }) => {
  await page.goto("");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Villkor och kontakt" })).toHaveAttribute(
    "href",
    /\/villkor$/,
  );
});

for (const [namn, sokvag] of [
  ["Ge ett julpaket", "julpaket"],
  ["Bli fadder", "bli-fadder"],
] as const) {
  test(`${namn} länkar till villkoren under betalningen`, async ({ page }) => {
    await page.goto(sokvag);
    await expect(
      page.getByRole("main").getByRole("link", { name: "Villkor för betalning, leverans och ångerrätt" }).first(),
    ).toHaveAttribute("href", /\/villkor$/);
  });
}

test.describe("med ifyllda uppgifter", () => {
  test("visar kontaktuppgifterna, Swish-numret och sista insamlingsdag", async ({ page }) => {
    await page.goto(`${process.env.E2E_IFYLLD_URL}${sida}`);
    const kontakt = page.locator("#kontakt");
    await expect(kontakt).toContainText("Det är Streetlight, en ideell förening");
    await expect(kontakt.getByText("TEST-ORGNR")).toBeVisible();
    await expect(kontakt.getByText("TEST-POSTADRESS")).toBeVisible();
    await expect(kontakt.getByRole("link", { name: "TEST-TELEFON" })).toHaveAttribute("href", /^tel:/);
    await expect(kontakt.getByRole("link", { name: "test@example.org" })).toHaveAttribute("href", "mailto:test@example.org");
    await expect(page.locator("#betalning-och-leverans")).toContainText("TEST-SWISH");
    await expect(page.locator("#betalning-och-leverans")).toContainText(/Sista insamlingsdag är \d{1,2} \p{L}+\./u);
    await expectNoA11yViolations(page);
  });
});

test.describe("med tomma uppgifter", () => {
  test("visar inga tomma rader, ingen Swish-rad och ingen e-postmening", async ({ page }) => {
    await page.goto(`${process.env.E2E_TOM_URL}${sida}`);
    await expect(page.locator("#kontakt dt")).toHaveCount(0);
    await expect(page.locator("#betalning-och-leverans")).not.toContainText("Du kan också ge en gåva med Swish");
    await expect(page.locator("#betalning-och-leverans")).not.toContainText("Sista insamlingsdag");
    await expect(page.getByText("Kontakta oss på")).toHaveCount(0);
    await expectNoA11yViolations(page);
  });
});

test("avsnitten staplas utan sidledsskroll på en telefon", LAYOUT, async ({ page }) => {
  await page.goto(sida);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

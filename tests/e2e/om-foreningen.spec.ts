import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations, funktionPa } from "./helpers";

/** The value shown for one föreningsuppgift under Kontakt, found by its label. */
function uppgift(page: Page, label: string) {
  return page
    .getByRole("region", { name: "Kontakt." })
    .getByRole("definition")
    .filter({ has: page.locator(`xpath=preceding-sibling::dt[normalize-space()="${label}"]`) });
}

test("Om föreningen har en h1 och avsnitten i ordning, med Bli fadder sist", async ({ page }) => {
  await page.goto("om-foreningen");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Om föreningen.");
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
    "Vår vision",
    "Det här tror vi på.",
    "Så började det.",
    "Två föreningar, ett arbete.",
    "Vår grund.",
    "Vilka vi är.",
    "Kontakt.",
    "Var med och håll ljusen tända.",
  ]);
  await expect(page.getByRole("main").getByRole("link", { name: "Bli fadder" })).toHaveAttribute(
    "href",
    /\/#bli-fadder$/,
  );
});

test("menyn markerar Om föreningen som aktiv", async ({ page, isMobile }) => {
  await page.goto("om-foreningen");
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  await expect(nav.getByRole("link", { name: "Om föreningen", exact: true })).toHaveAttribute("aria-current", "page");
});

test("Så började det leder till Vår historia, och sidfoten till Kontakt", async ({ page }) => {
  test.skip(!funktionPa("historia"), "historia är avstängd i funktioner.json");
  await page.goto("om-foreningen");
  await page.getByRole("link", { name: "Läs hela vår historia" }).click();
  await expect(page).toHaveURL(/\/historia$/);
  await page.getByRole("contentinfo").getByRole("link", { name: "Kontakt" }).click();
  await expect(page).toHaveURL(/\/om-foreningen#kontakt$/);
  await expect(page.getByRole("heading", { level: 2, name: "Kontakt." })).toBeInViewport();
});

test("Om föreningen klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto("om-foreningen");
  await expectNoA11yViolations(page);
});

test.describe("Kontakt med tom testfil", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("visar ”fylls i” för det föreningen inte har gett", async ({ page }) => {
    await page.goto("om-foreningen");
    const kontakt = page.getByRole("region", { name: "Kontakt." });
    await expect(kontakt.getByText("e-post fylls i")).toBeVisible();
    await expect(kontakt.getByText("namn fylls i")).toBeVisible();
    await expect(uppgift(page, "Swish för gåvor")).toHaveText("nummer fylls i");
    await expect(uppgift(page, "Senaste årsredovisning")).toHaveText("länk fylls i");
    await expect(kontakt.getByRole("link")).toHaveCount(0);
  });
});

test.describe("Kontakt med ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("visar föreningsuppgifterna", async ({ page }) => {
    await page.goto("om-foreningen");
    const kontakt = page.getByRole("region", { name: "Kontakt." });
    await expect(kontakt.getByRole("link", { name: "test@example.org" })).toHaveAttribute(
      "href",
      "mailto:test@example.org",
    );
    await expect(kontakt).toContainText("Testperson");
    await expect(uppgift(page, "Swish för gåvor")).toHaveText("TEST-SWISH");
    await expect(uppgift(page, "90-konto")).toHaveText("TEST-90-KONTO");
    await expect(uppgift(page, "Organisationsnummer")).toHaveText("TEST-ORGNR");
    await expect(kontakt.getByRole("link", { name: "Läs årsredovisningen" })).toHaveAttribute(
      "href",
      "https://example.org/test-arsredovisning.pdf",
    );
  });
});

import { expect, test, type Page } from "@playwright/test";

import {
  expectNoA11yViolations,
  LAYOUT,
  stubRepejo,
  textstorlek,
} from "./helpers";

/**
 * Mätningen (ADR 0004): Google Tag Manager laddas bara efter Acceptera i Kakrutan, och Repejos element får veta
 * samtycket. Google är stubbat med ett tomt skript, så testerna beror inte på nätverket.
 */
const GTM = "https://www.googletagmanager.com/";

/** Stubs Google Tag Manager and returns the list of its requests. */
async function stubGtm(page: Page): Promise<string[]> {
  const anrop: string[] = [];
  await page.route(`${GTM}**`, (route) => {
    anrop.push(route.request().url());
    return route.fulfill({ contentType: "text/javascript", body: "" });
  });
  return anrop;
}

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("med ett id för Google Tag Manager", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test.beforeEach(async ({ page }) => {
    await stubRepejo(page);
  });

  test("Kakrutan visas först och ingenting laddas före ett val", async ({
    page,
  }) => {
    const anrop = await stubGtm(page);
    await page.goto("bli-fadder");
    const ruta = page.getByRole("region", { name: "Kakval" });
    await expect(ruta).toBeVisible();
    await expect(ruta.getByRole("button", { name: "Acceptera" })).toBeVisible();
    await expect(ruta.getByRole("button", { name: "Avvisa" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(anrop).toEqual([]);
    await expect(
      page.locator("repejo-checkout[user-has-consented-to-marketing-cookies]"),
    ).toHaveCount(0);
    await expect(page.locator("repejo-checkout")).toHaveCount(2);
  });

  test(
    "Kakrutan klarar WCAG, har minst 18 px text och går att nå med tangentbordet",
    LAYOUT,
    async ({ page }) => {
      await page.goto("bli-fadder");
      const ruta = page.getByRole("region", { name: "Kakval" });
      await expect(ruta).toBeVisible();
      await expectNoA11yViolations(page);
      const storlek = await ruta
        .locator("p")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(storlek).toBeGreaterThanOrEqual(textstorlek("body"));
      await ruta.getByRole("button", { name: "Acceptera" }).focus();
      await expect(
        ruta.getByRole("button", { name: "Acceptera" }),
      ).toBeFocused();
    },
  );

  test("Acceptera laddar containern med rätt id och talar om för Repejo att besökaren har samtyckt", async ({
    page,
  }) => {
    const anrop = await stubGtm(page);
    await page.goto("bli-fadder");
    await page.getByRole("button", { name: "Acceptera" }).click();
    await expect(page.getByRole("region", { name: "Kakval" })).toBeHidden();
    await expect.poll(() => anrop).toEqual([`${GTM}gtm.js?id=GTM-TEST123`]);
    // Both checkouts on the page (Bli fadder and Swisha en gåva) are told.
    await expect(
      page.locator(
        'repejo-checkout[user-has-consented-to-marketing-cookies="true"]',
      ),
    ).toHaveCount(2);
    expect(
      await page.evaluate(() =>
        (
          window as unknown as { dataLayer: { event?: string }[] }
        ).dataLayer.map((d) => d.event),
      ),
    ).toContain("gtm.js");
  });

  test("valet kommer ihåg: efter Acceptera laddas containern direkt på nästa sida och Kakrutan är borta", async ({
    page,
  }) => {
    const anrop = await stubGtm(page);
    await page.goto("bli-fadder");
    await page.getByRole("button", { name: "Acceptera" }).click();
    await expect.poll(() => anrop.length).toBe(1);
    await page.goto("nyheter");
    await expect(page.getByRole("region", { name: "Kakval" })).toBeHidden();
    await expect.poll(() => anrop.length).toBe(2);
  });

  test("Avvisa laddar ingenting, och Kakrutan kommer inte tillbaka", async ({
    page,
  }) => {
    const anrop = await stubGtm(page);
    await page.goto("bli-fadder");
    await page.getByRole("button", { name: "Avvisa" }).click();
    await expect(page.getByRole("region", { name: "Kakval" })).toBeHidden();
    await page.goto("bli-fadder");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("region", { name: "Kakval" })).toBeHidden();
    await expect(
      page.locator("repejo-checkout[user-has-consented-to-marketing-cookies]"),
    ).toHaveCount(0);
    await expect(page.locator("repejo-checkout")).toHaveCount(2);
    expect(anrop).toEqual([]);
  });

  test("länken Kakval i sidfoten öppnar Kakrutan igen, och ett nytt val från Acceptera till Avvisa tar bort mätningen", async ({
    page,
  }) => {
    const anrop = await stubGtm(page);
    await page.goto("bli-fadder");
    await page.getByRole("button", { name: "Acceptera" }).click();
    await expect.poll(() => anrop.length).toBe(1);
    await page
      .getByRole("contentinfo")
      .getByRole("button", { name: "Kakval" })
      .click();
    await expect(page.getByRole("region", { name: "Kakval" })).toBeVisible();
    await page.getByRole("button", { name: "Avvisa" }).click();
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("repejo-checkout[user-has-consented-to-marketing-cookies]"),
    ).toHaveCount(0);
    await expect(page.locator("repejo-checkout")).toHaveCount(2);
    expect(anrop.length).toBe(1);
  });
});

test.describe("utan id", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("ingen Kakruta, ingen länk Kakval och ingenting från Google", async ({
    page,
  }) => {
    await stubRepejo(page);
    const anrop = await stubGtm(page);
    await page.goto("bli-fadder");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("region", { name: "Kakval" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Kakval" })).toHaveCount(0);
    expect(anrop).toEqual([]);
  });
});

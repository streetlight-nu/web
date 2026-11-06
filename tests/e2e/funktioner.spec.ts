import { expect, test } from "@playwright/test";

/**
 * Funktionsflaggorna (src/data/funktioner.json). A third build of the site (see playwright.config.ts) is made as
 * production from tests/fixtures/funktioner-av.json: julklapp is `av` and historia is `ejProduktion`, so both are off.
 * The ordinary build has every flag `pa`, which the other specs cover.
 */
const av = process.env.E2E_AV_URL!;

test.describe("med funktionerna avstängda", () => {
  test.use({ baseURL: av });

  for (const sida of ["julklapp", "historia"]) {
    test(`sidan /${sida} finns inte`, async ({ request }) => {
      const svar = await request.get(`${sida}`);
      expect(svar.status()).toBe(404);
    });
  }

  test("länkarna till sidorna finns inte i menyn, startsidan, Om föreningen eller sidfoten", async ({ page }) => {
    for (const sida of ["", "om-foreningen", "nyheter", "vanliga-fragor"]) {
      await page.goto(sida);
      await expect(page.locator('a[href$="/julklapp"], a[href$="/historia"]')).toHaveCount(0);
      await expect(page.locator("#julklapp")).toHaveCount(0);
    }
  });

  test("resten av sajten fungerar", async ({ page }) => {
    await page.goto("");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("om-foreningen");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

/**
 * Funktionsflaggorna (src/data/funktioner.json). A third build of the site (see playwright.config.ts) is made as
 * production from tests/fixtures/funktioner-av.json: julklapp and engagera are `av` and historia is `ejProduktion`, so all are off.
 * The filled-in build is not production and is built from tests/fixtures/funktioner-ejproduktion.json, where
 * historia is `ejProduktion`, so it shows that mode outside production. The ordinary build has every flag `pa`.
 */
const av = process.env.E2E_AV_URL!;

test.describe("med funktionerna avstängda", () => {
  test.use({ baseURL: av });

  for (const sida of ["julklapp", "historia", "engagera-dig"]) {
    test(`sidan /${sida} finns inte`, async ({ request }) => {
      const svar = await request.get(`${sida}`);
      expect(svar.status()).toBe(404);
    });
  }

  test("länkarna till sidorna finns inte i menyn, startsidan, Om Streetlight eller sidfoten", async ({ page }) => {
    for (const sida of ["", "om-foreningen", "nyheter", "vanliga-fragor"]) {
      await page.goto(sida);
      await expect(page.locator('a[href$="/julklapp"], a[href$="/historia"], a[href$="/engagera-dig"]')).toHaveCount(0);
      await expect(page.locator("#julklapp")).toHaveCount(0);
    }
  });

  test("formuläret Få nyheterna med e-post och raden Följ och berätta finns inte", async ({ page }) => {
    await page.goto("nyheter");
    await expect(page.locator("#nyheter-med-epost")).toHaveCount(0);
    await expect(page.locator("#prenumeration-formular")).toHaveCount(0);
    await page.goto("bli-fadder");
    await expect(page.getByRole("heading", { name: "Följ och berätta" })).toHaveCount(0);
    await expect(page.locator('a[href$="#nyheter-med-epost"]')).toHaveCount(0);
  });

  test("resten av sajten fungerar", async ({ page }) => {
    await page.goto("");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("om-foreningen");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("med ejProduktion utanför produktion", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("sidan /historia finns och länkarna till den visas", async ({ page, request }) => {
    expect((await request.get("historia")).status()).toBe(200);
    await page.goto("om-foreningen");
    await expect(page.getByRole("link", { name: "Läs hela vår historia" })).toBeVisible();
  });

  test("formuläret Få nyheterna med e-post visas på Nyheter och på Bli fadder", async ({ page }) => {
    await page.goto("nyheter");
    await expect(page.locator("#prenumeration-formular")).toBeAttached();
    await page.goto("bli-fadder");
    await expect(page.getByRole("heading", { name: "Följ och berätta" })).toBeVisible();
  });
});

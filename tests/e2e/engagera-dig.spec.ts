import { expect, test } from "@playwright/test";

import { REPEJO_HOST, REPEJO_ORGANISATION } from "../../src/lib/repejo";
import { blockRepejo, funktionPa, LAYOUT, stubRepejo } from "./helpers";

test.skip(!funktionPa("engagera"), "engagera är avstängd i funktioner.json");

test.describe("Engagera dig", () => {
  test.beforeEach(async ({ page }) => {
    await stubRepejo(page);
    await page.goto("engagera-dig");
  });

  test("toppen leder till de tre sätten att engagera sig", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Engagera dig och håll ljusen tända." }),
    ).toBeVisible();
    const vagar = page.getByRole("navigation", { name: "Sätt att engagera dig" });
    for (const [namn, mal, rubrik] of [
      ["Starta en egen insamling", "#insamling", "Starta en egen insamling."],
      ["Ge till en pågående insamling", "#pagaende", "Pågående insamlingar."],
      ["Hjälp oss hitta nya faddrar", "#faddrar", "Hjälp oss hitta nya faddrar."],
    ]) {
      const lank = vagar.getByRole("link", { name: new RegExp(`^${namn}`) });
      await expect(lank).toHaveAttribute("href", mal);
      await lank.click();
      await expect(page.getByRole("heading", { level: 2, name: rubrik })).toBeInViewport();
    }
  });

  test("Engagera dig finns i menyn och är aktuell sida", LAYOUT, async ({ page, isMobile }) => {
    if (isMobile) await page.getByRole("button", { name: "Meny" }).click();
    await expect(page.getByRole("banner").getByRole("link", { name: "Engagera dig" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  for (const [kategori, varde] of [
    ["Födelsedag", "birthday"],
    ["Jubileum", "anniversary"],
    ["Sportevent", "sport_event"],
  ]) {
    test(`${kategori} har Repejos knapp för egen insamling i kategorin ${varde}`, async ({ page }) => {
      const rad = page.locator(`[data-kategori="${kategori}"]`);
      await expect(rad.getByRole("heading", { name: kategori })).toBeVisible();
      const knapp = rad.locator("repejo-p2p-create-button");
      await expect(knapp).toHaveAttribute("category", varde);
      await expect(knapp).toHaveAttribute("organisation_id", REPEJO_ORGANISATION);
      await expect(knapp).toHaveAttribute("host", REPEJO_HOST);
      await expect(knapp).toHaveText("Repejos knapp för egen insamling (stubb)");
      await expect(rad.getByText("knapp fylls i")).toHaveCount(0);
    });
  }

  test("pågående insamlingar visar Repejos lista med föreningens insamlingar", async ({ page }) => {
    const lista = page.locator("#pagaende repejo-p2p-list");
    await expect(lista).toHaveAttribute("organisation_id", REPEJO_ORGANISATION);
    await expect(lista).toHaveAttribute("host", REPEJO_HOST);
    await expect(lista).toHaveText("Repejos lista med insamlingar (stubb)");
    await expect(page.locator("#pagaende").getByText("fylls i")).toHaveCount(0);
  });

  test("materialet för att hitta faddrar leder till Bli fadder och visar fylls i för det som saknas", async ({
    page,
  }) => {
    const faddrar = page.locator("#faddrar");
    await expect(faddrar.getByRole("link", { name: "Till Bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
    for (const saknas of ["affisch fylls i", "folder fylls i", "bilder fylls i"]) {
      await expect(faddrar.getByText(saknas)).toBeVisible();
    }
    await expect(faddrar.getByRole("heading", { name: "Så kan du berätta" })).toBeVisible();
  });
});

test("utan Repejo säger knappens plats vad som ska synas där", async ({ page }) => {
  await blockRepejo(page);
  await page.goto("engagera-dig");
  const knapp = page.locator('[data-kategori="Födelsedag"] repejo-p2p-create-button');
  await expect(knapp).toHaveAttribute("data-vantar", "Här visas Repejos knapp för att starta en insamling.");
  const text = await knapp.evaluate((el) => getComputedStyle(el, "::before").content);
  expect(text).toContain("Här visas Repejos knapp");

  // The list keeps its place, so the page does not jump when Repejo draws it.
  const lista = page.locator("#pagaende repejo-p2p-list");
  expect(await lista.evaluate((el) => getComputedStyle(el, "::before").content)).toContain(
    "Här visas Repejos lista med insamlingar",
  );
  expect((await lista.boundingBox())!.height).toBeGreaterThanOrEqual(480);
});

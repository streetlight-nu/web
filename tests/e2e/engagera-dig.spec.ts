import { expect, test } from "@playwright/test";

import { REPEJO_HOST, REPEJO_ORGANISATION } from "../../src/lib/repejo";
import { blockRepejo, funktionPa, LAYOUT, stubRepejo } from "./helpers";

test.skip(!funktionPa("engagera"), "engagera är avstängd i funktioner.json");

test.describe("Engagera dig", () => {
  test.beforeEach(async ({ page }) => {
    await stubRepejo(page);
    await page.goto("engagera-dig");
  });

  test("toppen leder till de två sätten att engagera sig", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Engagera dig och håll ljusen tända." }),
    ).toBeVisible();
    const vagar = page.getByRole("navigation", { name: "Sätt att engagera dig" });
    for (const [namn, mal, rubrik] of [
      ["Starta en egen insamling", "#insamling", "Starta en egen insamling."],
      ["Hjälp oss hitta nya faddrar", "#faddrar", "Hjälp oss hitta nya faddrar."],
    ]) {
      const lank = vagar.getByRole("link", { name: new RegExp(`^${namn}`) });
      await expect(lank).toHaveAttribute("href", mal);
      await lank.click();
      await expect(page.getByRole("heading", { level: 2, name: rubrik })).toBeInViewport();
    }
  });

  test("Engagera dig finns i menyn och är aktuell sida", LAYOUT, async ({ page, isMobile }) => {
    if (isMobile) {
      // The menu is a React island, and Repejo's script slows this page down: a click before the island has hydrated
      // does nothing, so click until the menu is open.
      const meny = page.getByRole("button", { name: "Meny" });
      await expect(async () => {
        if ((await meny.getAttribute("aria-expanded")) !== "true") await meny.click();
        await expect(meny).toHaveAttribute("aria-expanded", "true", { timeout: 500 });
      }).toPass();
    }
    await expect(page.getByRole("banner").getByRole("link", { name: "Engagera dig" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  for (const [tillfalle, ikon] of [
    ["Födelsedag", "tarta"],
    ["Jubileum", "hjarta"],
    ["Sportevent", "pokal"],
  ]) {
    test(`${tillfalle} har en egen ikon, rubrik och text`, async ({ page }) => {
      const ruta = page.locator(`[data-tillfalle="${tillfalle}"]`);
      await expect(ruta.getByRole("heading", { level: 3, name: tillfalle })).toBeVisible();
      // The icon: decorative, in the text colour, large enough to carry the occasion.
      const ritning = ruta.locator(`svg[data-ikon="${ikon}"]`);
      await expect(ritning).toBeVisible();
      await expect(ritning).toHaveAttribute("aria-hidden", "true");
      expect((await ritning.boundingBox())!.width).toBeGreaterThanOrEqual(28);
    });
  }

  test("inledningen säger hur det går till, och knappen kommer efter den", async ({ page }) => {
    const insamling = page.locator("#insamling");
    const ingress = insamling.getByText("Önska dig gåvor till barnen i stället för presenter.");
    const text = (await ingress.boundingBox())!;
    const knappY = (await insamling.locator("repejo-p2p-create-button").boundingBox())!.y;
    expect(knappY).toBeGreaterThan(text.y + text.height);
  });

  test("det finns en enda knapp för egen insamling, och Repejo frågar efter tillfället", async ({ page }) => {
    // One button instead of one per occasion: it has no category, so Repejo's own dialog asks which one.
    const knappar = page.locator("#insamling repejo-p2p-create-button");
    await expect(knappar).toHaveCount(1);
    const knapp = knappar.first();
    await expect(knapp).not.toHaveAttribute("category", /.+/);
    await expect(knapp).toHaveAttribute("organisation_id", REPEJO_ORGANISATION);
    await expect(knapp).toHaveAttribute("host", REPEJO_HOST);
    await expect(knapp).toHaveText("Repejos knapp för egen insamling (stubb)");
    await expect(page.locator("#insamling").getByText("knapp fylls i")).toHaveCount(0);
  });

  test("visar inte Repejos lista med pågående insamlingar", async ({ page }) => {
    await expect(page.locator("#pagaende")).toHaveCount(0);
    await expect(page.locator("repejo-p2p-list")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /pågående insamling/i })).toHaveCount(0);
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
  const knapp = page.locator("#insamling repejo-p2p-create-button");
  await expect(knapp).toHaveAttribute("data-vantar", "Här visas Repejos knapp för att starta en insamling.");
  const text = await knapp.evaluate((el) => getComputedStyle(el, "::before").content);
  expect(text).toContain("Här visas Repejos knapp");
});

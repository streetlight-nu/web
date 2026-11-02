import { expect, test } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

// The four Exempelinlägg from the prototype, newest first.
const nyastForst = [
  "Skolstart i Addis Abeba",
  "En verksamhet som bär familjen",
  "Välkommen till årsmötet",
  "Tack för ett år i skolan",
];

test("nyhetslistan har en h1 och visar inläggen med det nyaste först, grupperade per år", async ({ page }) => {
  await page.goto("nyheter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const listan = page.getByRole("region", { name: "Alla nyheter" });
  await expect(listan.getByRole("heading", { level: 2 })).toHaveText(["2026"]);
  await expect(listan.getByRole("heading", { level: 3 })).toHaveText(nyastForst);
  const datum = await listan.locator("time").evaluateAll((els) => els.map((el) => el.getAttribute("datetime")));
  expect(datum).toEqual(["2026-09-14", "2026-06-02", "2026-03-20", "2026-01-10"]);
});

test("hela inlägget i listan går att klicka, men har bara en länk", async ({ page }) => {
  await page.goto("nyheter");
  const inlagget = page.getByRole("listitem").filter({ hasText: "Välkommen till årsmötet" });
  await expect(inlagget.getByRole("link")).toHaveCount(1);
  await expect(inlagget.getByText("Nyhet från föreningen")).toBeVisible();
  await expect(inlagget.getByText("20 mar 2026")).toBeVisible();
  await expect(inlagget.getByText(/^Foto/)).toBeVisible();

  // A click near the row's bottom left corner, away from the title, still opens the inlägg.
  await inlagget.scrollIntoViewIfNeeded();
  const ruta = (await inlagget.boundingBox())!;
  await page.mouse.click(ruta.x + 8, ruta.y + ruta.height - 8);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Välkommen till årsmötet");
});

test("nyhetslistan visar notisen om exempel medan exempelinlägg finns", async ({ page }) => {
  await page.goto("nyheter");
  await expect(page.getByText("Inläggen nedan är exempel som visar mallen.", { exact: false })).toBeVisible();
});

test("menyn markerar Nyheter som aktiv på nyhetslistan", async ({ page, isMobile }) => {
  await page.goto("nyheter");
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  await expect(nav.getByRole("link", { name: "Nyheter", exact: true })).toHaveAttribute("aria-current", "page");
});

test("nyhetslistan klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto("nyheter");
  await expectNoA11yViolations(page);
});

test("Senaste nytt på startsidan visar det nyaste inlägget och länkar till alla nyheter", async ({ page }) => {
  await page.goto("");
  const senaste = page.locator("#senaste");
  await expect(senaste.getByRole("heading", { level: 2 })).toHaveText("Senaste nytt");
  await expect(senaste.getByRole("heading", { level: 3 })).toHaveText(nyastForst[0]);
  await expect(senaste.locator("time")).toHaveAttribute("datetime", "2026-09-14");
  await expect(senaste.getByText("Rapport från Addis Abeba")).toBeVisible();
  await expect(senaste.getByRole("link", { name: "Alla nyheter" })).toHaveAttribute("href", /\/nyheter$/);

  await senaste.getByRole("link", { name: nyastForst[0] }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(nyastForst[0]);
});

test("ordet blogg förekommer inte på sajtens sidor", async ({ page }) => {
  for (const sida of ["", "nyheter", "nyheter/skolstart-i-addis-abeba"]) {
    await page.goto(sida);
    expect(await page.content(), sida).not.toMatch(/blogg/i);
  }
});

import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, funktionPa } from "./helpers";

test.skip(!funktionPa("historia"), "historia är avstängd i funktioner.json");

const perioder = ["1995–1999", "2000–2009", "2010–2019", "2020–idag"];

test("historien har en h1 och visar perioderna i tidsordning, följt av idag", async ({ page }) => {
  await page.goto("historia");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vår historia, från 1995 till idag.");
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
    ...perioder,
    "Idag",
    "Var med och skriv nästa kapitel.",
  ]);
});

test("ett årtal som saknas visas som ”fylls i” och hittas inte på", async ({ page }) => {
  await page.goto("historia");
  const forsta = page.getByRole("region", { name: "1995–1999" });
  await expect(forsta.getByRole("listitem").first()).toContainText("1995");
  await expect(forsta.getByRole("listitem").nth(1).getByText("år fylls i")).toBeVisible();
});

test("menyn för perioderna hoppar till varje period", async ({ page }) => {
  await page.goto("historia");
  const meny = page.getByRole("navigation", { name: "Hoppa till en period" });
  await expect(meny.getByRole("link")).toHaveText(perioder);
  await meny.getByRole("link", { name: "2010–2019" }).click();
  await expect(page).toHaveURL(/#period-2010-2019$/);
  await expect(page.getByRole("heading", { level: 2, name: "2010–2019" })).toBeInViewport();
});

test("historien ligger under Om föreningen i sökvägen", async ({ page }) => {
  await page.goto("historia");
  const sokvag = page.getByRole("navigation", { name: "Du är här" });
  await expect(sokvag.getByRole("link", { name: "Om föreningen" })).toHaveAttribute("href", /\/om-foreningen$/);
  await expect(sokvag.getByText("Vår historia")).toHaveAttribute("aria-current", "page");
});

test("historien leder vidare till Bli fadder", async ({ page }) => {
  await page.goto("historia");
  await expect(page.getByRole("main").getByRole("link", { name: "Bli fadder" })).toHaveAttribute(
    "href",
    /\/bli-fadder$/,
  );
});

test("historien klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto("historia");
  await expectNoA11yViolations(page);
});

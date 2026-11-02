import { expect, test } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

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

test("det som saknas visas som ”fylls i” och inget hittas på", async ({ page }) => {
  await page.goto("historia");
  const forsta = page.getByRole("region", { name: "1995–1999" });
  await expect(forsta.getByRole("listitem").first()).toContainText("1995");
  await expect(forsta.getByText("rubrik fylls i").first()).toBeVisible();
  await expect(forsta.getByText("text fylls i").first()).toBeVisible();
});

test("menyn för perioderna hoppar till varje period", async ({ page }) => {
  await page.goto("historia");
  const meny = page.getByRole("navigation", { name: "Hoppa till en period" });
  await expect(meny.getByRole("link")).toHaveText(perioder);
  await meny.getByRole("link", { name: "2010–2019" }).click();
  await expect(page).toHaveURL(/#period-2010-2019$/);
  await expect(page.getByRole("heading", { level: 2, name: "2010–2019" })).toBeInViewport();
});

test("menyn markerar Vår historia som aktiv", async ({ page, isMobile }) => {
  await page.goto("historia");
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  await expect(nav.getByRole("link", { name: "Vår historia", exact: true })).toHaveAttribute("aria-current", "page");
});

test("historien leder vidare till Bli fadder", async ({ page }) => {
  await page.goto("historia");
  await expect(page.getByRole("main").getByRole("link", { name: "Bli fadder" })).toHaveAttribute(
    "href",
    /\/#bli-fadder$/,
  );
});

test("historien klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto("historia");
  await expectNoA11yViolations(page);
});

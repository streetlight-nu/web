import { expect, test } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

// On the build with filled-in test files (tests/fixtures/historia-ifylld.json, flags from
// funktioner-ejproduktion.json), so the tests never depend on what the association has written or switched on.
test.use({ baseURL: process.env.E2E_IFYLLD_URL });

const perioder = ["1995–1999", "2000–2009", "2010–2019", "2020–idag"];

test("historien har en h1 och visar perioderna i tidsordning, följt av idag", async ({
  page,
}) => {
  await page.goto("historia");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Vår historia, från 1995 till idag.",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText([...perioder, "Idag", "Var med och skriv nästa kapitel."]);
});

test("ett årtal som saknas visas som ”fylls i” och hittas inte på", async ({
  page,
}) => {
  await page.goto("historia");
  const forsta = page.getByRole("region", { name: "1995–1999" });
  await expect(forsta.getByRole("listitem").first()).toContainText("1995");
  await expect(
    forsta.getByRole("listitem").nth(1).getByText("år fylls i"),
  ).toBeVisible();
});

test("ett citat visas stort efter händelsens text, med citattecken", async ({
  page,
}) => {
  await page.goto("historia");
  const handelse = page
    .getByRole("region", { name: "1995–1999" })
    .getByRole("listitem")
    .first();
  const citat = handelse.locator("blockquote");
  await expect(citat).toHaveText("”TEST-CITAT.”");
  const storlek = await citat.evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize),
  );
  expect(storlek).toBeGreaterThanOrEqual(2.2 * 16);
  // An event without a quote shows nothing in its place.
  await expect(
    page
      .getByRole("region", { name: "1995–1999" })
      .getByRole("listitem")
      .nth(1)
      .locator("blockquote"),
  ).toHaveCount(0);
});

test("menyn för perioderna hoppar till varje period", async ({ page }) => {
  await page.goto("historia");
  const meny = page.getByRole("navigation", { name: "Hoppa till en period" });
  await expect(meny.getByRole("link")).toHaveText(perioder);
  await meny.getByRole("link", { name: "2010–2019" }).click();
  await expect(page).toHaveURL(/#period-2010-2019$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "2010–2019" }),
  ).toBeInViewport();
});

test("historien ligger under Om föreningen i sökvägen", async ({ page }) => {
  await page.goto("historia");
  const sokvag = page.getByRole("navigation", { name: "Du är här" });
  await expect(
    sokvag.getByRole("link", { name: "Om föreningen" }),
  ).toHaveAttribute("href", /\/om-foreningen$/);
  await expect(sokvag.getByText("Vår historia")).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("historien leder vidare till Bli fadder", async ({ page }) => {
  await page.goto("historia");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Bli fadder" }),
  ).toHaveAttribute("href", /\/bli-fadder$/);
});

test("historien klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto("historia");
  await expectNoA11yViolations(page);
});

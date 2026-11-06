import { expect, test, type Page } from "@playwright/test";

import { blockRepejo, expectNoA11yViolations, stubRepejo } from "./helpers";

/** The section "Bli fadder" on the home page. */
function sektion(page: Page) {
  return page.locator("#bli-fadder");
}

test.describe("sektionen Bli fadder", () => {
  test("förklarar fadderskapet och visar de tre stegen och förtroenderaden", async ({ page }) => {
    await page.goto("./");
    const s = sektion(page);
    await expect(s.getByRole("heading", { level: 2, name: "Bli fadder och håll ljusen tända." })).toBeVisible();
    await expect(s.getByText("Som fadder stöttar du alla 20 fadderbarnen tillsammans.")).toBeVisible();
    await expect(s.getByText(/Vill du hellre följa ett av barnen\?/)).toBeVisible();

    await expect(s.getByRole("heading", { name: "Så går det till" })).toBeVisible();
    const steg = s.getByRole("list", { name: "Så går det till" }).getByRole("listitem");
    await expect(steg).toHaveCount(3);
    await expect(steg.nth(0)).toContainText("Du väljer belopp och betalsätt");
    await expect(steg.nth(1)).toContainText("Betalningen går via Repejo");
    await expect(steg.nth(2)).toContainText("Någon i föreningen hör av sig");

    await expect(s.getByText("Barnen väljs ut tillsammans med de lokala myndigheterna i Addis Abeba.")).toBeVisible();
  });

  test("sektionen ligger sist i innehållet", async ({ page }) => {
    await page.goto("./");
    const sista = await page.locator("main > section").last().getAttribute("id");
    expect(sista).toBe("bli-fadder");
  });
});

test.describe("sektionen Bli fadder med tom testfil", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("kontakt, e-post och Swish visar ”fylls i”", async ({ page }) => {
    await page.goto("./");
    const s = sektion(page);
    await expect(s.locator("p", { hasText: "Frågor?" })).toContainText("namn fylls i");
    await expect(s.locator("p", { hasText: "Frågor?" })).toContainText("e-post fylls i");
    await expect(s.locator("p", { hasText: "engångsgåva" })).toContainText("nummer fylls i");
  });
});

test.describe("sektionen Bli fadder med ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("kontakt, e-post och Swish kommer från föreningsuppgifterna", async ({ page }) => {
    await page.goto("./");
    const s = sektion(page);
    await expect(s.locator("p", { hasText: "Frågor?" })).toContainText("Testperson");
    await expect(s.locator("p", { hasText: "Frågor?" }).getByRole("link", { name: "test@example.org" })).toHaveAttribute(
      "href",
      "mailto:test@example.org",
    );
    await expect(s.locator("p", { hasText: "engångsgåva" })).toContainText("TEST-SWISH");
    await expect(s.locator("p", { hasText: "Frågor?" }).getByText(/fylls i/)).toHaveCount(0);
    await expect(s.locator("p", { hasText: "engångsgåva" }).getByText(/fylls i/)).toHaveCount(0);
  });
});

test.describe("Repejos formulär i sektionen", () => {
  test("visar Repejos checkout för att bli fadder, med en reservlänk under", async ({ page }) => {
    await stubRepejo(page);
    await page.goto("./");
    const s = sektion(page);
    await expect(s.getByText("Repejos checkout (stubb)")).toBeVisible();
    await expect(s.locator("repejo-checkout")).toHaveAttribute("short_code", "7r3dB");
    await expect(s.getByRole("link", { name: "Bli fadder via Repejos kampanjsida" })).toHaveAttribute(
      "href",
      "https://app.repejo.se/s/7r3dB",
    );
  });

  test("reservlänken finns kvar när Repejo inte kan nås", async ({ page }) => {
    await blockRepejo(page);
    await page.goto("./");
    await expect(sektion(page).getByRole("link", { name: "Bli fadder via Repejos kampanjsida" })).toBeVisible();
  });
});

test.describe("dockan Bli fadder", () => {
  /** The dock's "Bli fadder" link. While the dock is hidden it is not in the accessibility tree at all. */
  function docka(page: Page) {
    return page.locator("[data-docka]").getByRole("link", { name: "Bli fadder" });
  }

  test("på smal skärm visas dockan bara när huvudknappen inte syns, och den leder till Bli fadder", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "dockan finns bara på smal skärm");
    await page.goto("./");
    const huvudknapp = page.getByRole("banner").getByRole("link", { name: "Bli fadder" }).last();
    await expect(huvudknapp).toBeInViewport();
    await expect(docka(page)).toBeHidden();

    await page.locator("#stod").scrollIntoViewIfNeeded();
    await expect(huvudknapp).not.toBeInViewport();
    await expect(docka(page)).toBeVisible();
    await expect(docka(page)).toBeInViewport();
    await expectNoA11yViolations(page);

    await docka(page).click();
    await expect(page).toHaveURL(/#bli-fadder$/);
    await expect(docka(page)).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(docka(page)).toBeHidden();
  });

  test("på bred skärm visas dockan aldrig", async ({ page, isMobile }) => {
    test.skip(isMobile, "gäller bred skärm");
    await page.goto("./");
    await page.locator("#stod").scrollIntoViewIfNeeded();
    await page.locator("#sa-arbetar-vi").scrollIntoViewIfNeeded();
    await expect(docka(page)).toBeHidden();
  });

  test("en dold docka går inte att nå med tangentbord eller skärmläsare", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("[data-docka]")).toHaveCount(1);
    await expect(docka(page)).toHaveCount(0);
  });
});

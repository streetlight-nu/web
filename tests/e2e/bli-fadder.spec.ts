import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations, funktionPa, LAYOUT, stubRepejo } from "./helpers";

/** The short gold field "Bli fadder" on the home page. */
function sektion(page: Page) {
  return page.locator("#bli-fadder");
}

test.describe("guldfältet Bli fadder på startsidan", () => {
  test("visar rubriken, ingressen och en Bli fadder-knapp till sidan Bli fadder", async ({ page }) => {
    await page.goto("./");
    const s = sektion(page);
    await expect(s.getByRole("heading", { level: 2, name: "Bli fadder och håll ljusen tända." })).toBeVisible();
    await expect(s.getByText("Som fadder stöttar du alla 20 fadderbarnen tillsammans.")).toBeVisible();
    await expect(s.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
  });

  test("guldfältet leder hellre-en-engångsgåva till Fler sätt att stödja oss", async ({ page }) => {
    // Repejo's real checkout grows and moves the scroll after the jump; the test is about our link and anchor.
    await stubRepejo(page);
    await page.goto("./");
    const s = sektion(page);
    await expect(s.getByText("Hellre en engångsgåva?")).toBeVisible();
    const lank = s.getByRole("link", { name: "Fler sätt att stödja oss" });
    await expect(lank).toHaveAttribute("href", /\/bli-fadder#fler$/);
    await lank.click();
    await expect(page).toHaveURL(/\/bli-fadder#fler$/);
    await expect(page.getByRole("heading", { name: "Fler sätt att stödja oss." })).toBeInViewport();
    await expectNoA11yViolations(page);
  });

  test("guldfältet ligger sist i innehållet", async ({ page }) => {
    await page.goto("./");
    const sista = await page.locator("main > section").last().getAttribute("id");
    expect(sista).toBe("bli-fadder");
  });

  test("startsidan visar inga steg, ingen kontaktrad, ingen Swish och ingen Repejo-checkout", async ({ page }) => {
    await stubRepejo(page);
    await page.goto("./");
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "Så går det till" })).toHaveCount(0);
    await expect(main.getByText("Frågor? Kontakta")).toHaveCount(0);
    await expect(main.getByText("Swish")).toHaveCount(0);
    await expect(page.locator("repejo-checkout")).toHaveCount(0);
  });

  test("huvudknappen Bli fadder i toppen leder till sidan Bli fadder", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("[data-huvudknapp]")).toHaveAccessibleName("Bli fadder");
    await expect(page.locator("[data-huvudknapp]")).toHaveAttribute("href", /\/bli-fadder$/);
  });
});

test.describe("dockan Bli fadder", LAYOUT, () => {
  /** The dock's "Bli fadder" link. While the dock is hidden it is not in the accessibility tree at all. */
  function docka(page: Page) {
    return page.locator("[data-docka]").getByRole("link", { name: "Bli fadder" });
  }

  test("på smal skärm visas dockan bara när huvudknappen inte syns, och den leder till sidan Bli fadder", async ({
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

    await expect(docka(page)).toHaveAttribute("href", /\/bli-fadder$/);

    await page.locator("#bli-fadder").scrollIntoViewIfNeeded();
    await expect(docka(page)).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(docka(page)).toBeHidden();

    await page.locator("#stod").scrollIntoViewIfNeeded();
    await docka(page).click();
    await expect(page).toHaveURL(/\/bli-fadder$/);
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

test.describe("Bli fadder på hela sajten", () => {
  const ETT_INLAGG = "nyheter/arsmote-25-april-valkommen-att-vara-med-och-forma-streetlight";

  test("ingen länk pekar längre till startsidans guldfält", async ({ page }) => {
    const sidor = ["./", "bli-fadder", "om-foreningen", "vanliga-fragor", "nyheter", ETT_INLAGG];
    if (funktionPa("historia")) sidor.push("historia");
    if (funktionPa("julklapp")) sidor.push("julklapp");
    for (const sida of sidor) {
      await page.goto(sida);
      await expect(page.locator('a[href*="#bli-fadder"]'), sida).toHaveCount(0);
    }
  });

  test("sidfoten har kolumnen Stöd oss med länken Bli fadder till sidan Bli fadder", async ({ page }) => {
    await page.goto("./");
    const fot = page.getByRole("contentinfo");
    await expect(fot.getByRole("heading", { level: 2, name: "Stöd oss" })).toBeVisible();
    await expect(fot.getByText("Som fadder stöttar du alla 20 fadderbarnen tillsammans.")).toBeVisible();
    await expect(fot.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
    await expect(fot.getByRole("link", { name: "Anmäl intresse" })).toHaveCount(0);
  });

  test("sidfoten har länken Swisha en gåva till Fler sätt att stödja oss på alla sidor", async ({ page }) => {
    const sidor = ["./", "bli-fadder", "om-foreningen", "vanliga-fragor", "nyheter", ETT_INLAGG];
    if (funktionPa("historia")) sidor.push("historia");
    if (funktionPa("julklapp")) sidor.push("julklapp");
    for (const sida of sidor) {
      await page.goto(sida);
      await expect(
        page.getByRole("contentinfo").getByRole("link", { name: "Swisha en gåva" }),
        sida,
      ).toHaveAttribute("href", /\/bli-fadder#fler$/);
    }
  });
});

import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

const sida = "vanliga-fragor";

const oppnaAlla = (page: Page) =>
  page.locator("details").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));

// The default build uses the association's own questions (src/content/fragor), which change in Pages CMS.
// So these tests check only what holds whatever the questions say.

test("har titel, en h1 och frågorna i grupper", async ({ page }) => {
  await page.goto(sida);
  await expect(page).toHaveTitle("Vanliga frågor | Streetlight");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vanliga frågor.");
  await expect(page.getByRole("region", { name: "Att vara fadder" }).locator("details").first()).toBeVisible();
});

test("en fråga öppnas och stängs med tangentbordet", async ({ page }) => {
  await page.goto(sida);
  const fraga = page.locator("details").first();
  const svar = fraga.locator(".svar");
  await expect(svar).toBeHidden();
  await fraga.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(svar).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(svar).toBeHidden();
});

test("sidfoten länkar hit", async ({ page }) => {
  await page.goto(sida);
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Vanliga frågor" })).toHaveAttribute(
    "href",
    /\/vanliga-fragor$/,
  );
});

test("leder vidare till Bli fadder och klarar WCAG 2.1 AA, även med alla frågor öppna", async ({ page }) => {
  await page.goto(sida);
  await expect(page.getByRole("main").getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/stod-oss$/);
  await expectNoA11yViolations(page);
  await oppnaAlla(page);
  await expectNoA11yViolations(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

// The two other builds use the test questions in tests/fixtures/fragor (see playwright.config.ts).

test.describe("med testfrågorna och tomma föreningsuppgifter", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("visar frågorna i gruppernas ordning och sedan efter ordning", async ({ page }) => {
    await page.goto(sida);
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "Att vara fadder",
      "Barnen och familjerna",
      "Föreningen",
      "Hittade du inte svaret?",
      "Hjälp oss hålla ljusen tända.",
    ]);
    await expect(page.locator("summary")).toHaveText([
      "Första frågan?",
      "Andra frågan?",
      "Hur betalar jag?",
      "Vad innebär det att vara fadder?",
      "En fråga om barnen?",
      "Hur vet jag att pengarna når fram?",
      "Får jag höra hur det går?",
    ]);
  });

  test("en länk till en fråga öppnar den, även inifrån sidan", async ({ page }) => {
    await page.goto(`${sida}#fraga-andra-fragan`);
    await expect(page.locator("#fraga-andra-fragan")).toHaveAttribute("open", "");
    await expect(page.locator("#fraga-andra-fragan summary")).toBeInViewport();
    await page.evaluate(() => (location.hash = "fraga-hur-vet-jag-att-pengarna-nar-fram"));
    await expect(page.locator("#fraga-hur-vet-jag-att-pengarna-nar-fram")).toHaveAttribute("open", "");
    await expect(page.locator("#fraga-hur-vet-jag-att-pengarna-nar-fram summary")).toBeFocused();
  });

  test("ett tomt svar och saknade uppgifter visas som ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await oppnaAlla(page);
    await expect(page.locator("#fraga-andra-fragan")).toContainText("fylls i av föreningen");
    await expect(page.locator("#fraga-forsta-fragan")).toContainText("Swish: nummer fylls i");
    await expect(page.locator("#fraga-en-fraga-om-barnen")).toContainText("Kontakta namn fylls i på e-post fylls i.");
    await expect(page.locator("#fraga-hur-vet-jag-att-pengarna-nar-fram")).toContainText("Senaste årsredovisning: länk fylls i");
    await expect(page.getByRole("main").locator(".sl-todo").first()).toBeVisible();
  });

  test("en länk direkt till en fråga öppnar den", async ({ page }) => {
    await page.goto(`${sida}#fraga-hur-vet-jag-att-pengarna-nar-fram`);
    const fraga = page.locator("#fraga-hur-vet-jag-att-pengarna-nar-fram");
    await expect(fraga).toHaveAttribute("open", "");
    await expect(fraga.locator("summary")).toBeInViewport();
  });

  test("en länk i ett svar leder rätt", async ({ page }) => {
    await page.goto(`${sida}#fraga-forsta-fragan`);
    await expect(page.getByRole("link", { name: "länk till Nyheter" })).toHaveAttribute("href", /\/nyheter$/);
  });
});

test.describe("med testfrågorna och ifyllda föreningsuppgifter", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("svaren visar föreningsuppgifterna i stället för ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await oppnaAlla(page);
    await expect(page.locator("#fraga-forsta-fragan")).toContainText("Swish: TEST-SWISH");
    const barnen = page.locator("#fraga-en-fraga-om-barnen");
    await expect(barnen).toContainText("Kontakta Testperson på test@example.org.");
    await expect(barnen.getByRole("link", { name: "test@example.org" })).toHaveAttribute("href", "mailto:test@example.org");
    const foreningen = page.locator("#fraga-hur-vet-jag-att-pengarna-nar-fram");
    await expect(foreningen).toContainText("TEST-ORGNR");
    await expect(foreningen).toContainText("TEST-90-KONTO");
    await expect(foreningen.getByRole("link", { name: "Läs årsredovisningen" })).toHaveAttribute(
      "href",
      "https://example.org/test-arsredovisning.pdf",
    );
    // Only the empty answers are left to fill in.
    await expect(page.getByRole("main").locator(".sl-todo")).toHaveText(["fylls i av föreningen", "fylls i av föreningen"]);
    await expectNoA11yViolations(page);
  });
});

import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

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
    await expect(steg.nth(0)).toContainText("Du skickar en intresseanmälan");
    await expect(steg.nth(1)).toContainText("Någon i föreningen hör av sig");
    await expect(steg.nth(2)).toContainText("Du börjar ge.");

    await expect(s.getByText("Barnen väljs ut tillsammans med de lokala myndigheterna i Addis Abeba.")).toBeVisible();
  });

  test("sektionen ligger sist i innehållet", async ({ page }) => {
    await page.goto("./");
    const sista = await page.locator("main > section").last().getAttribute("id");
    expect(sista).toBe("bli-fadder");
  });

  test("tom datafil: kontakt, e-post och Swish visar ”fylls i”", async ({ page }) => {
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

/** The intresseanmälan form in the section. */
function formular(page: Page) {
  return sektion(page).getByRole("form", { name: "Anmäl intresse" });
}

test.describe("intresseanmälan", () => {
  test("säger före sändning att formuläret inte är kopplat", async ({ page }) => {
    await page.goto("./");
    await expect(formular(page).getByText("Formuläret är inte kopplat än.")).toBeVisible();
  });

  test("har fälten och valet, med fadder för alla barnen förvalt", async ({ page }) => {
    await page.goto("./");
    const f = formular(page);
    await expect(f.getByLabel("Namn")).toBeVisible();
    await expect(f.getByLabel("E-post")).toBeVisible();
    await expect(f.getByLabel("Telefon (valfritt)")).toBeVisible();
    await expect(f.getByLabel("Meddelande (valfritt)")).toBeVisible();
    const val = f.getByRole("radiogroup", { name: "Jag vill" });
    await expect(val.getByRole("radio")).toHaveCount(3);
    await expect(val.getByRole("radio", { name: "fadder för alla barnen" })).toBeChecked();
    await expect(val.getByRole("radio", { name: "fadder för ett barn" })).not.toBeChecked();
    await expect(val.getByRole("radio", { name: "veta mer först" })).not.toBeChecked();
  });

  test("tomt namn och tom e-post ger fel kopplade till fälten, och fokus går till första felet", async ({ page }) => {
    await page.goto("./");
    const f = formular(page);
    await f.getByRole("button", { name: "Skicka anmälan" }).click();

    const namn = f.getByLabel("Namn");
    const epost = f.getByLabel("E-post");
    await expect(namn).toHaveAttribute("aria-invalid", "true");
    await expect(epost).toHaveAttribute("aria-invalid", "true");
    await expect(namn).toHaveAccessibleDescription("Skriv ditt namn så vet vi vem vi ska kontakta.");
    await expect(epost).toHaveAccessibleDescription("Kontrollera e-postadressen, till exempel namn@exempel.se.");
    await expect(namn).toBeFocused();
    await expectNoA11yViolations(page);
  });

  test("ogiltig e-post ger fel bara på e-posten, och felet försvinner när man rättar", async ({ page }) => {
    await page.goto("./");
    const f = formular(page);
    await f.getByLabel("Namn").fill("Anna Andersson");
    await f.getByLabel("E-post").fill("anna@");
    await f.getByRole("button", { name: "Skicka anmälan" }).click();

    const epost = f.getByLabel("E-post");
    await expect(f.getByLabel("Namn")).not.toHaveAttribute("aria-invalid", "true");
    await expect(epost).toHaveAttribute("aria-invalid", "true");
    await expect(epost).toBeFocused();

    await epost.fill("anna@exempel.se");
    await expect(epost).not.toHaveAttribute("aria-invalid", "true");
    await expect(f.getByText("Kontrollera e-postadressen")).toHaveCount(0);
  });

  /** Fills in a valid intresseanmälan and sends it. */
  async function skickaGiltig(page: Page) {
    const f = formular(page);
    await f.getByLabel("Namn").fill("Anna Andersson");
    await f.getByLabel("E-post").fill("anna@exempel.se");
    await f.getByLabel("Telefon (valfritt)").fill("070-000 00 00");
    await f.getByRole("radio", { name: "fadder för ett barn" }).click();
    await f.getByLabel("Meddelande (valfritt)").fill("Hej!");
    await f.getByRole("button", { name: "Skicka anmälan" }).click();
  }

  test("tackläget säger att anmälan inte har skickats, och ingen data lämnar sidan", async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    const anrop: string[] = [];
    page.on("request", (request) => anrop.push(`${request.method()} ${request.url()}`));
    const url = page.url();

    await skickaGiltig(page);

    const tack = formular(page).getByRole("region", { name: "Tack, Anna!" });
    await expect(tack).toBeVisible();
    await expect(tack).toBeFocused();
    await expect(tack).toContainText("din anmälan har inte skickats");
    await expect(tack.getByText("e-post fylls i", { exact: true })).toBeVisible();
    await expect(formular(page).getByLabel("Namn")).toBeHidden();
    expect(page.url()).toBe(url);
    expect(anrop).toEqual([]);
    await expectNoA11yViolations(page);
  });

  test("”Ändra anmälan” tar tillbaka formuläret med värdena kvar", async ({ page }) => {
    await page.goto("./");
    await skickaGiltig(page);
    const f = formular(page);
    await f.getByRole("button", { name: "Ändra anmälan" }).click();

    await expect(f.getByRole("region", { name: /Tack/ })).toHaveCount(0);
    await expect(f.getByLabel("Namn")).toHaveValue("Anna Andersson");
    await expect(f.getByLabel("Namn")).toBeFocused();
    await expect(f.getByLabel("E-post")).toHaveValue("anna@exempel.se");
    await expect(f.getByLabel("Telefon (valfritt)")).toHaveValue("070-000 00 00");
    await expect(f.getByRole("radio", { name: "fadder för ett barn" })).toBeChecked();
    await expect(f.getByLabel("Meddelande (valfritt)")).toHaveValue("Hej!");
    await expect(f.getByText("Formuläret är inte kopplat än.")).toBeVisible();
  });
});

test.describe("intresseanmälan med ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("tackläget hänvisar till föreningens e-post", async ({ page }) => {
    await page.goto("./");
    const f = formular(page);
    await f.getByLabel("Namn").fill("Anna");
    await f.getByLabel("E-post").fill("anna@exempel.se");
    await f.getByRole("button", { name: "Skicka anmälan" }).click();
    const tack = f.getByRole("region", { name: "Tack, Anna!" });
    await expect(tack.getByRole("link", { name: "test@example.org" })).toHaveAttribute("href", "mailto:test@example.org");
    await expect(tack.getByText(/fylls i/)).toHaveCount(0);
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

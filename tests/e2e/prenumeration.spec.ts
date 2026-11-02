import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

/** The section "Följ arbetet i Addis Abeba." at the end of the Nyheter page. */
function sektion(page: Page) {
  return page.locator("#nyheter-med-epost");
}

/** The form for getting the news by e-mail. */
function formular(page: Page) {
  return sektion(page).getByRole("form", { name: "Få nyheterna med e-post" });
}

test.describe("sektionen Få nyheterna med e-post", () => {
  test("ligger sist på Nyheter-sidan med rubrik, ingress och en länk till Nyheter", async ({ page }) => {
    await page.goto("nyheter");
    const sista = await page.locator("main > section").last().getAttribute("id");
    expect(sista).toBe("nyheter-med-epost");

    const s = sektion(page);
    await expect(s.getByRole("heading", { level: 2, name: "Följ arbetet i Addis Abeba." })).toBeVisible();
    await expect(s.getByText("Få föreningens nyheter med e-post.")).toBeVisible();
    expect(await s.innerText()).not.toMatch(/nyhetsbrev/i);
    await s.getByRole("link", { name: "Nyheter" }).click();
    await expect(page).toHaveURL(/\/nyheter\/?#alla-nyheter$/);
  });

  test("rubriken och formuläret står bredvid varandra på bred skärm och under varandra på mobil", async ({
    page,
    isMobile,
  }) => {
    await page.goto("nyheter");
    const rubrik = (await sektion(page).getByRole("heading", { level: 2 }).boundingBox())!;
    const panel = (await formular(page).boundingBox())!;
    if (isMobile) expect(panel.y).toBeGreaterThanOrEqual(rubrik.y + rubrik.height);
    else expect(panel.x).toBeGreaterThanOrEqual(rubrik.x + rubrik.width);
  });

  test("brödtexten är minst 18 px och tryckytorna minst 44 px", async ({ page }) => {
    await page.goto("nyheter");
    const s = sektion(page);
    const sizes = await s
      .locator("p")
      .evaluateAll((els) =>
        els.map((el) => ({ text: el.textContent!.trim().slice(0, 40), px: parseFloat(getComputedStyle(el).fontSize) })),
      );
    expect(sizes.length).toBeGreaterThanOrEqual(3);
    expect(sizes.filter((size) => size.px < 18)).toEqual([]);

    const f = formular(page);
    const ytor = [
      s.getByRole("link", { name: "Nyheter" }),
      f.getByLabel("Förnamn (valfritt)"),
      f.getByLabel("E-post", { exact: true }),
      f.locator("label", { hasText: "Föreningen får spara min e-post" }),
      f.getByRole("button", { name: "Prenumerera" }),
    ];
    for (const yta of ytor) {
      const box = (await yta.boundingBox())!;
      expect(box.height, await yta.evaluate((el) => el.outerHTML.slice(0, 60))).toBeGreaterThanOrEqual(44);
    }
  });

  test("fokusringen är guld på grönt och bläck på den vita panelen", async ({ page }) => {
    await page.goto("nyheter");
    const outline = (el: Element) => ({ visible: el.matches(":focus-visible"), color: getComputedStyle(el).outlineColor });

    const lank = sektion(page).getByRole("link", { name: "Nyheter" });
    await lank.focus();
    expect(await lank.evaluate(outline)).toEqual({ visible: true, color: "rgb(244, 180, 0)" });

    const f = formular(page);
    await f.getByLabel("E-post", { exact: true }).focus();
    await page.keyboard.press("Tab");
    const samtycke = f.getByRole("checkbox", { name: SAMTYCKE });
    await expect(samtycke).toBeFocused();
    expect(await samtycke.evaluate(outline)).toEqual({ visible: true, color: "rgb(11, 46, 36)" });
  });
});

test.describe("sektionen Få nyheterna med e-post utan JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("knappen är avstängd tills ön har hydrerats", async ({ page }) => {
    await page.goto("nyheter");
    await expect(formular(page).getByRole("button", { name: "Prenumerera" })).toBeDisabled();
  });
});

const SAMTYCKE = "Föreningen får spara min e-post för att skicka nyheter. Jag kan avsluta när jag vill.";

test.describe("formuläret Få nyheterna med e-post", () => {
  test("säger före sändning att formuläret inte är kopplat", async ({ page }) => {
    await page.goto("nyheter");
    await expect(formular(page).getByText("Formuläret är inte kopplat än.")).toBeVisible();
  });

  test("har förnamn, e-post och en samtyckesruta som inte är ikryssad", async ({ page }) => {
    await page.goto("nyheter");
    const f = formular(page);
    await expect(f.getByLabel("Förnamn (valfritt)")).toBeVisible();
    await expect(f.getByLabel("E-post", { exact: true })).toBeVisible();
    await expect(f.getByRole("checkbox", { name: SAMTYCKE })).not.toBeChecked();
    await expect(f.getByRole("button", { name: "Prenumerera" })).toBeEnabled();
  });

  test("tomt formulär ger fel på e-post och samtycke, och fokus går till e-posten", async ({ page }) => {
    await page.goto("nyheter");
    const f = formular(page);
    await f.getByRole("button", { name: "Prenumerera" }).click();

    const epost = f.getByLabel("E-post", { exact: true });
    const samtycke = f.getByRole("checkbox", { name: SAMTYCKE });
    await expect(epost).toHaveAttribute("aria-invalid", "true");
    await expect(samtycke).toHaveAttribute("aria-invalid", "true");
    await expect(epost).toHaveAccessibleDescription("Skriv din e-postadress.");
    await expect(samtycke).toHaveAccessibleDescription("Kryssa i rutan, annars kan vi inte skicka något till dig.");
    await expect(f.getByLabel("Förnamn (valfritt)")).not.toHaveAttribute("aria-invalid", "true");
    await expect(epost).toBeFocused();
    await expectNoA11yViolations(page);
  });

  test("ogiltig e-post ger fel bara på e-posten, och felet försvinner när man rättar", async ({ page }) => {
    await page.goto("nyheter");
    const f = formular(page);
    await f.getByLabel("E-post", { exact: true }).fill("anna@");
    await f.getByRole("checkbox", { name: SAMTYCKE }).check();
    await f.getByRole("button", { name: "Prenumerera" }).click();

    const epost = f.getByLabel("E-post", { exact: true });
    await expect(epost).toHaveAttribute("aria-invalid", "true");
    await expect(epost).toHaveAccessibleDescription("Kontrollera e-postadressen, till exempel namn@exempel.se.");
    await expect(f.getByRole("checkbox", { name: SAMTYCKE })).not.toHaveAttribute("aria-invalid", "true");
    await expect(epost).toBeFocused();

    await epost.fill("anna@exempel.se");
    await expect(epost).not.toHaveAttribute("aria-invalid", "true");
    await expect(f.getByText("Kontrollera e-postadressen")).toHaveCount(0);
  });

  test("samtyckesfelet försvinner när rutan kryssas i", async ({ page }) => {
    await page.goto("nyheter");
    const f = formular(page);
    await f.getByLabel("E-post", { exact: true }).fill("anna@exempel.se");
    await f.getByRole("button", { name: "Prenumerera" }).click();

    const samtycke = f.getByRole("checkbox", { name: SAMTYCKE });
    await expect(samtycke).toHaveAttribute("aria-invalid", "true");
    await expect(samtycke).toBeFocused();
    await samtycke.check();
    await expect(samtycke).not.toHaveAttribute("aria-invalid", "true");
    await expect(f.getByText("Kryssa i rutan")).toHaveCount(0);
  });

  /** Fills in a valid prenumeration, with or without a first name, and sends it. */
  async function skickaGiltig(page: Page, fornamn = "Anna") {
    const f = formular(page);
    if (fornamn) await f.getByLabel("Förnamn (valfritt)").fill(fornamn);
    await f.getByLabel("E-post", { exact: true }).fill("anna@exempel.se");
    await f.getByRole("checkbox", { name: SAMTYCKE }).check();
    await f.getByRole("button", { name: "Prenumerera" }).click();
  }

  test("tackläget säger att e-posten inte har sparats, och ingen data lämnar sidan", async ({ page }) => {
    await page.goto("nyheter");
    await page.waitForLoadState("networkidle");
    const anrop: string[] = [];
    page.on("request", (request) => anrop.push(`${request.method()} ${request.url()}`));
    const url = page.url();

    await skickaGiltig(page);

    const tack = formular(page).getByRole("region", { name: "Tack, Anna!" });
    await expect(tack).toBeVisible();
    await expect(tack).toBeFocused();
    await expect(tack).toContainText("din e-post har inte sparats");
    await expect(tack.getByText("e-post fylls i", { exact: true })).toBeVisible();
    await expect(formular(page).getByLabel("E-post", { exact: true })).toBeHidden();
    expect(page.url()).toBe(url);
    expect(anrop).toEqual([]);
    await expectNoA11yViolations(page);
  });

  test("utan förnamn är rubriken i tackläget ”Tack!”", async ({ page }) => {
    await page.goto("nyheter");
    await skickaGiltig(page, "");
    await expect(formular(page).getByRole("region", { name: "Tack!" })).toBeFocused();
  });

  test("”Ändra” tar tillbaka formuläret med värdena kvar", async ({ page }) => {
    await page.goto("nyheter");
    await skickaGiltig(page);
    const f = formular(page);
    await f.getByRole("button", { name: "Ändra" }).click();

    await expect(f.getByRole("region", { name: /Tack/ })).toHaveCount(0);
    await expect(f.getByLabel("Förnamn (valfritt)")).toHaveValue("Anna");
    await expect(f.getByLabel("Förnamn (valfritt)")).toBeFocused();
    await expect(f.getByLabel("E-post", { exact: true })).toHaveValue("anna@exempel.se");
    await expect(f.getByRole("checkbox", { name: SAMTYCKE })).toBeChecked();
    await expect(f.getByText("Formuläret är inte kopplat än.")).toBeVisible();
  });
});

test.describe("formuläret Få nyheterna med e-post med ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("tackläget hänvisar till föreningens e-post", async ({ page }) => {
    await page.goto("nyheter");
    const f = formular(page);
    await f.getByLabel("E-post", { exact: true }).fill("anna@exempel.se");
    await f.getByRole("checkbox", { name: SAMTYCKE }).check();
    await f.getByRole("button", { name: "Prenumerera" }).click();
    const tack = f.getByRole("region", { name: "Tack!" });
    await expect(tack.getByRole("link", { name: "test@example.org" })).toHaveAttribute("href", "mailto:test@example.org");
    await expect(tack.getByText(/fylls i/)).toHaveCount(0);
  });
});

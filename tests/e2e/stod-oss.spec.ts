import { expect, test, type Page } from "@playwright/test";

import { FADDER_KORTKOD, SWISH_KORTKOD } from "../../src/lib/repejo";
import { blockRepejo, expectNoA11yViolations, stubRepejo } from "./helpers";

const sida = "stod-oss";

/** The gold field "Bli fadder" (#bli-fadder) at the top of Stöd oss. */
function guldfaltet(page: Page) {
  return page.locator("#bli-fadder");
}

/** The value shown for one föreningsuppgift in Insyn under Så når det fram, found by its label. */
function uppgift(page: Page, label: string) {
  return page
    .locator("#nar-fram")
    .getByRole("region", { name: "Insyn" })
    .getByRole("definition")
    .filter({ has: page.locator(`xpath=preceding-sibling::dt[normalize-space()="${label}"]`) });
}

test("Stöd oss har titel, en h1 och klarar WCAG 2.1 AA", async ({ page }) => {
  await stubRepejo(page);
  await page.goto(sida);
  await expect(page).toHaveTitle("Stöd oss | Streetlight");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bli fadder och håll ljusen tända.");
  await expectNoA11yViolations(page);
});

test("hopplänken leder till innehållet", async ({ page }) => {
  await page.goto(sida);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Hoppa till innehållet" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("staplas utan sidledsskroll", async ({ page }) => {
  await stubRepejo(page);
  await page.goto(sida);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("brödsmulorna visar Startsidan / Stöd oss", async ({ page }) => {
  await page.goto(sida);
  const smulor = page.getByRole("navigation", { name: "Du är här" });
  await expect(smulor.getByRole("link", { name: "Startsidan" })).toHaveAttribute("href", /\/$/);
  await expect(smulor.getByText("Stöd oss")).toHaveAttribute("aria-current", "page");
});

test("Bli fadder i menyn är en linjeknapp markerad som aktuell sida", async ({ page }) => {
  await page.goto(sida);
  const knapp = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Bli fadder" });
  await expect(knapp).toHaveAttribute("aria-current", "page");
  expect(await knapp.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgb(244, 180, 0)");
});

test("guldfältet visar rubriken, ingressen, de tre fakta och de tre stegen", async ({ page }) => {
  await page.goto(sida);
  const s = guldfaltet(page);
  await expect(s.getByRole("heading", { level: 1, name: "Bli fadder och håll ljusen tända." })).toBeVisible();
  await expect(s.getByText("Som fadder stöttar du alla 20 fadderbarnen tillsammans.")).toBeVisible();

  const fakta = s.getByRole("list").filter({ hasNotText: "Du väljer belopp" }).getByRole("listitem");
  await expect(fakta).toHaveCount(3);
  await expect(fakta.nth(0)).toContainText("Alla 20 barnen tillsammans.");
  await expect(fakta.nth(0)).toContainText("Vill du hellre följa ett av barnen?");
  await expect(fakta.nth(1)).toContainText("Barnen väljs ut tillsammans med de lokala myndigheterna i Addis Abeba.");
  await expect(fakta.nth(2)).toContainText("Pengarna går via den svenska föreningen till arbetet i Etiopien.");

  await expect(s.getByRole("heading", { name: "Så går det till" })).toBeVisible();
  const steg = s.getByRole("list", { name: "Så går det till" }).getByRole("listitem");
  await expect(steg).toHaveCount(3);
  await expect(steg.nth(0)).toContainText("Du väljer belopp och betalsätt");
  await expect(steg.nth(1)).toContainText("Betalningen går via Repejo");
  await expect(steg.nth(2)).toContainText("Någon i föreningen hör av sig");

  // The contact row was removed in the design.
  await expect(s.getByText("Frågor?")).toHaveCount(0);
});

test("Repejos checkout har fadderkortkoden och ingen reservlänk under sig", async ({ page }) => {
  await stubRepejo(page);
  await page.goto(sida);
  const s = guldfaltet(page);
  await expect(s.getByText("Repejos checkout (stubb)")).toBeVisible();
  await expect(s.locator("repejo-checkout")).toHaveAttribute("short_code", FADDER_KORTKOD);
  await expect(s.getByRole("link")).toHaveCount(0);
  await expect(s.getByText("Fungerar inte betalningen?")).toHaveCount(0);
});

test("när Repejo inte kan nås syns ramen med väntetexten", async ({ page }) => {
  await blockRepejo(page);
  await page.goto(sida);
  const ram = guldfaltet(page).locator("repejo-checkout");
  await expect(ram).toBeVisible();
  expect(await ram.evaluate((el) => getComputedStyle(el, "::before").content)).toBe(
    '"Här visas Repejos formulär för att bli fadder."',
  );
  expect(await ram.evaluate((el) => getComputedStyle(el).borderStyle)).toBe("dashed");
});

test("på dator står formuläret bredvid texten, på mobil direkt efter ingressen och före stegen", async ({
  page,
  isMobile,
}) => {
  await stubRepejo(page);
  await page.goto(sida);
  const s = guldfaltet(page);
  const ingress = (await s.getByText("Som fadder stöttar du alla 20 fadderbarnen tillsammans.").boundingBox())!;
  const formular = (await s.locator("repejo-checkout").boundingBox())!;
  const steg = (await s.getByRole("list", { name: "Så går det till" }).boundingBox())!;
  if (isMobile) {
    expect(formular.y).toBeGreaterThan(ingress.y + ingress.height);
    expect(formular.y + formular.height).toBeLessThanOrEqual(steg.y);
  } else {
    expect(formular.x).toBeGreaterThan(ingress.x + ingress.width);
    expect(formular.x).toBeGreaterThan(steg.x + steg.width);
    expect(formular.y).toBeLessThan(steg.y);
  }
});

test("Vart ditt bidrag går har en Ledger med fem rader", async ({ page }) => {
  await page.goto(sida);
  const s = page.locator("#vart");
  await expect(s.getByRole("heading", { level: 2, name: "Vart ditt bidrag går." })).toBeVisible();
  const rader = s.getByRole("listitem");
  await expect(rader).toHaveCount(5);
  await expect(s.getByRole("heading", { level: 3 })).toHaveText([
    "Skolavgifter",
    "Skoluniform",
    "Skolmaterial",
    "Vård när barnet blir sjukt",
    "En egen inkomst för familjen",
  ]);
});

test("Så når det fram visar rubriken, 20 barn, 20 ljus och guldtråden med tre steg", async ({ page }) => {
  await page.goto(sida);
  const s = page.locator("#nar-fram");
  await expect(s.getByRole("heading", { level: 2, name: "Små med flit, så att det når fram." })).toBeVisible();
  await expect(s.getByText("20 barn, 20 ljus.")).toBeVisible();
  await expect(s.getByText("Två föreningar med var sin styrelse")).toBeVisible();
  const steg = s.getByText(/^(Du blir fadder|Streetlight Sverige samlar|Streetlight Etiopien bär)/);
  await expect(steg).toHaveText([
    "Du blir fadder via Repejo.",
    "Streetlight Sverige samlar in pengarna och stöttar arbetet i Etiopien ekonomiskt.",
    "Streetlight Etiopien bär arbetet med barnen och familjerna på plats i Addis Abeba.",
  ]);
});

test("länken i Så når det fram leder till Om föreningen", async ({ page }) => {
  await page.goto(sida);
  await page.locator("#nar-fram").getByRole("link", { name: "Läs om föreningen" }).click();
  await expect(page).toHaveURL(/\/om-foreningen\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Om föreningen.");
});

test.describe("Stöd oss med ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("Insyn visar föreningsuppgifterna från datafilen", async ({ page }) => {
    await page.goto(sida);
    await expect(uppgift(page, "Organisationsnummer")).toHaveText("TEST-ORGNR");
    await expect(uppgift(page, "90-konto")).toHaveText("TEST-90-KONTO");
    await expect(
      uppgift(page, "Senaste årsredovisning").getByRole("link", { name: "Läs årsredovisningen" }),
    ).toHaveAttribute("href", "https://example.org/test-arsredovisning.pdf");
  });
});

test.describe("Stöd oss med tom testfil", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("Insyn visar ”fylls i” för det som saknas", async ({ page }) => {
    await page.goto(sida);
    await expect(uppgift(page, "Organisationsnummer")).toHaveText("fylls i");
    await expect(uppgift(page, "Senaste årsredovisning")).toHaveText("länk fylls i");
    await expect(uppgift(page, "90-konto")).toHaveText("fylls i");
  });

  test("brödtexten är minst 18 px", async ({ page }) => {
    await page.goto(sida);
    const sizes = await page
      .locator("main p, main li")
      .evaluateAll((els) =>
        els.map((el) => ({ text: el.textContent!.trim().slice(0, 40), px: parseFloat(getComputedStyle(el).fontSize) })),
      );
    expect(sizes.length).toBeGreaterThan(5);
    expect(sizes.filter((s) => s.px < 18)).toEqual([]);
  });
});

/** The cotton field "Innan du bestämmer dig." (#fragor) with the questions future fadder tend to ask. */
function fragorna(page: Page) {
  return page.locator("#fragor");
}

// The two fixture builds use the test questions in tests/fixtures/fragor: of the five chosen questions, three are
// there (one of them without an answer) and two are missing.
test.describe("frågorna med testfrågorna och tom testfil", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("visar de valda frågorna i sidans ordning och hoppar över dem som saknas", async ({ page }) => {
    await page.goto(sida);
    const s = fragorna(page);
    await expect(s.getByRole("heading", { level: 2, name: "Innan du bestämmer dig." })).toBeVisible();
    await expect(s.getByText("Det här brukar de som funderar på att bli fadder fråga om.")).toBeVisible();
    await expect(s.locator("summary")).toHaveText([
      "Vad innebär det att vara fadder?",
      "Hur betalar jag?",
      "Får jag höra hur det går?",
    ]);
  });

  test("en fråga öppnas och stängs med tangentbordet", async ({ page }) => {
    await page.goto(sida);
    const fraga = fragorna(page).locator("details").first();
    const svar = fraga.getByText("Ett svar om fadderskapet.");
    await expect(svar).toBeHidden();
    await fraga.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(svar).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(svar).toBeHidden();
  });

  test("ett tomt svar och en saknad föreningsuppgift visas som ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    const s = fragorna(page);
    await s.locator("summary").first().click();
    await expect(s.locator("details").first()).toContainText("Swish: nummer fylls i");
    const tomt = s.locator("details").filter({ hasText: "Hur betalar jag?" });
    await tomt.locator("summary").click();
    await expect(tomt.getByText("fylls i av föreningen")).toBeVisible();
  });

  test("frågorna har inga id:n som krockar med Vanliga frågor", async ({ page }) => {
    await page.goto(sida);
    await expect(fragorna(page).locator("details[id]")).toHaveCount(0);
    await expect(page.locator('[id^="fraga-"]')).toHaveCount(0);
  });

  test("avsnittet slutar med länken till alla vanliga frågor", async ({ page }) => {
    await page.goto(sida);
    await expect(fragorna(page).getByRole("heading", { name: "Innan du bestämmer dig." })).toBeVisible();

    const alla = fragorna(page).getByRole("link", { name: "Alla vanliga frågor" });
    await expect(alla).toHaveAttribute("href", /\/vanliga-fragor$/);
    await alla.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vanliga frågor.");
  });
});

test.describe("frågorna med testfrågorna och ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("svaren är samma som på Vanliga frågor, med föreningsuppgifterna ifyllda", async ({ page }) => {
    await page.goto(sida);
    const s = fragorna(page);
    await s.locator("details").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
    await expect(s.locator("details").first()).toContainText("Swish: TEST-SWISH");
    await expect(s.getByRole("link", { name: "Nyheter" })).toHaveAttribute("href", /\/nyheter$/);
    await expectNoA11yViolations(page);

    const har = await s.locator("details").allInnerTexts();
    await page.goto("vanliga-fragor");
    const pa = [];
    for (const id of ["vad-innebar-det-att-vara-fadder", "hur-betalar-jag", "far-jag-hora-hur-det-gar"]) {
      const fraga = page.locator(`#fraga-${id}`);
      await fraga.evaluate((el) => ((el as HTMLDetailsElement).open = true));
      pa.push(await fraga.innerText());
    }
    expect(har).toEqual(pa);
  });
});

/** The deep green field "Fler sätt att stödja oss." (#fler), last on the page. */
function fler(page: Page) {
  return page.locator("#fler");
}

test.describe("Fler sätt att stödja oss med ifylld testfil", () => {
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("visar raderna Swisha en gåva och Följ och berätta, med Swishnumret", async ({ page }) => {
    await stubRepejo(page);
    await page.goto(sida);
    const s = fler(page);
    await expect(s.getByRole("heading", { level: 2, name: "Fler sätt att stödja oss." })).toBeVisible();
    const rader = s.getByRole("listitem");
    await expect(rader).toHaveCount(2);
    await expect(rader.nth(0).getByRole("heading", { level: 3 })).toHaveText("Swisha en gåva");
    await expect(rader.nth(0)).toContainText("Vill du hellre ge en gång? Swisha en gåva till föreningen.");
    await expect(rader.nth(0).getByText("TEST-SWISH", { exact: true })).toBeVisible();
    await expect(rader.nth(1).getByRole("heading", { level: 3 })).toHaveText("Följ och berätta");
    await expectNoA11yViolations(page);
  });
});

test.describe("Fler sätt att stödja oss med tom testfil", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("ett saknat Swishnummer visas som ”nummer fylls i”", async ({ page }) => {
    await stubRepejo(page);
    await page.goto(sida);
    const swish = fler(page).getByRole("listitem").filter({ hasText: "Swisha en gåva" });
    await expect(swish.getByText("nummer fylls i")).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test("Swisha en gåva har Repejos Swish-checkout bredvid texten på dator och efter numret på mobil", async ({
  page,
  isMobile,
}) => {
  await stubRepejo(page);
  await page.goto(sida);
  const rad = fler(page).getByRole("listitem").filter({ hasText: "Swisha en gåva" });
  const checkout = rad.locator("repejo-checkout");
  await expect(checkout).toHaveAttribute("short_code", SWISH_KORTKOD);
  await expect(rad.getByText("Repejos checkout (stubb)")).toBeVisible();
  const text = (await rad.getByText("Vill du hellre ge en gång?").boundingBox())!;
  const nummer = (await rad.getByText("Eller swisha direkt till").boundingBox())!;
  const formular = (await checkout.boundingBox())!;
  if (isMobile) {
    expect(formular.y).toBeGreaterThan(nummer.y + nummer.height);
  } else {
    expect(formular.x).toBeGreaterThan(text.x + text.width);
    expect(formular.y).toBeLessThan(nummer.y);
  }
});

test("Få nyheterna med e-post leder till formuläret på Nyheter", async ({ page }) => {
  await page.goto(sida);
  const knapp = fler(page).getByRole("link", { name: "Få nyheterna med e-post" });
  await expect(knapp).toHaveAttribute("href", /\/nyheter#nyheter-med-epost$/);
  await knapp.click();
  await expect(page).toHaveURL(/\/nyheter#nyheter-med-epost$/);
  await expect(page.locator("#nyheter-med-epost")).toBeInViewport();
});

test("Fler sätt att stödja är sista avsnittet på sidan", async ({ page }) => {
  await page.goto(sida);
  await expect(fler(page).getByRole("heading", { name: "Fler sätt att stödja oss." })).toBeVisible();
  expect(await page.locator("main > section").last().getAttribute("id")).toBe("fler");
});

import { expect, test, type Page } from "@playwright/test";

import { FADDER_KORTKOD, SWISH_KORTKOD } from "../../src/lib/repejo";
import { blockRepejo, expectNoA11yViolations, farg, LAYOUT, stubRepejo } from "./helpers";

const sida = "bli-fadder";

/** The gold field "Bli fadder" (#bli-fadder) at the top of the page Bli fadder. */
function guldfaltet(page: Page) {
  return page.locator("#bli-fadder");
}

// The rules every page keeps (h1, WCAG, skip link, 18 px, no sideways scroll, the glossary) are in hela-sajten.spec.ts.

test("Bli fadder har titeln och rubriken", async ({ page }) => {
  await page.goto(sida);
  await expect(page).toHaveTitle("Bli fadder | Streetlight");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bli fadder och håll ljusen tända.");
});

test("brödsmulorna visar Startsidan / Bli fadder", async ({ page }) => {
  await page.goto(sida);
  const smulor = page.getByRole("navigation", { name: "Du är här" });
  await expect(smulor.getByRole("link", { name: "Startsidan" })).toHaveAttribute("href", /\/$/);
  await expect(smulor.getByText("Bli fadder")).toHaveAttribute("aria-current", "page");
});

test("Bli fadder i menyn är en linjeknapp markerad som aktuell sida", async ({ page }) => {
  await page.goto(sida);
  const knapp = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Bli fadder" });
  await expect(knapp).toHaveAttribute("aria-current", "page");
  expect(await knapp.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(farg("gold"));
});

test("guldfältet visar bara det som behövs för att bli fadder: rubriken, ingressen och vad som händer sen", async ({
  page,
}) => {
  await page.goto(sida);
  const s = guldfaltet(page);
  await expect(s.getByRole("heading", { level: 1, name: "Bli fadder och håll ljusen tända." })).toBeVisible();
  await expect(s.getByText("Som fadder stöttar du alla 20 fadderbarnen och deras familjer tillsammans.")).toBeVisible();
  await expect(s.getByText("Sedan hör någon i föreningen av sig och berättar mer om oss.")).toBeVisible();
  await expect(s.getByText("Vill du hellre följa ett av barnen?")).toHaveCount(0);
  // The proof (how the children are chosen, where the money goes) has its place further down the page.
  await expect(s.getByRole("heading", { name: "Så går det till" })).toHaveCount(0);
  await expect(s.getByText("lokala myndigheterna")).toHaveCount(0);
  await expect(s.getByText("Frågor?")).toHaveCount(0);
});

test("Repejos checkout har fadderkortkoden och ingen reservlänk under sig", async ({ page }) => {
  await stubRepejo(page);
  await page.goto(sida);
  const s = guldfaltet(page);
  await expect(s.getByText("Repejos checkout (stubb)")).toBeVisible();
  await expect(s.locator("repejo-checkout")).toHaveAttribute("short_code", FADDER_KORTKOD);
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

test("på dator står formuläret bredvid texten, på mobil direkt efter ingressen och före vad som händer sen", LAYOUT, async ({
  page,
  isMobile,
}) => {
  await stubRepejo(page);
  await page.goto(sida);
  const s = guldfaltet(page);
  const ingress = (await s.getByText("Som fadder stöttar du alla 20 fadderbarnen och deras familjer tillsammans.").boundingBox())!;
  const formular = (await s.locator("repejo-checkout").boundingBox())!;
  const sen = (await s.getByText("Sedan hör någon i föreningen av sig").boundingBox())!;
  if (isMobile) {
    expect(formular.y).toBeGreaterThan(ingress.y + ingress.height);
    expect(formular.y + formular.height).toBeLessThanOrEqual(sen.y);
  } else {
    expect(formular.x).toBeGreaterThan(ingress.x + ingress.width);
    expect(formular.x).toBeGreaterThan(sen.x + sen.width);
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

test("länken i Så når det fram leder till Om Streetlight", async ({ page }) => {
  await page.goto(sida);
  await page.locator("#nar-fram").getByRole("link", { name: "Läs om Streetlight" }).click();
  await expect(page).toHaveURL(/\/om-foreningen\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Om Streetlight.");
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

  test("visar raderna Swisha en gåva och Följ och berätta", async ({ page }) => {
    await stubRepejo(page);
    await page.goto(sida);
    const s = fler(page);
    await expect(s.getByRole("heading", { level: 2, name: "Fler sätt att stödja oss." })).toBeVisible();
    const rader = s.getByRole("listitem");
    await expect(rader).toHaveCount(2);
    await expect(rader.nth(0).getByRole("heading", { level: 3 })).toHaveText("Swisha en gåva");
    await expect(rader.nth(0)).toContainText("Vill du hellre ge en gång? Swisha en gåva till föreningen.");
    // The Swish number itself is not shown here: the visitor swishes through Repejo's checkout.
    await expect(rader.nth(0).getByText("TEST-SWISH", { exact: true })).toHaveCount(0);
    await expect(rader.nth(1).getByRole("heading", { level: 3 })).toHaveText("Följ och berätta");
    await expectNoA11yViolations(page);
  });
});

test("Swisha en gåva har Repejos Swish-checkout bredvid texten på dator och efter texten på mobil", LAYOUT, async ({
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
  const formular = (await checkout.boundingBox())!;
  if (isMobile) {
    expect(formular.y).toBeGreaterThan(text.y + text.height);
  } else {
    expect(formular.x).toBeGreaterThan(text.x + text.width);
  }
});

test.describe("på mobil", LAYOUT, () => {
  test.skip(({ isMobile }) => !isMobile, "gäller telefonbredd");

  test("Swish-formuläret går i radens hela bredd, ut under markören", async ({ page }) => {
    await stubRepejo(page);
    await page.goto(sida);
    const rad = fler(page).getByRole("listitem").filter({ hasText: "Swisha en gåva" });
    const radRuta = (await rad.boundingBox())!;
    const formular = (await rad.locator("repejo-checkout").boundingBox())!;
    expect(Math.round(formular.x)).toBe(Math.round(radRuta.x));
    expect(Math.round(formular.width)).toBe(Math.round(radRuta.width));
  });

  test("Ledgerns text börjar högst 44 px in från linjen", async ({ page }) => {
    await page.goto(sida);
    const rad = page.locator("#vart").getByRole("listitem").first();
    const radRuta = (await rad.boundingBox())!;
    const rubrik = (await rad.getByRole("heading", { level: 3 }).boundingBox())!;
    expect(rubrik.x - radRuta.x).toBeLessThanOrEqual(44);
  });
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

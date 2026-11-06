import { expect, test } from "@playwright/test";

import { JULKAMPANJ_KORTKOD, kampanjsida } from "../../src/lib/repejo";
import { blockRepejo, expectNoA11yViolations, funktionPa, stubRepejo } from "./helpers";

test.skip(!funktionPa("julklapp"), "julklapp är avstängd i funktioner.json");

const sida = "julklapp";
const reservlank = kampanjsida(JULKAMPANJ_KORTKOD);

test.beforeEach(async ({ page }) => {
  await stubRepejo(page);
});

test("julkampanjen har titel, en h1 med kampanjrubriken och klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto(sida);
  await expect(page).toHaveTitle("Ge en julklapp | Streetlight");
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ge en julklapp som sprider hopp");
  await expectNoA11yViolations(page);
});

test("delas med en egen titel och beskrivning", async ({ page }) => {
  await page.goto(sida);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Ge en julklapp | Streetlight");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /julklapp.*Addis Abeba/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /julaftonsmorgonen/);
});

test("staplas utan sidledsskroll", async ({ page }) => {
  await page.goto(sida);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("hopplänken leder till innehållet", async ({ page }) => {
  await page.goto(sida);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Hoppa till innehållet" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("knappen Ge en julklapp i första vyn leder till Repejos checkout", async ({ page }) => {
  await page.goto(sida);
  const knapp = page.getByRole("banner").getByRole("link", { name: "Ge en julklapp" });
  await expect(knapp).toBeInViewport();
  const box = (await knapp.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  await knapp.click();
  await expect(page).toHaveURL(/#ge$/);
  const ge = page.locator("#ge");
  await expect(ge.getByRole("heading", { level: 2, name: "Ge en julklapp" })).toBeInViewport();
  await expect(ge.getByText("Repejos checkout (stubb)")).toBeVisible();
  await expect(ge.getByText("Repejo sköter betalningen", { exact: false })).toBeVisible();
});

test("länken till Repejos kampanjsida syns under checkouten även när Repejo har laddats", async ({ page }) => {
  // Repejo can define its elements and still fail later, so the way out is always there.
  await page.goto(sida);
  const ge = page.locator("#ge");
  await expect(ge.getByText("Repejos checkout (stubb)")).toBeVisible();
  const lank = ge.getByRole("link", { name: "Ge via Repejos kampanjsida" });
  await expect(lank).toBeVisible();
  await expect(lank).toHaveAttribute("href", reservlank);
  await expect(ge).toContainText("Fungerar inte betalningen?");
});

test("insamlingsmätaren finns i avsnittet om insamlingsmålet", async ({ page }) => {
  await page.goto(sida);
  const mal = page.getByRole("region", { name: "Håll ljusen tända i jul" });
  await expect(mal.getByText("20 barn, 20 ljus.")).toBeVisible();
  await expect(mal.getByTestId("ljusbandet").getByTestId("ljus")).toHaveCount(20);
  await expect(mal.getByText("Repejos insamlingsmätare (stubb)")).toBeVisible();
});

test.describe("utan Repejo", () => {
  test.beforeEach(async ({ page }) => {
    await page.unrouteAll();
    await blockRepejo(page);
  });

  test("syns en länk till Repejos kampanjsida där checkouten och mätaren sitter", async ({ page }) => {
    await page.goto(sida);
    for (const del of [page.locator("#ge"), page.getByRole("region", { name: "Håll ljusen tända i jul" })]) {
      const lank = del.getByRole("link", { name: /Repejos kampanjsida/ });
      await expect(lank).toHaveAttribute("href", reservlank);
      await expect(lank).toBeVisible();
    }
    await expectNoA11yViolations(page);
  });

  test("har checkouten och mätaren sin plats reserverad, så att sidan inte hoppar när Repejo ritar dem", async ({
    page,
  }) => {
    await page.goto(sida);
    expect((await page.locator("repejo-checkout").boundingBox())!.height).toBeGreaterThanOrEqual(400);
    expect((await page.locator("repejo-progress-bar").boundingBox())!.height).toBeGreaterThanOrEqual(40);
  });
});

test("julkortsexemplet i första vyn är märkt Exempel", async ({ page }) => {
  await page.goto(sida);
  const kort = page.getByRole("figure", { name: /Exempel på ett julkort/ });
  await expect(kort).toBeInViewport({ ratio: 0.3 });
  await expect(kort.getByText("Exempel", { exact: true })).toBeVisible();
  await expect(kort).toContainText("Du skriver din egen hälsning.");
});

test("Så går det till visar de tre stegen i ordning", async ({ page }) => {
  await page.goto(sida);
  await page.getByRole("banner").getByRole("link", { name: "Så går det till" }).click();
  await expect(page).toHaveURL(/#sa-gar-det-till$/);
  const steg = page.locator("#sa-gar-det-till");
  await expect(steg.getByRole("heading", { level: 2 })).toBeInViewport();
  await expect(steg.getByRole("listitem").getByRole("heading", { level: 3 })).toHaveText([
    "Välj ett belopp",
    "Skriv ett julkort",
    "Vi skickar det på julaftonsmorgonen",
  ]);
});

test("Vart julklappen går har en plats för ett foto med samtycke och leder vidare till Bli fadder", async ({ page }) => {
  await page.goto(sida);
  const vart = page.getByRole("region", { name: "Vart julklappen går" });
  await expect(vart.getByText("Foto från föreningen, med familjens samtycke")).toBeVisible();
  await expect(vart.getByText("20 fadderbarns skolgång", { exact: false })).toBeVisible();
  await expect(vart.getByRole("link", { name: "Läs om att bli fadder" })).toHaveAttribute("href", /\/#bli-fadder$/);
});

test("avslutas med en uppmaning som leder till checkouten", async ({ page }) => {
  await page.goto(sida);
  const slut = page.getByRole("region", { name: /En julklapp till barnen/ });
  await expect(slut.getByRole("link", { name: "Ge en julklapp" })).toHaveAttribute("href", "#ge");
});

test.describe("kampanjuppgifter med tom testfil", () => {
  // A build of the site made from tests/fixtures/*-tom.json (see playwright.config.ts), so these tests do not
  // break when the association fills in src/data/julkampanj.json.
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("sista dagen, vad julklappen gör och e-posten visas som ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await expect(page.getByRole("banner").getByText("datum fylls i", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Vart julklappen går" }).getByText("fylls i av föreningen", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("#ge").getByText("e-post fylls i", { exact: true })).toBeVisible();
  });

  test("texterna följer ordlistan och hittar inte på några siffror", async ({ page }) => {
    await page.goto(sida);
    const text = (await page.getByRole("banner").innerText()) + (await page.getByRole("main").innerText());
    expect(new Set(text.match(/\d+/g))).toEqual(new Set(["20"]));
    expect(text).toContain("fadder");
    expect(text).not.toMatch(/blogg|sponsor|givare|donator|mottagare/i);
  });

  test("brödtexten är minst 18 px", async ({ page }) => {
    await page.goto(sida);
    const sizes = await page
      .locator("main p, main li, header p")
      .evaluateAll((els) =>
        els.map((el) => ({ text: el.textContent!.trim().slice(0, 40), px: parseFloat(getComputedStyle(el).fontSize) })),
      );
    expect(sizes.length).toBeGreaterThan(8);
    expect(sizes.filter((s) => s.px < 18)).toEqual([]);
  });
});

test.describe("kampanjuppgifter med ifylld testfil", () => {
  // A second build of the site, made from tests/fixtures/julkampanj-ifylld.json (see playwright.config.ts).
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("visar värdena från datafilen i stället för ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await expect(page.getByRole("banner")).toContainText("TEST-SISTA-DAG");
    await expect(page.getByRole("region", { name: "Vart julklappen går" })).toContainText("TEST-VAD-JULKLAPPEN-GOR");
    await expect(page.locator("#ge").getByRole("link", { name: "julklapp@example.org" })).toHaveAttribute(
      "href",
      "mailto:julklapp@example.org",
    );
    await expect(page.getByRole("main").getByText(/fylls i/)).toHaveCount(0);
    await expect(page.getByRole("banner").getByText(/fylls i/)).toHaveCount(0);
    await expectNoA11yViolations(page);
  });
});

test.describe("med reducerad rörelse", () => {
  test.use({ reducedMotion: "reduce" });

  test("är alla 20 ljus tända direkt", async ({ page }) => {
    await page.goto(sida);
    const ljus = page.getByTestId("ljusbandet").getByTestId("ljus");
    expect(await ljus.evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))).toEqual(
      Array(20).fill("rgb(244, 180, 0)"),
    );
  });
});

test("på kampanjsidan är Ge en julklapp den enda guldknappen i första vyn, och Bli fadder i menyn en linjeknapp", async ({
  page,
}) => {
  await page.goto(sida);
  const guld = "rgb(244, 180, 0)";
  const bakgrund = (el: Element) => getComputedStyle(el).backgroundColor;
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  await expect(nav.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/#bli-fadder$/);
  expect(await nav.getByRole("link", { name: "Bli fadder" }).evaluate(bakgrund)).not.toBe(guld);
  expect(await page.getByRole("banner").getByRole("link", { name: "Ge en julklapp" }).evaluate(bakgrund)).toBe(guld);
});

test("menyn markerar Julklapp som aktuell sida, även när kampanjen inte visas på startsidan", async ({ page, isMobile }) => {
  await page.goto(`${process.env.E2E_TOM_URL}${sida}`);
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  await expect(nav.getByRole("link", { name: "Julklapp", exact: true })).toHaveAttribute("aria-current", "page");
});

test.describe("julkampanjen på startsidan", () => {
  test.describe("när föreningen har slagit på den", () => {
    test.use({ baseURL: process.env.E2E_IFYLLD_URL });

    test("står direkt under ljusbandet och leder till kampanjsidan utan att konkurrera med Bli fadder", async ({
      page,
    }) => {
      await page.goto("./");
      const jul = page.getByRole("region", { name: "Håll ljusen tända i jul" });
      await expect(jul).toBeVisible();
      // First in the content, right under the light band in the header.
      expect(await page.locator("main > section").first().getAttribute("id")).toBe("julklapp");
      const lank = jul.getByRole("link", { name: "Ge en julklapp" });
      await expect(lank).toHaveAttribute("href", /\/julklapp$/);
      expect((await lank.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(jul).toContainText("TEST-SISTA-DAG");
      // The Ett ljus rule: "Bli fadder" stays the only gold button, the campaign gets a line button.
      expect(await lank.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
      await expect(page.getByRole("banner").getByRole("link", { name: "Bli fadder" }).last()).toHaveCSS(
        "background-color",
        "rgb(244, 180, 0)",
      );
      await expectNoA11yViolations(page);
    });

    test("adventsljusstaken har lika många tända ljus som det har varit adventssöndagar", async ({ page }) => {
      const brinner = () =>
        page
          .locator("[data-adventsljus] .ljus")
          .evaluateAll((els) => els.map((el) => !el.classList.contains("slackt")));
      // 2026: första advent är 29 november, fjärde advent 20 december.
      await page.clock.install({ time: new Date(2026, 11, 7, 12) });
      await page.goto("./");
      expect(await brinner()).toEqual([true, true, false, false]);
      await expect(page.locator("[data-advent]")).toHaveText("Andra advent, två ljus är tända.");
      // A julklapp keeps the lights on: pointing at the button lights the rest.
      await page.locator("#julklapp").getByRole("link", { name: "Ge en julklapp" }).hover();
      await expect(page.locator("[data-adventsljus] .ljus.slackt .laga").first()).toHaveCSS("opacity", "1");
    });

    test("före första advent brinner inget ljus och ingen etikett visas", async ({ page }) => {
      await page.clock.install({ time: new Date(2026, 10, 4, 12) });
      await page.goto("./");
      await expect(page.locator("[data-adventsljus] .ljus")).toHaveCount(4);
      await expect(page.locator("[data-adventsljus] .slackt")).toHaveCount(4);
      await expect(page.locator("[data-advent]")).toBeHidden();
      // A julklapp keeps the lights on: pointing at the button still lights them.
      await page.locator("#julklapp").getByRole("link", { name: "Ge en julklapp" }).hover();
      await expect(page.locator("[data-adventsljus] .ljus.slackt .laga").first()).toHaveCSS("opacity", "1");
    });

    test("på julafton brinner alla fyra ljusen", async ({ page }) => {
      await page.clock.install({ time: new Date(2026, 11, 24, 9) });
      await page.goto("./");
      await expect(page.locator("[data-adventsljus] .slackt")).toHaveCount(0);
    });

    test("räknar ner dagarna till julafton, när julkortet kommer fram", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const nedrakning = page.locator("[data-nedrakning]");
      for (const [dag, siffra, text] of [
        [new Date(2026, 10, 4, 12), "50", "50 dagar kvar till julafton."],
        [new Date(2026, 11, 23, 12), "1", "1 dag kvar till julafton."],
      ] as const) {
        await page.clock.install({ time: dag });
        await page.goto("./");
        await expect(nedrakning).toBeVisible();
        await expect(nedrakning.locator("[data-siffra]")).toHaveText(siffra);
        await expect(nedrakning.locator("[data-nedrakning-text]")).toHaveText(text);
      }
    });

    test("på julafton står det God jul, och efter julafton syns ingen nedräkning", async ({ browser }) => {
      for (const [dag, visas] of [
        [new Date(2026, 11, 24, 9), true],
        [new Date(2026, 11, 26, 9), false],
      ] as const) {
        const page = await browser.newPage({ baseURL: process.env.E2E_IFYLLD_URL, reducedMotion: "reduce" });
        await page.clock.install({ time: dag });
        await page.goto("./");
        if (visas) {
          await expect(page.locator("[data-siffra]")).toHaveText("God jul!");
          await expect(page.locator("[data-advent]")).toBeHidden();
        } else {
          await expect(page.locator("[data-nedrakning]")).toBeHidden();
        }
        await page.close();
      }
    });

    test("en sida som står öppen går vidare till nästa dag vid midnatt", async ({ page }) => {
      await page.clock.install({ time: new Date(2026, 10, 28, 23, 59) });
      await page.goto("./");
      await page.locator("#julklapp").scrollIntoViewIfNeeded();
      await page.clock.runFor(8000);
      await expect(page.locator("[data-nedrakning-text]")).toHaveText("26 dagar kvar till julafton.");
      await expect(page.locator("[data-adventsljus] .slackt")).toHaveCount(4);
      // Midnight: första advent, so the first candle is lit and three stay dark.
      await page.clock.runFor(70_000);
      await expect(page.locator("[data-nedrakning-text]")).toHaveText("25 dagar kvar till julafton.");
      await expect(page.locator("[data-advent]")).toHaveText("Första advent, ett ljus är tänt.");
      await expect(page.locator("[data-adventsljus] .slackt .laga")).toHaveCount(3);
      for (const laga of await page.locator("[data-adventsljus] .slackt .laga").all()) {
        await expect(laga).toHaveCSS("opacity", "0");
      }
    });

    test("utanför november och december syns ingen nedräkning", async ({ page }) => {
      await page.clock.install({ time: new Date(2027, 0, 10, 12) });
      await page.goto("./");
      await expect(page.locator("[data-nedrakning]")).toBeHidden();
      await expect(page.locator("[data-adventsljus] .slackt")).toHaveCount(4);
    });

    test("ett långt ”sista dag” bryts under knappen och trycker inte ihop texten", async ({ page, isMobile }) => {
      await page.goto("./");
      const jul = page.locator("#julklapp");
      const ingress = (await jul.locator(".ingress").boundingBox())!;
      const handling = (await jul.locator(".handling").boundingBox())!;
      expect(ingress.width).toBeGreaterThan(isMobile ? 280 : 400);
      // Side by side on wide screens, under each other on narrow: never on top of each other.
      if (!isMobile) expect(handling.x).toBeGreaterThanOrEqual(ingress.x + ingress.width);
      else expect(handling.y).toBeGreaterThanOrEqual(ingress.y + ingress.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });

    test("har en länk i menyn", async ({ page, isMobile }) => {
      await page.goto("./");
      const nav = page.getByRole("navigation", { name: "Huvudmeny" });
      if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
      await expect(nav.getByRole("link", { name: "Julklapp", exact: true })).toHaveAttribute("href", /\/julklapp$/);
    });

    test("menyn ryms på en rad vid 901 px", async ({ page, isMobile }) => {
      test.skip(isMobile, "på smal skärm är menyn ihopfälld");
      await page.setViewportSize({ width: 901, height: 800 });
      await page.goto("./");
      const nav = page.getByRole("navigation", { name: "Huvudmeny" });
      const hojd = (await nav.getByRole("link", { name: "Julklapp", exact: true }).boundingBox())!.height;
      expect(hojd).toBeLessThan(40);
      const logga = (await nav.getByRole("link").first().boundingBox())!;
      const knapp = (await nav.getByRole("link", { name: "Bli fadder" }).boundingBox())!;
      expect(Math.abs(logga.y + logga.height / 2 - (knapp.y + knapp.height / 2))).toBeLessThan(8);
    });
  });

  test.describe("när föreningen har slagit av den", () => {
    test.use({ baseURL: process.env.E2E_TOM_URL });

    test("syns varken avsnittet eller länken i menyn", async ({ page }) => {
      await page.goto("./");
      await expect(page.locator("#julklapp")).toHaveCount(0);
      await expect(page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Julklapp" })).toHaveCount(0);
    });
  });
});

import { expect, test } from "@playwright/test";

import { blockRepejo, expectNoA11yViolations, farg, funktionPa, LAYOUT, stubRepejo } from "./helpers";

test.skip(!funktionPa("julklapp"), "julklapp är avstängd i funktioner.json");

const sida = "julklapp";

test.beforeEach(async ({ page }) => {
  await stubRepejo(page);
});

// The rules every page keeps (h1, WCAG, skip link, 18 px, no sideways scroll, the glossary) are in hela-sajten.spec.ts.

test("julkampanjen har titeln och kampanjrubriken", async ({ page }) => {
  await page.goto(sida);
  await expect(page).toHaveTitle("Ge ett julpaket | Streetlight");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ge ett julpaket som sprider hopp");
});

test("delas med en egen titel och beskrivning", async ({ page }) => {
  await page.goto(sida);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Ge ett julpaket | Streetlight");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /julpaket.*Addis Abeba/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /julaftonsmorgonen/);
});

test("knappen Ge ett julpaket i första vyn leder till Repejos checkout", LAYOUT, async ({ page }) => {
  await page.goto(sida);
  const knapp = page.getByRole("banner").locator('a[href="#ge"]');
  await expect(knapp).toBeInViewport();
  const box = (await knapp.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  await knapp.click();
  await expect(page).toHaveURL(/#ge$/);
  const ge = page.locator("#ge");
  await expect(ge.getByRole("heading", { level: 2, name: "Ge ett julpaket" })).toBeInViewport();
  await expect(ge.getByText("Repejos checkout (stubb)")).toBeVisible();
});

test("sidhuvudet har knappen Så går det till, som leder till de tre stegen och inte är guld", LAYOUT, async ({ page }) => {
  await page.goto(sida);
  const lank = page.getByRole("banner").getByRole("link", { name: "Så går det till" });
  await expect(lank).toHaveAttribute("href", "#sa-gar-det-till");
  expect((await lank.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await lank.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(farg("gold"));
  await lank.click();
  await expect(page.getByRole("heading", { level: 2, name: "Tre steg till ett julkort som betyder något" })).toBeInViewport();
});

test("under checkouten finns ingen reservlänk", async ({ page }) => {
  await page.goto(sida);
  const ge = page.locator("#ge");
  await expect(ge.getByText("Repejos checkout (stubb)")).toBeVisible();
  await expect(ge.getByText("Fungerar inte betalningen?")).toHaveCount(0);
});

test("insamlingsmålet står under ljusbandet med priset, och raden om de 20 ljusen är borta", async ({ page }) => {
  await page.goto(sida);
  await expect(page.getByTestId("ljusbandet").getByTestId("ljus")).toHaveCount(20);
  const mal = page.getByRole("region", { name: "20 barn, 20 julpaket" });
  await expect(mal.getByText("Repejos insamlingsmätare (stubb)")).toBeVisible();
  await expect(mal.getByText("Ett julpaket kostar 400 kr. 20 julpaket blir 8 000 kr.")).toBeVisible();
  await expect(page.getByText("20 barn, 20 ljus.")).toHaveCount(0);
});

test.describe("utan Repejo", LAYOUT, () => {
  test.beforeEach(async ({ page }) => {
    await page.unrouteAll();
    await blockRepejo(page);
  });

  test("har checkouten och mätaren sin plats reserverad, så att sidan inte hoppar när Repejo ritar dem", async ({
    page,
  }) => {
    await page.goto(sida);
    expect((await page.locator("repejo-checkout").boundingBox())!.height).toBeGreaterThanOrEqual(400);
    expect((await page.locator("repejo-progress-bar").boundingBox())!.height).toBeGreaterThanOrEqual(40);
  });
});

test("exempelkortet i första vyn är en text med bildtext som säger att det är ett exempel", LAYOUT, async ({ page }) => {
  await page.goto(sida);
  const kort = page.getByRole("banner").getByRole("figure");
  await expect(kort.getByText("God jul, Maja!")).toBeInViewport();
  await expect(kort.getByText("Kram, Anna")).toBeVisible();
  await expect(kort.getByText("Exempel på ett julkort. Du skriver din egen hälsning.")).toBeVisible();
});

test("Så går det till visar de tre stegen i ordning", async ({ page }) => {
  await page.goto(sida);
  const steg = page.locator("#sa-gar-det-till");
  await expect(steg.getByRole("heading", { level: 2, name: "Tre steg till ett julkort som betyder något" })).toBeVisible();
  await expect(steg.getByRole("listitem").getByRole("heading", { level: 3 })).toHaveText([
    "Välj ett belopp",
    "Skriv ett julkort",
    "Vi skickar det på julaftonsmorgonen",
  ]);
});

test("Ge ett julpaket har checkouten, priset för fler kort och Repejos roll", async ({ page }) => {
  await page.goto(sida);
  const ge = page.locator("#ge");
  await expect(ge.getByText("Välj ett belopp, skriv ditt julkort och betala.")).toBeVisible();
  await expect(ge.getByText("2 000 kr ger fem barn och familjer jul.")).toBeVisible();
  await expect(ge.getByText("Har du fler att glädja?")).toBeVisible();
  await expect(ge.getByText("Repejo sköter betalningen.")).toBeVisible();
});

test("Vart julpaketen går visar vad som finns i paketet, ett foto med bildtext och leder vidare till Bli fadder", async ({
  page,
}) => {
  await page.goto(sida);
  const vart = page.getByRole("region", { name: "Vart julpaketen går" });
  await expect(vart.getByRole("heading", { level: 3, name: "Det här finns i julpaketet" })).toBeVisible();
  await expect(vart.getByText("en julklapp till barnet och en kontantgåva till familjen", { exact: false })).toBeVisible();
  await expect(vart.getByRole("img", { name: /Barn och ungdomar i en grönskande trädgård/ })).toBeVisible();
  await expect(vart.getByText("Foto från föreningen, med familjens samtycke.")).toBeVisible();
  await expect(vart.getByText("20 fadderbarns skolgång", { exact: false })).toBeVisible();
  await expect(vart.getByRole("link", { name: "Läs om att bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
});

test.describe("kampanjuppgifter med tom testfil", () => {
  // A build of the site made from tests/fixtures/*-tom.json (see playwright.config.ts), so these tests do not
  // break when the association fills in src/data/julkampanj.json.
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("sista dagen, vad pengarna går till efteråt och e-posten visas som ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await expect(page.locator("#ge").getByText("sista dag fylls i", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Vart julpaketen går" }).getByText("fylls i av föreningen", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("#ge").getByText("e-post fylls i", { exact: true })).toBeVisible();
  });

  test("utan givare visas ingen matchning", async ({ page }) => {
    await page.goto(sida);
    await expect(page.getByText("dubblar")).toHaveCount(0);
  });

  test("texterna talar om fadder och hittar inte på några andra siffror än de från föreningen", async ({ page }) => {
    await page.goto(sida);
    const text = (await page.getByRole("banner").innerText()) + (await page.getByRole("main").innerText());
    // 20 barn, 400 kr, 8 000 kr, 2 000 kr: "2", "8" and "000" are the thousands.
    expect(new Set(text.match(/\d+/g))).toEqual(new Set(["20", "400", "8", "2", "000"]));
    expect(text).toContain("fadder");
  });
});

test.describe("kampanjuppgifter med ifylld testfil", () => {
  // A second build of the site, made from tests/fixtures/julkampanj-ifylld.json (see playwright.config.ts).
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("visar värdena från datafilen i stället för ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await expect(page.getByRole("region", { name: "Vart julpaketen går" })).toContainText("TEST-EFTER-JULPAKETEN");
    const ge = page.locator("#ge");
    await expect(ge).toContainText("Beställ senast TEST-SISTA-DAG");
    await expect(ge).toContainText(
      "Till och med TEST-MATCHNING-TILL dubblar TEST-GIVARE varje gåva, upp till totalt TEST-BELOPP kr.",
    );
    await expect(ge.getByRole("link", { name: "julklapp@example.org" })).toHaveAttribute("href", "mailto:julklapp@example.org");
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
      Array(20).fill(farg("gold")),
    );
  });
});

test("på kampanjsidan är Ge ett julpaket den enda guldknappen i första vyn, och Bli fadder i menyn en linjeknapp", async ({
  page,
}) => {
  await page.goto(sida);
  const guld = farg("gold");
  const bakgrund = (el: Element) => getComputedStyle(el).backgroundColor;
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  await expect(nav.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
  expect(await nav.getByRole("link", { name: "Bli fadder" }).evaluate(bakgrund)).not.toBe(guld);
  expect(await page.getByRole("banner").locator('a[href="#ge"]').evaluate(bakgrund)).toBe(guld);
});

test("menyn markerar Julpaket som aktuell sida, även när kampanjen inte visas på startsidan", LAYOUT, async ({ page, isMobile }) => {
  await page.goto(`${process.env.E2E_TOM_URL}${sida}`);
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  await expect(nav.getByRole("link", { name: "Ge ett julpaket", exact: true })).toHaveAttribute("aria-current", "page");
});

test("i menyn står Om Streetlight precis till vänster om Ge ett julpaket", async ({ page }) => {
  await page.goto(sida);
  const lankar = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("listitem").getByRole("link");
  const namn = await lankar.allTextContents();
  const jul = namn.findIndex((n) => n.trim() === "Ge ett julpaket");
  expect(jul).toBeGreaterThan(0);
  expect(namn[jul - 1].trim()).toBe("Om Streetlight");
});

test.describe("julkampanjen på startsidan", () => {
  test.describe("när föreningen har slagit på den", () => {
    test.use({ baseURL: process.env.E2E_IFYLLD_URL });

    test("står direkt under ljusbandet och leder till kampanjsidan utan att konkurrera med Bli fadder", LAYOUT, async ({
      page,
    }) => {
      await page.goto("./");
      const jul = page.getByRole("region", { name: "Håll ljusen tända i jul" });
      await expect(jul).toBeVisible();
      // First in the content, right under the light band in the header.
      expect(await page.locator("main > section").first().getAttribute("id")).toBe("julklapp");
      const lank = jul.getByRole("link", { name: "Ge ett julpaket" });
      await expect(lank).toHaveAttribute("href", /\/julklapp$/);
      expect((await lank.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(jul).toContainText("TEST-SISTA-DAG");
      // The Ett ljus rule: "Bli fadder" stays the only gold button, the campaign gets a line button.
      expect(await lank.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
      await expect(page.getByRole("banner").getByRole("link", { name: "Bli fadder" }).last()).toHaveCSS(
        "background-color",
        farg("gold"),
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
      // A julpaket keeps the lights on: pointing at the button lights the rest.
      await page.locator("#julklapp").getByRole("link", { name: "Ge ett julpaket" }).hover();
      await expect(page.locator("[data-adventsljus] .ljus.slackt .laga").first()).toHaveCSS("opacity", "1");
    });

    test("före första advent brinner inget ljus och ingen etikett visas", async ({ page }) => {
      await page.clock.install({ time: new Date(2026, 10, 4, 12) });
      await page.goto("./");
      await expect(page.locator("[data-adventsljus] .ljus")).toHaveCount(4);
      await expect(page.locator("[data-adventsljus] .slackt")).toHaveCount(4);
      await expect(page.locator("[data-advent]")).toBeHidden();
      // A julpaket keeps the lights on: pointing at the button still lights them.
      await page.locator("#julklapp").getByRole("link", { name: "Ge ett julpaket" }).hover();
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

    test("ett långt ”sista dag” bryts under knappen och trycker inte ihop texten", LAYOUT, async ({ page, isMobile }) => {
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

    test("har en länk i menyn", LAYOUT, async ({ page, isMobile }) => {
      await page.goto("./");
      const nav = page.getByRole("navigation", { name: "Huvudmeny" });
      if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
      await expect(nav.getByRole("link", { name: "Ge ett julpaket", exact: true })).toHaveAttribute("href", /\/julklapp$/);
    });

    test("menyn ryms på en rad vid 901 px", async ({ page, isMobile }) => {
      test.skip(isMobile, "på smal skärm är menyn ihopfälld");
      await page.setViewportSize({ width: 901, height: 800 });
      await page.goto("./");
      const nav = page.getByRole("navigation", { name: "Huvudmeny" });
      const hojd = (await nav.getByRole("link", { name: "Ge ett julpaket", exact: true }).boundingBox())!.height;
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
      await expect(page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Ge ett julpaket" })).toHaveCount(0);
    });
  });
});

test.describe("tacksidan", () => {
  const tack = "julklapp/tack";

  test("tackar, säger när kortet kommer och har Bli fadder som enda guldknapp", async ({ page }) => {
    await page.goto(tack);
    await expect(page).toHaveTitle("Tack för att du ger ett julpaket | Streetlight");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tack för att du ger ett julpaket!");
    await expect(page.getByText("Ditt julkort skickas på julaftonsmorgonen", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Vill du stötta barnen hela året?" })).toBeVisible();
    await expect(page.getByText("Som fadder stöttar du alla 20 barnen varje månad.")).toBeVisible();
    const knapp = page.getByRole("main").getByRole("link", { name: "Bli fadder" });
    await expect(knapp).toHaveAttribute("href", /\/bli-fadder$/);
    expect(await knapp.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(farg("gold"));
  });

  test("hålls utanför sökresultaten och laddar inte Repejo", async ({ page }) => {
    await page.goto(tack);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator("script[src*='checkout.js']")).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";

import { JULPAKET_KORTKOD, SWISH_KORTKOD } from "../../src/lib/repejo";
import { blockRepejo, expectNoA11yViolations, farg, LAYOUT, stubRepejo } from "./helpers";

// Ge ett julpaket follows the dates in the data file, in the browser (src/components/Julvaxel.astro). The tests use the
// build made from tests/fixtures/julpaket-ifylld.json (start 2026-11-29, end 2026-12-24) and set the day with the
// clock, so they do not depend on the day they run. Unless a test says otherwise, it is a day in the middle of it.
test.use({ baseURL: process.env.E2E_IFYLLD_URL });

const sida = "julpaket";

/** A day in the middle of Ge ett julpaket, the second Advent Sunday's week. */
const MITT_I = new Date(2026, 11, 10, 12);

test.beforeEach(async ({ page }) => {
  await stubRepejo(page);
  await page.clock.setFixedTime(MITT_I);
});

// The rules every page keeps (h1, WCAG, skip link, 18 px, no sideways scroll, the glossary) are in hela-sajten.spec.ts.

test("Ge ett julpaket har titeln och kampanjrubriken", async ({ page }) => {
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

test("under checkouten finns ingen reservlänk", async ({ page }) => {
  await page.goto(sida);
  const ge = page.locator("#ge");
  await expect(ge.getByText("Repejos checkout (stubb)")).toBeVisible();
  await expect(ge.getByText("Fungerar inte betalningen?")).toHaveCount(0);
});

test("insamlingsmålet står i första vyn och raden om de 20 ljusen under Vart julpaketet går", async ({ page }) => {
  await page.goto(sida);
  const mal = page.getByRole("banner").getByRole("region", { name: "Insamlingsmålet" });
  await expect(mal.getByText("Repejos insamlingsmätare (stubb)")).toBeVisible();
  await expect(page.getByTestId("ljusbandet").getByTestId("ljus")).toHaveCount(20);
  const vart = page.getByRole("region", { name: "Vart julpaketet går" });
  await expect(vart.getByText("20 barn, 20 ljus.")).toBeVisible();
  await expect(page.getByText("20 barn, 20 ljus.")).toHaveCount(1);
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

test("julkortet i första vyn visas", LAYOUT, async ({ page }) => {
  await page.goto(sida);
  await expect(page.getByRole("banner").getByRole("img", { name: /Julkort med texten ”God jul!”/ })).toBeInViewport();
});

test("Ge ett julpaket visar de tre stegen i ordning bredvid checkouten", async ({ page }) => {
  await page.goto(sida);
  // The steps and the checkout are one section, so the first view has one way down to it.
  await expect(page.getByRole("banner").getByRole("link", { name: "Så går det till" })).toHaveCount(0);
  const steg = page.locator("#ge");
  await expect(steg.getByRole("heading", { level: 2, name: "Ge ett julpaket" })).toBeVisible();
  await expect(steg.getByRole("listitem").getByRole("heading", { level: 3 })).toHaveText([
    "Välj ett belopp",
    "Skriv ett digitalt julkort",
    "Vi skickar det på julaftonsmorgonen",
  ]);
});

test("Vart julpaketet går visar ett foto på barnen och leder vidare till Bli fadder", async ({ page }) => {
  await page.goto(sida);
  const vart = page.getByRole("region", { name: "Vart julpaketet går" });
  await expect(vart.getByRole("img", { name: /Barn och ungdomar i en grönskande trädgård/ })).toBeVisible();
  await expect(vart.getByText("20 fadderbarn med skolgång", { exact: false })).toBeVisible();
  await expect(vart.getByRole("link", { name: "Läs om att bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
});

test.describe("kampanjuppgifter med tom testfil", () => {
  // A build of the site made from tests/fixtures/*-tom.json (see playwright.config.ts), so these tests do not
  // break when the association fills in src/data/julpaket.json. Without dates there is no Ge ett julpaket.
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("sista insamlingsdag visas inte när datumen saknas", async ({ page }) => {
    await page.goto(sida);
    await expect(page.locator("#ge")).not.toContainText("Sista insamlingsdag");
    await expect(page.getByRole("main").getByText(/fylls i/)).toHaveCount(0);
  });

  test("texterna talar om fadder och hittar inte på några siffror", async ({ page }) => {
    await page.goto(sida);
    const text = (await page.getByRole("banner").innerText()) + (await page.getByRole("main").innerText());
    expect(new Set(text.match(/\d+/g))).toEqual(new Set(["20"]));
    expect(text).toContain("fadder");
  });
});

test.describe("kampanjuppgifter med ifylld testfil", () => {
  // A second build of the site, made from tests/fixtures/julpaket-ifylld.json (see playwright.config.ts).
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("visar värdena från datafilen i stället för ”fylls i”", async ({ page }) => {
    await page.goto(sida);
    await expect(page.locator("#ge")).toContainText("Sista insamlingsdag är 24 december");
    await expect(page.getByRole("region", { name: "Vart julpaketet går" })).toContainText("TEST-VAD-JULPAKETET-GOR");
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

test("menyn markerar Julpaket som aktuell sida medan Ge ett julpaket pågår", LAYOUT, async ({ page, isMobile }) => {
  await page.goto(sida);
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  await expect(nav.getByRole("link", { name: "Ge ett julpaket", exact: true })).toHaveAttribute("aria-current", "page");
});

test("länken i menyn syns från en vecka före startdatumet till en vecka efter slutdatumet, även på sidan själv", async ({ page }) => {
  // The dates are 2026-11-29 and 2026-12-24.
  for (const [dag, syns] of [
    [new Date(2026, 10, 21, 12), false],
    [new Date(2026, 10, 22, 12), true],
    [new Date(2026, 11, 31, 12), true],
    [new Date(2027, 0, 1, 12), false],
  ] as const) {
    await page.clock.setFixedTime(dag);
    for (const adress of ["", sida]) {
      await page.goto(adress);
      await expect(
        page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Ge ett julpaket", exact: true }),
        `${dag.toDateString()} ${adress}`,
      ).toHaveCount(syns ? 1 : 0);
    }
  }
});

test("i menyn står Om Streetlight precis till vänster om Ge ett julpaket", async ({ page }) => {
  await page.goto(sida);
  const meny = page.getByRole("navigation", { name: "Huvudmeny" });
  // The link is added once the menu has looked at the date, when the page was built on a day outside the dates.
  await expect(meny.getByRole("link", { name: "Ge ett julpaket", exact: true })).toBeVisible();
  const lankar = meny.getByRole("listitem").getByRole("link");
  const namn = await lankar.allTextContents();
  const jul = namn.findIndex((n) => n.trim() === "Ge ett julpaket");
  expect(jul).toBeGreaterThan(0);
  expect(namn[jul - 1].trim()).toBe("Om Streetlight");
});

test.describe("Ge ett julpaket på startsidan", () => {
  test.describe("när föreningen har slagit på den", () => {
    test.use({ baseURL: process.env.E2E_IFYLLD_URL });

    test("står direkt under ljusbandet och leder till kampanjsidan utan att konkurrera med Bli fadder", LAYOUT, async ({
      page,
    }) => {
      await page.goto("./");
      const jul = page.getByRole("region", { name: "Håll ljusen tända i jul" });
      await expect(jul).toBeVisible();
      // First in the content, right under the light band in the header.
      expect(await page.locator("main section").first().getAttribute("id")).toBe("julpaket");
      const lank = jul.getByRole("link", { name: "Ge ett julpaket" });
      await expect(lank).toHaveAttribute("href", /\/julpaket$/);
      expect((await lank.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(jul).toContainText("Sista dagen med kort: 24 december");
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
      await page.locator("#julpaket").getByRole("link", { name: "Ge ett julpaket" }).hover();
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
        [new Date(2026, 10, 29, 12), "25", "25 dagar kvar till julafton."],
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
          // Ge ett julpaket ended on 24 december, so the section is gone altogether.
          await expect(page.locator("#julpaket")).toHaveCount(0);
        }
        await page.close();
      }
    });

    test("en sida som står öppen går vidare till nästa dag vid midnatt", async ({ page }) => {
      await page.clock.install({ time: new Date(2026, 11, 12, 23, 59) });
      await page.goto("./");
      await page.locator("#julpaket").scrollIntoViewIfNeeded();
      await page.clock.runFor(8000);
      await expect(page.locator("[data-nedrakning-text]")).toHaveText("12 dagar kvar till julafton.");
      await expect(page.locator("[data-adventsljus] .slackt")).toHaveCount(2);
      // Midnight: tredje advent, so the third candle is lit and one stays dark.
      await page.clock.runFor(70_000);
      await expect(page.locator("[data-nedrakning-text]")).toHaveText("11 dagar kvar till julafton.");
      await expect(page.locator("[data-advent]")).toHaveText("Tredje advent, tre ljus är tända.");
      await expect(page.locator("[data-adventsljus] .slackt .laga")).toHaveCount(1);
      for (const laga of await page.locator("[data-adventsljus] .slackt .laga").all()) {
        await expect(laga).toHaveCSS("opacity", "0");
      }
    });

    test("en lång text om sista dagen bryts under knappen och trycker inte ihop texten", LAYOUT, async ({ page, isMobile }) => {
      await page.goto("./");
      const jul = page.locator("#julpaket");
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
      await expect(nav.getByRole("link", { name: "Ge ett julpaket", exact: true })).toHaveAttribute("href", /\/julpaket$/);
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
});

// The build is made on one day, but the browser decides by its own date, so every test below sets the day with the
// clock and gets the same result whenever the site was built. The times are written with Stockholm's winter offset
// (+01:00), because the site counts days in Swedish time and the test process may run in another time zone (CI is in UTC,
// where new Date(2026, 11, 24, 23, 55) is already the 25th in Stockholm).
const DAGAR = {
  innan: { dag: new Date("2026-11-28T12:00:00+01:00"), lage: "innan" },
  startdagen: { dag: new Date("2026-11-29T00:05:00+01:00"), lage: "pagar" },
  slutdagen: { dag: new Date("2026-12-24T23:55:00+01:00"), lage: "pagar" },
  efter: { dag: new Date("2026-12-25T00:05:00+01:00"), lage: "avslutad" },
} as const;

test.describe("Ge ett julpaket följer datumen i webbläsaren", () => {
  for (const [namn, { dag, lage }] of Object.entries(DAGAR)) {
    test(`${namn}: sidan, menyn och startsidan visar ${lage === "pagar" ? "Ge ett julpaket" : "Swish"}`, async ({ page }) => {
      await page.clock.setFixedTime(dag);
      await page.goto("");
      const meny = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Ge ett julpaket", exact: true });
      // The link is shown a week before and a week after, so on all four days.
      await expect(meny).toHaveCount(1);
      await expect(page.locator("#julpaket")).toHaveCount(lage === "pagar" ? 1 : 0);
      await page.goto(sida);
      await expect(page.locator("#ge repejo-checkout")).toHaveCount(1);
      await expect(page.locator("repejo-checkout")).toHaveCount(1);
      await expect(page.locator("#ge repejo-checkout")).toHaveAttribute(
        "short_code",
        lage === "pagar" ? JULPAKET_KORTKOD : SWISH_KORTKOD,
      );
      await expect(page.locator("repejo-progress-bar")).toHaveCount(lage === "pagar" ? 1 : 0);
    });
  }

  test("före startdatumet säger sidan när insamlingen startar och att man kan ge via Swish", async ({ page }) => {
    await page.clock.setFixedTime(DAGAR.innan.dag);
    await page.goto(sida);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ge ett julpaket startar snart");
    await expect(page.getByRole("banner")).toContainText("Insamlingen Ge ett julpaket startar 29 november. Tills dess kan du ge en engångsgåva via Swish.");
    await expect(page.locator("#ge").getByRole("heading", { level: 2 })).toHaveText("Ge en gåva via Swish");
    await expectNoA11yViolations(page);
  });

  test("efter slutdatumet säger sidan att insamlingen är avslutad och att man kan ge via Swish", async ({ page }) => {
    await page.clock.setFixedTime(DAGAR.efter.dag);
    await page.goto(sida);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ge ett julpaket är avslutat");
    await expect(page.getByRole("banner")).toContainText("Insamlingen Ge ett julpaket är avslutad. Du kan fortfarande ge en engångsgåva via Swish.");
    const ge = page.locator("#ge");
    await expect(ge.getByRole("heading", { level: 2, name: "Ge en gåva via Swish" })).toBeVisible();
    await expect(ge.getByRole("listitem")).toHaveCount(0);
    await expect(page.getByText("julaftonsmorgonen")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Vart pengarna går" })).toBeVisible();
    await expect(page.getByText("Det här finns i julpaketet")).toHaveCount(0);
    await expectNoA11yViolations(page);
  });

  test("medan insamlingen pågår står sista dagen på sidan", async ({ page }) => {
    await page.goto(sida);
    await expect(page.locator("#ge")).toContainText("Sista insamlingsdag är 24 december.");
  });

  test("sidan har rätt sorts innehåll även utan Repejo", LAYOUT, async ({ page }) => {
    await page.unrouteAll();
    await blockRepejo(page);
    await page.clock.setFixedTime(DAGAR.efter.dag);
    await page.goto(sida);
    expect((await page.locator("repejo-checkout").boundingBox())!.height).toBeGreaterThanOrEqual(360);
  });
});

test.describe("utan datum finns inget Ge ett julpaket", () => {
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("sidan visar Swish, och menylänken och rutan på startsidan saknas hela året", async ({ page }) => {
    await page.clock.setFixedTime(MITT_I);
    await page.goto("");
    await expect(page.locator("#julpaket")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Ge ett julpaket" })).toHaveCount(0);
    await stubRepejo(page);
    await page.goto(sida);
    await expect(page.locator("#ge repejo-checkout")).toHaveAttribute("short_code", SWISH_KORTKOD);
    await expect(page.getByRole("banner")).toContainText("Du kan ge en engångsgåva via Swish.");
  });
});

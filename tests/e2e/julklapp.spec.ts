import { expect, test } from "@playwright/test";

import { JULKAMPANJ_KORTKOD, kampanjsida } from "../../src/lib/repejo";
import { blockRepejo, expectNoA11yViolations, stubRepejo } from "./helpers";

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

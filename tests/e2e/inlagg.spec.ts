import { expect, test } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

// The four Exempelinlägg from the prototype, newest first.
const nyast = "nyheter/skolstart-i-addis-abeba";
const familj = "nyheter/en-verksamhet-som-bar-familjen";
const arsmote = "nyheter/valkommen-till-arsmotet";
const aldst = "nyheter/tack-for-ett-ar-i-skolan";

test("ett exempelinlägg har en h1, chipet Exempel och klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto(nyast);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skolstart i Addis Abeba");
  await expect(page.getByText("Exempel", { exact: true })).toBeVisible();
  await expect(page.getByText("Det här är ett exempelinlägg som visar mallen.")).toBeVisible();
  await expectNoA11yViolations(page);
});

test("inlägget visar ämne, datum och plats", async ({ page }) => {
  await page.goto(familj);
  const header = page.getByRole("banner");
  await expect(header.getByText("Berättelse från en familj")).toBeVisible();
  await expect(header.locator("time")).toHaveAttribute("datetime", "2026-06-02");
  await expect(header.locator("time")).toHaveText("2 jun 2026");
  await expect(header.getByText("Addis Abeba", { exact: true })).toBeVisible();
});

test("ämnets markör har ämnets färg", async ({ page }) => {
  // Red for a report, cobalt for association news, green for a family story, ink for a thank-you.
  for (const [inlagg, farg] of [
    [nyast, "rgb(214, 69, 39)"],
    [arsmote, "rgb(31, 79, 168)"],
    [familj, "rgb(14, 74, 56)"],
    [aldst, "rgb(11, 46, 36)"],
  ]) {
    await page.goto(inlagg);
    const markor = page.getByRole("banner").locator("[data-amne]");
    const karna = await markor.evaluate((el) => getComputedStyle(el, "::after").backgroundColor);
    expect(karna, inlagg).toBe(farg);
  }
});

test("föregående och nästa inlägg följer datumordningen", async ({ page }) => {
  const fler = page.getByRole("navigation", { name: "Fler nyheter" });

  await page.goto(nyast);
  await expect(fler.getByText("Det här är den senaste nyheten")).toBeVisible();
  await expect(fler.getByRole("link")).toHaveCount(1);
  await fler.getByRole("link", { name: /Äldre.*En verksamhet som bär familjen/ }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("En verksamhet som bär familjen");
  await expect(fler.getByRole("link", { name: /Nyare.*Skolstart i Addis Abeba/ })).toBeVisible();
  await fler.getByRole("link", { name: /Äldre.*Välkommen till årsmötet/ }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Välkommen till årsmötet");
  await fler.getByRole("link", { name: /Äldre.*Tack för ett år i skolan/ }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tack för ett år i skolan");
  await expect(fler.getByText("Det här är den äldsta nyheten")).toBeVisible();
  await expect(fler.getByRole("link")).toHaveCount(1);
  await expect(fler.getByRole("link", { name: /Nyare.*Välkommen till årsmötet/ })).toBeVisible();
});

test("alla fyra exempelinlägg är märkta Exempel", async ({ page }) => {
  for (const inlagg of [nyast, familj, arsmote, aldst]) {
    await page.goto(inlagg);
    await expect(page.getByRole("main").getByText("Exempel", { exact: true }), inlagg).toBeVisible();
  }
});

test("inlägget har titel, beskrivning och Open Graph-taggar från inlägget", async ({ page }) => {
  await page.goto(arsmote);
  await expect(page).toHaveTitle("Välkommen till årsmötet | Streetlight");
  const ingress = "Den svenska föreningen håller årsmöte. Här finns tid, plats och dagordning.";
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", ingress);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Välkommen till årsmötet | Streetlight");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", ingress);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /\/nyheter\/valkommen-till-arsmotet\/?$/);
});

test("inlägget leder tillbaka till alla nyheter och till Bli fadder", async ({ page }) => {
  await page.goto(nyast);
  await expect(page.getByRole("link", { name: "Alla nyheter" })).toHaveAttribute("href", /\/nyheter$/);
  await expect(page.getByRole("heading", { level: 2, name: "Hjälp oss hålla ljusen tända." })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
});

test("exempelinläggen har platshållare i stället för foton, och varje bild har alt-text", async ({ page }) => {
  for (const inlagg of [nyast, familj, arsmote, aldst]) {
    await page.goto(inlagg);
    const artikel = page.getByRole("article");
    await expect(artikel.getByText(/^Foto/).first(), inlagg).toBeVisible();
    for (const bild of await artikel.locator("img").all()) {
      await expect(bild).toHaveAttribute("alt", /\S/);
    }
  }
});


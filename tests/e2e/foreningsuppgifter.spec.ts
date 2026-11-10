import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

/** The Insyn row in Så når det fram on the page Bli fadder: a heading followed by a list of föreningsuppgifter. */
function insyn(page: Page) {
  return page.locator("#nar-fram").getByRole("region", { name: "Insyn" });
}

/** The value shown for one föreningsuppgift in the Insyn row, found by its label. */
function uppgift(page: Page, label: string) {
  return insyn(page).getByRole("definition").filter({
    has: page.locator(`xpath=preceding-sibling::dt[normalize-space()="${label}"]`),
  });
}

test.describe("föreningsuppgifter med tom testfil", () => {
  // A build of the site made from tests/fixtures/*-tom.json (see playwright.config.ts).
  test.use({ baseURL: process.env.E2E_TOM_URL });

  test("Insyn visar ”fylls i” för organisationsnummer och bankgiro", async ({ page }) => {
    await page.goto("bli-fadder");
    await expect(insyn(page).getByRole("heading", { name: "Insyn" })).toBeVisible();
    for (const [label, chip] of [
      ["Organisationsnummer", "nummer fylls i"],
      ["Bankgiro", "nummer fylls i"],
    ]) {
      await expect(uppgift(page, label)).toHaveText(chip);
      await expect(uppgift(page, label).getByText(chip, { exact: true })).toBeVisible();
    }
    await expect(insyn(page).getByRole("link")).toHaveCount(0);
  });

  test("chipet ”fylls i” syns både på green och på cotton", async ({ page }) => {
    await page.goto("bli-fadder");
    const chip = uppgift(page, "Organisationsnummer").getByText("nummer fylls i", { exact: true });
    // Insyn sits on green. Place the same chip on the cotton section Vart ditt bidrag går as well.
    await chip.evaluate((el) => {
      const copy = el.cloneNode(true) as HTMLElement;
      copy.dataset.testid = "chip-pa-cotton";
      document.querySelector("#vart h2")!.after(copy);
    });
    const onCotton = page.getByTestId("chip-pa-cotton");
    for (const [surface, locator] of [
      ["green", chip],
      ["cotton", onCotton],
    ] as const) {
      await expect(locator, surface).toBeVisible();
      const { text, border } = await locator.evaluate(contrastAgainstBackground);
      expect(text, `texten på ${surface}`).toBeGreaterThanOrEqual(4.5);
      expect(border, `kanten på ${surface}`).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe("föreningsuppgifter med ifylld testfil", () => {
  // A second build of the site, made from tests/fixtures/foreningsuppgifter-ifylld.json (see playwright.config.ts).
  test.use({ baseURL: process.env.E2E_IFYLLD_URL });

  test("Insyn visar värdena från datafilen i stället för ”fylls i”", async ({ page }) => {
    await page.goto("bli-fadder");
    await expect(uppgift(page, "Organisationsnummer")).toHaveText("TEST-ORGNR");
    // The 90-konto from the data file is shown as Bankgiro; the annual report is not part of Insyn.
    await expect(uppgift(page, "Bankgiro")).toHaveText("TEST-90-KONTO");
    await expect(insyn(page).getByRole("link")).toHaveCount(0);
    await expect(insyn(page).getByText(/fylls i/)).toHaveCount(0);
    await expectNoA11yViolations(page);
  });
});

/** The list "Följ oss" at the bottom of the footer. */
function foljOss(page: Page) {
  return page.getByRole("contentinfo").getByRole("list", { name: "Följ oss" });
}

test.describe("Följ oss i sidfoten", () => {
  test("med tom testfil visar Facebook och Instagram ”länk fylls i” och inga länkar", async ({ page }) => {
    await page.goto(`${process.env.E2E_TOM_URL}`);
    for (const namn of ["Facebook", "Instagram"]) {
      await expect(foljOss(page).getByRole("listitem").filter({ hasText: namn })).toHaveText(`${namn}länk fylls i`);
    }
    await expect(foljOss(page).getByRole("link")).toHaveCount(0);
  });

  test("med ifylld testfil länkar Facebook och Instagram till föreningens sidor", async ({ page }) => {
    await page.goto(`${process.env.E2E_IFYLLD_URL}`);
    await expect(foljOss(page).getByRole("link", { name: "Facebook" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/test-streetlight",
    );
    await expect(foljOss(page).getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/test-streetlight",
    );
    await expect(foljOss(page).getByText(/fylls i/)).toHaveCount(0);
    await expectNoA11yViolations(page);
  });
});

/** Runs in the page: contrast of an element's text and border against the surface behind it. */
function contrastAgainstBackground(el: Element) {
  const rgba = (c: string) => c.match(/[\d.]+/g)!.map(Number);
  const luminance = ([r, g, b]: number[]) => {
    const [R, G, B] = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  const ratio = (a: number[], b: number[]) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  // The first opaque background among the ancestors is the surface the chip sits on.
  let node = el.parentElement;
  let surface = [255, 255, 255];
  while (node) {
    const bg = rgba(getComputedStyle(node).backgroundColor);
    if (bg.length < 4 || bg[3] === 1) {
      surface = bg.slice(0, 3);
      break;
    }
    node = node.parentElement;
  }
  // The chip's own background is translucent at most; blend it over the surface.
  const [r, g, b, a = 1] = rgba(getComputedStyle(el).backgroundColor);
  const behind = [r, g, b].map((v, i) => v * a + surface[i] * (1 - a));
  const style = getComputedStyle(el);
  return {
    text: ratio(rgba(style.color).slice(0, 3), behind),
    border: ratio(rgba(style.borderTopColor).slice(0, 3), surface),
  };
}

test.describe("organisationsnumret i sidfoten", () => {
  test("visar numret från den ifyllda testfilen", async ({ page }) => {
    await page.goto(process.env.E2E_IFYLLD_URL!);
    await expect(page.getByRole("contentinfo").getByTestId("sidfot-orgnr")).toHaveText("Org.nr TEST-ORGNR");
  });

  test("visar ”nummer fylls i” när numret saknas", async ({ page }) => {
    await page.goto(process.env.E2E_TOM_URL!);
    const rad = page.getByRole("contentinfo").getByTestId("sidfot-orgnr");
    await expect(rad).toHaveText("Org.nr nummer fylls i");
    await expect(rad.getByText("nummer fylls i", { exact: true })).toBeVisible();
  });
});

import { expect, test, type Page } from "@playwright/test";

import { farg } from "./helpers";

const GOLD = farg("gold");
const COTTON = farg("cotton");
const GREEN = farg("green");
const GREEN_DEEP = farg("green-deep");
const MINT = farg("mint");

const lights = (page: Page) => page.getByTestId("ljusbandet").getByTestId("ljus");
const steps = (page: Page) => page.locator("#familjer .step");
const highlight = (page: Page) => page.locator(".vision blockquote span");
const cone = (page: Page) => page.locator(".lamp .cone");
const support = (page: Page) => page.locator("#sa-arbetar-vi .link");
const runner = (page: Page) => support(page).locator(".runner");

const lightColors = (page: Page) => lights(page).evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
const stepStates = (page: Page) =>
  steps(page).evaluateAll((els) =>
    els.map((el) => ({ color: getComputedStyle(el).color, mark: getComputedStyle(el, "::before").backgroundColor })),
  );
const highlightSize = (page: Page) => highlight(page).evaluate((el) => getComputedStyle(el).backgroundSize);

/** Everything lit and finished: the lamp's cone, all 20 lights, the gold thread and the vision's highlight. */
async function expectFinished(page: Page) {
  await expect(cone(page)).toHaveCSS("animation-name", "none");
  await expect(cone(page)).toHaveCSS("opacity", "1");
  expect(await lightColors(page)).toEqual(Array(20).fill(GOLD));
  expect(await stepStates(page)).toEqual(Array(3).fill({ color: COTTON, mark: GOLD }));
  expect(await highlightSize(page)).toBe("100% 100%");
  await expectSupportFinished(page);
}

/** The diamond on "Ekonomiskt stöd" rests in the middle of the arrow, still and fully shown. */
async function expectSupportFinished(page: Page) {
  await expect(runner(page)).toHaveCSS("animation-name", "none");
  await expect(runner(page)).toHaveCSS("opacity", "1");
  await expect(runner(page)).toHaveCSS("transform", "none");
}

test.describe("med reducerad rörelse", () => {
  test.use({ reducedMotion: "reduce" });

  test("visas lyktan, alla 20 ljus, guldtråden och visionens markering tända och färdiga direkt", async ({ page }) => {
    await page.goto("./");
    await expectFinished(page);
    await page.locator(".vision").scrollIntoViewIfNeeded();
    await expectFinished(page);
    await support(page).scrollIntoViewIfNeeded();
    await expect(support(page)).not.toHaveClass(/\bflow\b/);
    await expectSupportFinished(page);
  });
});

test.describe("utan JavaScript", () => {
  test.use({ javaScriptEnabled: false, reducedMotion: "no-preference" });

  test("visas lyktan, alla 20 ljus, guldtråden och visionens markering tända och färdiga", async ({ page }) => {
    await page.goto("./");
    await expectFinished(page);
  });
});

test.describe("med rörelse", () => {
  test.use({ reducedMotion: "no-preference" });

  test("tänds lyktans ljuskägla när sidan öppnas", async ({ page }) => {
    await page.goto("./");
    await expect(cone(page)).toHaveCSS("animation-name", "cone-on");
    await expect(cone(page)).toHaveCSS("animation-duration", "1.5s");
    await expect(cone(page)).toHaveCSS("animation-delay", "0.4s");
    await expect.poll(() => cone(page).evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe("1");
  });

  test("tänds de 20 ljusen ett i taget och står till slut alla tända", async ({ page }) => {
    await page.goto("./");
    // Dimmed at once, never by a visible fade-out of lit lights.
    expect(await lightColors(page)).toEqual(Array(20).fill(GREEN_DEEP));
    const seen = new Set<number>();
    await expect
      .poll(
        async () => {
          const colors = await lightColors(page);
          seen.add(colors.filter((c) => c === GOLD).length);
          return colors.filter((c) => c === GOLD).length;
        },
        { timeout: 8000, intervals: [50] },
      )
      .toBe(20);
    // Not all at once: the band starts unlit and passes through partly lit states.
    expect(seen.has(0)).toBe(true);
    expect([...seen].some((n) => n > 0 && n < 20)).toBe(true);
  });

  test("lyser guldtrådens steg upp medan man läser", async ({ page }) => {
    await page.goto("./");
    expect(await stepStates(page)).toEqual(Array(3).fill({ color: MINT, mark: GREEN }));

    await page.locator(".vision").scrollIntoViewIfNeeded();
    await expect.poll(() => stepStates(page)).toEqual(Array(3).fill({ color: COTTON, mark: GOLD }));
  });

  test("lyser visionens markering upp när den syns", async ({ page }) => {
    await page.goto("./");
    expect(await highlightSize(page)).toBe("0% 100%");
    await highlight(page).scrollIntoViewIfNeeded();
    await expect.poll(() => highlightSize(page)).toBe("100% 100%");
  });

  test("visar pilen Ekonomiskt stöd sitt stöd en gång när den syns, och stannar i färdigt läge", async ({ page }) => {
    await page.goto("./");
    await expect(support(page)).not.toHaveClass(/\bflow\b/);
    await support(page).scrollIntoViewIfNeeded();
    await expect(support(page)).toHaveClass(/\bflow\b/);
    await expect(runner(page)).toHaveCSS("animation-name", "support-flow");
    await expect(runner(page)).toHaveCSS("animation-duration", "3.4s");
    // When the run is over, the diamond rests in the middle of the arrow, fully shown.
    await expect
      .poll(() => runner(page).evaluate((el) => el.getAnimations().every((a) => a.playState === "finished")), { timeout: 6000 })
      .toBe(true);
    await expect(runner(page)).toHaveCSS("opacity", "1");
    await expect(runner(page)).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  });

  test("ligger inte i någon React-ö", async ({ page }) => {
    await page.goto("./");
    for (const el of [page.getByTestId("ljusbandet"), page.locator("#familjer .thread"), page.locator(".vision"), page.locator(".lamp"), support(page)]) {
      expect(await el.evaluate((node) => node.closest("astro-island") === null)).toBe(true);
    }
  });
});

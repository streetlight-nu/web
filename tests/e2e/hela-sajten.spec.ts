import { readdirSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, funktionPa, LAYOUT, stubRepejo, textstorlek } from "./helpers";

/**
 * The rules every page keeps: Swedish, one h1, WCAG 2.1 AA, a skip link, body text of at least 18 px, no sideways
 * scroll and the words from GLOSSARY.md. A new page is added to SIDOR and gets them all; the tests of each page then
 * check only what is the page's own.
 */

/** One inlägg in the ordinary build, whichever the association has written. */
const ettInlagg = readdirSync("src/content/nyheter")
  .filter((fil) => fil.endsWith(".md"))
  .map((fil) => fil.replace(/\.md$/, ""))[0];

const SIDOR: [namn: string, sokvag: string][] = [
  ["startsidan", ""],
  ["Bli fadder", "bli-fadder"],
  ["Om föreningen", "om-foreningen"],
  ["Nyheter", "nyheter"],
  ["ett inlägg", `nyheter/${ettInlagg}`],
  ["Vanliga frågor", "vanliga-fragor"],
  ...(funktionPa("engagera") ? ([["Engagera dig", "engagera-dig"]] as [string, string][]) : []),
  ...(funktionPa("historia") ? ([["Vår historia", "historia"]] as [string, string][]) : []),
  ...(funktionPa("julklapp") ? ([["Ge en julklapp", "julklapp"]] as [string, string][]) : []),
];

/** Words GLOSSARY.md tells us to avoid, which have slipped into texts before. */
const UNDVIKS = /blogg|nyhetsbrev|sponsor|donator|givare|mottagare/i;

for (const [namn, sokvag] of SIDOR) {
  test.describe(namn, () => {
    test.beforeEach(async ({ page }) => {
      await stubRepejo(page);
      await page.goto(sokvag);
    });

    test("är på svenska, har en h1, följer ordlistan och klarar WCAG 2.1 AA", async ({ page }) => {
      await expect(page.locator("html")).toHaveAttribute("lang", "sv");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await page.locator("body").innerText()).not.toMatch(UNDVIKS);
      await expectNoA11yViolations(page);
    });

    test("hopplänken leder till innehållet", async ({ page }) => {
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Hoppa till innehållet" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect(page.locator("main#main")).toBeFocused();
    });

    test("brödtexten är minst 18 px och sidan staplas utan sidledsskroll", LAYOUT, async ({ page }) => {
      // Repejo draws its own forms (ADR 0003), some of them in a shadow root; their text is outside the page's control.
      const sizes = await page
        .locator("main p, main li, main blockquote, main figcaption, header p")
        .evaluateAll((els) =>
          els
            .filter((el) => el.getRootNode() === document && !el.closest("repejo-checkout, repejo-progress-bar"))
            .map((el) => ({ text: el.textContent!.trim().slice(0, 40), px: parseFloat(getComputedStyle(el).fontSize) })),
        );
      expect(sizes.length).toBeGreaterThan(0);
      // The design system's text style "label" (dates, years, topics, labels) is the one style allowed below body.
      const [body, label] = [textstorlek("body"), textstorlek("label")];
      expect(sizes.filter((s) => s.px < body && s.px !== label)).toEqual([]);

      await page.waitForLoadState("networkidle");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      ).toBe(0);
    });
  });
}

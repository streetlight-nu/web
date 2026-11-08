import { readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

import { REPEJO_HOST } from "../../src/lib/repejo";

/** Fails if axe finds any WCAG 2.1 A or AA violation on the page. */
export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

/**
 * Stubs Repejo: every request to app.repejo.se gets a small script that defines `repejo-checkout`
 * and `repejo-progress-bar` as plain elements with recognisable text. The tests then depend neither
 * on the network nor on Repejo's markup.
 */
export async function stubRepejo(page: Page) {
  await page.route(`${REPEJO_HOST}/**`, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `
        for (const [name, text] of [
          ["repejo-checkout", "Repejos checkout (stubb)"],
          ["repejo-progress-bar", "Repejos insamlingsmätare (stubb)"],
        ]) {
          customElements.define(name, class extends HTMLElement {
            connectedCallback() { this.textContent = text; }
          });
        }
      `,
    }),
  );
}

/** Blocks Repejo, as when its script cannot be loaded. */
export async function blockRepejo(page: Page) {
  await page.route(`${REPEJO_HOST}/**`, (route) => route.abort());
}

/**
 * Whether a funktionsflagga (src/data/funktioner.json) is on in the ordinary build, which is built from the real
 * data file with the same MILJO as CI. The association edits that file in Pages CMS, so tests of a page or an
 * element behind a flag skip themselves when it is off, instead of failing. The tests in funktioner.spec.ts use
 * their own builds from fixtures and do not need this.
 */
export function funktionPa(funktion: "julklapp" | "historia"): boolean {
  const lagen = JSON.parse(readFileSync("src/data/funktioner.json", "utf8")) as Record<string, string>;
  const lage = lagen[funktion];
  return lage === "pa" || (lage === "ejProduktion" && process.env.MILJO !== "produktion");
}

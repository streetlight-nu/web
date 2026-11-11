import { readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

import { REPEJO_HOST } from "../../src/lib/repejo";

/**
 * Tag for a test whose outcome depends on the screen width (layout, tap areas, the folded menu). Only these
 * run in the project "mobil" as well (see playwright.config.ts); every other test runs once, on desktop.
 */
export const LAYOUT = { tag: "@layout" };

const tokens = JSON.parse(readFileSync("src/styles/tokens.json", "utf8")) as {
  color: { tokens: { name: string; value: string }[] };
  type: { groups: { styles: { name: string; fontSize: string }[] }[] };
};

/** A text style's size in px from the design system (src/styles/tokens.json), for example textstorlek("body") is 18. */
export function textstorlek(namn: string): number {
  const stil = tokens.type.groups.flatMap((g) => g.styles).find((s) => s.name === namn);
  if (!stil) throw new Error(`Ingen textstil ${namn} i tokens.json`);
  return parseFloat(stil.fontSize);
}

/**
 * A colour from the design system (src/styles/tokens.json), written as getComputedStyle writes it, for example
 * farg("gold") is "rgb(244, 180, 0)". Tests name the token, so a new value for a token does not break them.
 */
export function farg(namn: string): string {
  const token = tokens.color.tokens.find((t) => t.name === namn);
  if (!token) throw new Error(`Ingen färg ${namn} i tokens.json`);
  const hex = token.value.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!hex) return token.value;
  return `rgb(${hex.slice(1).map((h) => parseInt(h, 16)).join(", ")})`;
}

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
          ["repejo-p2p-create-button", "Repejos knapp för egen insamling (stubb)"],
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

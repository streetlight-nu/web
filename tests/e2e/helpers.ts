import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Fails if axe finds any WCAG 2.1 A or AA violation on the page. */
export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

/** Repejo's host, the only external service the campaign page may call (ADR 0003). */
export const REPEJO = "https://app.repejo.se";

/**
 * Stubs Repejo: every request to app.repejo.se gets a small script that defines `repejo-checkout`
 * and `repejo-progress-bar` as plain elements with recognisable text. The tests then depend neither
 * on the network nor on Repejo's markup.
 */
export async function stubRepejo(page: Page) {
  await page.route(`${REPEJO}/**`, (route) =>
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
  await page.route(`${REPEJO}/**`, (route) => route.abort());
}

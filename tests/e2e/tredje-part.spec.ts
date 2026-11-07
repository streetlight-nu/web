import { expect, test } from "@playwright/test";

import { REPEJO_HOST } from "../../src/lib/repejo";
import { funktionPa, stubRepejo } from "./helpers";

/**
 * The campaign page loads Repejo's script (ADR 0003). Repejo is stubbed with a script that loads nothing, so
 * these tests check only our own code, not what Repejo's real checkout.js loads on /julklapp (fonts, Stripe,
 * Adyen and possibly a Meta pixel): see ADR 0003.
 */
test("julklapp hämtar Repejos skript från Repejo, en gång", async ({ page }) => {
  test.skip(!funktionPa("julklapp"), "julklapp är avstängd i funktioner.json");
  await stubRepejo(page);
  const skript: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith(`${REPEJO_HOST}/`)) skript.push(request.url());
  });
  await page.goto("julklapp");
  await page.waitForLoadState("networkidle");
  expect(skript).toEqual([`${REPEJO_HOST}/assets/checkout.js`]);
});

test("Stöd oss hämtar Repejos skript från Repejo, en gång", async ({ page }) => {
  await stubRepejo(page);
  const skript: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith(`${REPEJO_HOST}/`)) skript.push(request.url());
  });
  await page.goto("stod-oss");
  await page.waitForLoadState("networkidle");
  expect(skript).toEqual([`${REPEJO_HOST}/assets/checkout.js`]);
});

import { expect, test, type Page } from "@playwright/test";

import { REPEJO_HOST } from "../../src/lib/repejo";
import { stubRepejo } from "./helpers";

/**
 * Which external hosts our own page code may call, per page (ADR 0003). Most pages call none; the campaign
 * page may call Repejo. Repejo is stubbed with a script that loads nothing, so these tests check only our
 * own code. They say nothing about what Repejo's real checkout.js loads on /julklapp (fonts, Stripe, Adyen
 * and possibly a Meta pixel): see ADR 0003.
 */
const repejo = new URL(REPEJO_HOST).host;
const tillatna: Record<string, string[]> = {
  "./": [],
  nyheter: [],
  historia: [],
  "om-foreningen": [],
  julklapp: [repejo],
};

/** Opens a page and returns the external hosts it called, apart from data: URLs and our own server. */
async function externaVardar(page: Page, sida: string, egen: string): Promise<string[]> {
  const vardar = new Set<string>();
  page.on("request", (request) => {
    const url = request.url();
    if (!url.startsWith("data:") && !url.startsWith(egen)) vardar.add(new URL(url).host);
  });
  await page.goto(sida);
  await page.waitForLoadState("networkidle");
  return [...vardar];
}

for (const [sida, vardar] of Object.entries(tillatna)) {
  test(`${sida}: vår egen kod anropar ${vardar.length ? `bara ${vardar.join(", ")}` : "ingen annan värd"}`, async ({
    page,
    baseURL,
  }) => {
    await stubRepejo(page);
    const externa = await externaVardar(page, sida, new URL(baseURL!).origin);
    expect(externa.filter((host) => !vardar.includes(host))).toEqual([]);
  });
}

test("ett inlägg: vår egen kod anropar ingen annan värd", async ({ page, baseURL }) => {
  // Take whichever inlägg the nyheter page links to first, so editors can remove any inlägg.
  await page.goto("nyheter");
  const inlagg = await page.getByRole("main").locator('a[href*="/nyheter/"]:not([href*="#"])').first().getAttribute("href");
  expect(inlagg).toBeTruthy();
  await stubRepejo(page);
  expect(await externaVardar(page, inlagg!, new URL(baseURL!).origin)).toEqual([]);
});

test("julklapp hämtar Repejos skript från Repejo, en gång", async ({ page }) => {
  await stubRepejo(page);
  const skript: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith(`${REPEJO_HOST}/`)) skript.push(request.url());
  });
  await page.goto("julklapp");
  await page.waitForLoadState("networkidle");
  expect(skript).toEqual([`${REPEJO_HOST}/assets/checkout.js`]);
});

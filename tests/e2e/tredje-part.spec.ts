import { expect, test } from "@playwright/test";

import { stubRepejo } from "./helpers";

/**
 * Which external hosts each page may call (ADR 0003). Most pages call none. The campaign page may call
 * Repejo, which handles its checkout and progress bar; Repejo is stubbed, so the test needs no network.
 */
const tillatna: Record<string, string[]> = {
  "./": [],
  nyheter: [],
  "nyheter/valkommen-till-arsmotet": [],
  historia: [],
  julklapp: ["app.repejo.se"],
};

for (const [sida, vardar] of Object.entries(tillatna)) {
  test(`${sida} anropar bara ${vardar.length ? vardar.join(", ") : "sin egen server"}, och typsnitten ligger på egen server`, async ({
    page,
    baseURL,
  }) => {
    await stubRepejo(page);
    const egen = new URL(baseURL!).origin;
    const externa: string[] = [];
    const typsnitt: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.startsWith(egen)) return;
      externa.push(new URL(url).host);
      if (request.resourceType() === "font" || /fonts\.(googleapis|gstatic)\.com/.test(url)) typsnitt.push(url);
    });
    await page.goto(sida);
    await page.waitForLoadState("networkidle");
    expect(typsnitt).toEqual([]);
    expect([...new Set(externa)].filter((host) => !vardar.includes(host))).toEqual([]);
  });
}

test("julklapp hämtar Repejos skript från app.repejo.se, en gång", async ({ page }) => {
  await stubRepejo(page);
  const skript: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://app.repejo.se/")) skript.push(request.url());
  });
  await page.goto("julklapp");
  await page.waitForLoadState("networkidle");
  expect(skript).toEqual(["https://app.repejo.se/assets/checkout.js"]);
});

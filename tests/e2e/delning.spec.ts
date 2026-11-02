import { expect, test } from "@playwright/test";

// What a shared link shows: Open Graph's type and image.
const inlagg = "nyheter/valkommen-till-arsmotet";

/** The PNG's width and height, read from its IHDR chunk. */
function pngStorlek(png: Buffer) {
  expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { bredd: png.readUInt32BE(16), hojd: png.readUInt32BE(20) };
}

for (const [sida, namn] of [
  ["./", "startsidan"],
  ["nyheter", "nyhetslistan"],
  [inlagg, "ett inlägg utan egen bild"],
] as const) {
  test(`${namn} delas med sajtens standardbild, en PNG i 1200 × 630`, async ({ page, request }) => {
    await page.goto(sida);
    const bild = page.locator('meta[property="og:image"]');
    await expect(bild).toHaveCount(1);
    const adress = new URL((await bild.getAttribute("content"))!);
    expect(adress.pathname).toMatch(/\/delningsbild\.png$/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Streetlight/);

    // The site is served on another port in the tests than the one in its absolute URLs.
    const svar = await request.get(adress.pathname);
    expect(svar.ok()).toBe(true);
    expect(svar.headers()["content-type"]).toBe("image/png");
    expect(pngStorlek(await svar.body())).toEqual({ bredd: 1200, hojd: 630 });
  });
}

test("ett inlägg delas som en artikel, startsidan och nyhetslistan som en webbplats", async ({ page }) => {
  await page.goto(inlagg);
  await expect(page.locator('meta[property="og:type"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", "2026-03-20");

  for (const sida of ["./", "nyheter"]) {
    await page.goto(sida);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  }
});

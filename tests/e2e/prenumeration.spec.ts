import { expect, test, type Page } from "@playwright/test";

import { PRENUMERATION_URL, WIX_HOST } from "../../src/lib/prenumeration";
import { LAYOUT, stubWix } from "./helpers";

// The section is behind the flag `prenumeration` (`ejProduktion`), so it is on only in a build that is not production: the filled-in one.
test.use({ baseURL: process.env.E2E_IFYLLD_URL });

test.beforeEach(async ({ page }) => {
  await stubWix(page);
});

/** The section "Följ arbetet i Addis Abeba." at the end of the Nyheter page. */
function sektion(page: Page) {
  return page.locator("#nyheter-med-epost");
}

test.describe("sektionen Få nyheterna med e-post", () => {
  test("ligger sist på Nyheter-sidan med rubrik, ingress och en länk till Nyheter", async ({ page }) => {
    await page.goto("nyheter");
    const sista = await page.locator("main > section").last().getAttribute("id");
    expect(sista).toBe("nyheter-med-epost");

    const s = sektion(page);
    await expect(s.getByRole("heading", { level: 2, name: "Följ arbetet i Addis Abeba." })).toBeVisible();
    await expect(s.getByText("Få föreningens nyheter med e-post.")).toBeVisible();
    expect(await s.innerText()).not.toMatch(/nyhetsbrev/i);
    await s.getByRole("link", { name: "Nyheter" }).click();
    await expect(page).toHaveURL(/\/nyheter\/?#alla-nyheter$/);
  });

  test("bäddar in föreningens Wix-formulär", async ({ page }) => {
    await page.goto("nyheter");
    const s = sektion(page);
    const ram = s.locator("iframe");
    await expect(ram).toHaveAttribute("src", PRENUMERATION_URL);
    await expect(ram).toHaveAttribute("title", "Få nyheterna med e-post");
    await ram.scrollIntoViewIfNeeded();
    await expect(page.frameLocator("#prenumeration-formular").getByText("Wix-formuläret (stubb)")).toBeVisible();
  });

  test("hämtar bara från Wix, och bara formuläret", async ({ page }) => {
    const anrop: string[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith(`${WIX_HOST}/`)) anrop.push(request.url());
    });
    await page.goto("nyheter");
    await page.locator("#prenumeration-formular").scrollIntoViewIfNeeded();
    await expect.poll(() => anrop).toEqual([PRENUMERATION_URL]);
  });

  test("andra sidor hämtar ingenting från Wix", async ({ page }) => {
    const anrop: string[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith(`${WIX_HOST}/`)) anrop.push(request.url());
    });
    await page.goto("");
    await page.goto("bli-fadder");
    await page.waitForLoadState("networkidle");
    expect(anrop).toEqual([]);
  });

  test("rubriken och formuläret står bredvid varandra på bred skärm och under varandra på mobil", LAYOUT, async ({
    page,
    isMobile,
  }) => {
    await page.goto("nyheter");
    const rubrik = (await sektion(page).getByRole("heading", { level: 2 }).boundingBox())!;
    const ram = (await sektion(page).locator("iframe").boundingBox())!;
    if (isMobile) expect(ram.y).toBeGreaterThanOrEqual(rubrik.y + rubrik.height);
    else expect(ram.x).toBeGreaterThanOrEqual(rubrik.x + rubrik.width);
  });

  test("länken är minst 44 px hög", LAYOUT, async ({ page }) => {
    await page.goto("nyheter");
    expect((await sektion(page).getByRole("link", { name: "Nyheter" }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
});

import { expect, test } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

test("startsidan har en h1 och klarar WCAG 2.1 AA", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Streetlight");
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ett ljus på vägen till skolan.");
  await expectNoA11yViolations(page);
});

test("hopplänken leder till innehållet", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Hoppa till innehållet" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("huvudmenyn länkar till startsidans avsnitt och nyheterna", async ({ page, isMobile }) => {
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  for (const [name, path] of [
    ["Vårt stöd", "#stod"],
    ["Familjerna", "#familjer"],
    ["Så arbetar vi", "#sa-arbetar-vi"],
    ["Nyheter", "nyheter"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", new RegExp(`${path}$`));
  }
  await expect(nav.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /#bli-fadder$/);
});

test("sidan hämtar inget från tredje part", async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const external: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith(origin) && !request.url().startsWith("data:")) external.push(request.url());
  });
  await page.goto("./");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});

test.describe("mobilmenyn", () => {
  test.skip(({ isMobile }) => !isMobile, "Menyknappen finns bara på smal skärm");

  test("öppnas och stängs med tangentbordet", async ({ page }) => {
    await page.goto("./");
    const toggle = page.getByRole("button", { name: "Meny" });
    const firstLink = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Vårt stöd", exact: true });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(firstLink).toBeHidden();

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(firstLink).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    await expectNoA11yViolations(page);

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(firstLink).toBeHidden();
  });
});

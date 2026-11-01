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

test.describe("startsidans berättelse", () => {
  test("avsnitten Vårt stöd, Familjerna och Så arbetar vi nås från menyn", async ({ page, isMobile }) => {
    await page.goto("./");
    const nav = page.getByRole("navigation", { name: "Huvudmeny" });
    for (const [name, anchor, heading] of [
      ["Vårt stöd", "stod", "Utbildning är vägen ut ur fattigdom."],
      ["Familjerna", "familjer", "Ljuset ska nå hela familjen."],
      ["Så arbetar vi", "sa-arbetar-vi", "Två föreningar. Två styrelser. Ett arbete."],
    ]) {
      if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
      await nav.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
      await expect(page.locator(`#${anchor}`).getByRole("heading", { level: 2, name: heading })).toBeInViewport();
    }
  });

  test("bandet under toppen har exakt 20 ljus, ett per fadderbarn", async ({ page }) => {
    await page.goto("./");
    const band = page.getByTestId("ljusbandet");
    await expect(band).toBeVisible();
    await expect(band.getByTestId("ljus")).toHaveCount(20);
    for (const light of await band.getByTestId("ljus").all()) await expect(light).toBeVisible();
    await expect(page.getByText("20 barn, 20 ljus.")).toBeVisible();
  });

  test("ብርሃን i toppen är amhariska, i guld och med uttalet under", async ({ page }) => {
    await page.goto("./");
    const word = page.getByRole("banner").getByText("ብርሃን", { exact: true });
    await expect(word).toBeVisible();
    await expect(word).toHaveAttribute("lang", "am");
    await expect(word).toHaveCSS("color", "rgb(244, 180, 0)");
    const pronunciation = page.getByRole("banner").getByText("”ljus” på amhariska, uttalas birhan");
    await expect(pronunciation).toBeVisible();
    const [w, p] = [(await word.boundingBox())!, (await pronunciation.boundingBox())!];
    expect(p.y).toBeGreaterThanOrEqual(w.y + w.height - 1);
  });

  test("berättar vad stödet går till, hur familjerna får stöd och hur föreningarna arbetar", async ({ page }) => {
    await page.goto("./");
    const stod = page.locator("#stod");
    for (const name of ["Skolavgifter", "Skoluniform", "Skolmaterial", "Vård när barnet blir sjukt"]) {
      await expect(stod.getByRole("heading", { level: 3, name })).toBeVisible();
    }
    const familjer = page.locator("#familjer");
    for (const step of [
      "Föräldern får stöd att starta en egen verksamhet som ger inkomst.",
      "Familjen får en egen inkomst att bygga vidare på.",
      "Barnet kan fortsätta gå i skolan, med en ljusare framtid framför sig.",
    ]) {
      await expect(familjer.getByText(step)).toBeVisible();
    }
    await expect(
      page.getByText("Vi vill sprida hopp om en ljus framtid till våra barn och deras familjer."),
    ).toBeVisible();
    await expect(page.getByText("Streetlights vision")).toBeVisible();
    const arbete = page.locator("#sa-arbetar-vi");
    await expect(arbete.getByRole("heading", { level: 3, name: "Streetlight Sverige" })).toBeVisible();
    await expect(arbete.getByRole("heading", { level: 3, name: "Streetlight Etiopien" })).toBeVisible();
    await expect(
      arbete.getByText("Barnen väljs ut tillsammans med de lokala myndigheterna i Addis Abeba."),
    ).toBeVisible();
  });

  test("texterna följer ordlistan och hittar inte på några siffror", async ({ page }) => {
    await page.goto("./");
    const text = (await page.getByRole("banner").innerText()) + (await page.locator("main").innerText());
    // "Senaste nytt" shows the newest post's date, which comes from the post, not from the page.
    const utanNyheter = await page.locator("main").evaluate((main) => {
      const kopia = main.cloneNode(true) as HTMLElement;
      kopia.querySelector("#senaste")?.remove();
      return kopia.textContent!;
    });
    const siffror = (await page.getByRole("banner").innerText()) + utanNyheter;
    expect(new Set(siffror.match(/\d+/g))).toEqual(new Set(["20"]));
    expect(text).toContain("fadderbarn");
    expect(text).not.toMatch(/blogg|sponsor|donator|mottagare/i);
  });

  test("brödtexten är minst 18 px", async ({ page }) => {
    await page.goto("./");
    const sizes = await page
      .locator("main p, main li, main blockquote, main figcaption")
      .evaluateAll((els) =>
        els.map((el) => ({ text: el.textContent!.trim().slice(0, 40), px: parseFloat(getComputedStyle(el).fontSize) })),
      );
    expect(sizes.length).toBeGreaterThan(10);
    expect(sizes.filter((s) => s.px < 18)).toEqual([]);
  });
});

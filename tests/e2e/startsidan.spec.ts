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

test("huvudmenyn länkar till Om oss, Nyheter och Frågor", async ({ page, isMobile }) => {
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  for (const [name, path] of [
    ["Om oss", "om-foreningen"],
    ["Nyheter", "nyheter"],
    ["Frågor", "vanliga-fragor"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", new RegExp(`${path}$`));
  }
  await expect(nav.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/stod-oss$/);
  // The Ett ljus rule: the hero's "Bli fadder" is the start page's gold button, so the header's is a line.
  expect(await nav.getByRole("link", { name: "Bli fadder" }).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    "rgba(0, 0, 0, 0)",
  );
});

test.describe("mobilmenyn", () => {
  test.skip(({ isMobile }) => !isMobile, "Menyknappen finns bara på smal skärm");

  test("öppnas och stängs med tangentbordet", async ({ page }) => {
    await page.goto("./");
    const toggle = page.getByRole("button", { name: "Meny" });
    const firstLink = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Om oss", exact: true });
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

  test("berättar hur det började, vad stödet är till för, hur familjerna får stöd och hur föreningarna arbetar", async ({
    page,
  }) => {
    await page.goto("./");
    const borjan = page.locator("#borjan");
    await expect(borjan.getByRole("heading", { level: 2, name: "Så började det." })).toBeVisible();
    await expect(borjan).toContainText("Merry");
    await expect(borjan.getByRole("link", { name: "Läs hela berättelsen om föreningen" })).toHaveAttribute(
      "href",
      /\/om-foreningen#borjan$/,
    );
    // What the support pays for, and the proof, have their one home on Stöd oss.
    const stod = page.locator("#stod");
    await expect(stod.getByRole("heading", { level: 2, name: "Utbildning är vägen ut ur fattigdom." })).toBeVisible();
    await expect(stod.getByRole("link", { name: "Se vart ditt bidrag går" })).toHaveAttribute("href", /\/stod-oss#vart$/);
    const familjer = page.locator("#familjer");
    for (const step of [
      "Föräldern får stöd att starta en egen verksamhet som ger inkomst.",
      "Familjen får en egen inkomst att bygga vidare på.",
      "Barnet kan fortsätta gå i skolan, med en ljusare framtid framför sig.",
    ]) {
      await expect(familjer.getByText(step)).toBeVisible();
    }
    await expect(
      page.getByText("Vi vill sprida hopp om en ljus framtid till våra fadderbarn och deras familjer."),
    ).toBeVisible();
    await expect(page.getByText("Streetlights vision")).toBeVisible();
    const arbete = page.locator("#sa-arbetar-vi");
    await expect(arbete.getByRole("heading", { level: 3, name: "Streetlight Sverige" })).toBeVisible();
    await expect(arbete.getByRole("heading", { level: 3, name: "Streetlight Etiopien" })).toBeVisible();
    await expect(arbete.getByRole("link", { name: "Så når stödet fram" })).toHaveAttribute("href", /\/stod-oss#nar-fram$/);
    await expect(arbete.getByRole("region", { name: "Insyn" })).toHaveCount(0);
  });

  test("texterna följer ordlistan och hittar inte på några siffror", async ({ page }) => {
    // On the build with empty test files: the föreningsuppgifter the association fills in have figures of their own.
    await page.goto(process.env.E2E_TOM_URL!);
    const text = (await page.getByRole("banner").innerText()) + (await page.locator("main").innerText());
    // "Senaste nytt" shows the newest inlägg's date, which comes from the inlägg, not from the page, and Så började
    // det tells the year from the association's own text (src/data/om-foreningen.json).
    const utanNyheter = await page.locator("main").evaluate((main) => {
      const dolda = ["#senaste", "#borjan"].map((id) => main.querySelector<HTMLElement>(id)!);
      for (const el of dolda) el.style.display = "none";
      const synligText = (main as HTMLElement).innerText;
      for (const el of dolda) el.style.display = "";
      return synligText;
    });
    const siffror = (await page.getByRole("banner").innerText()) + utanNyheter;
    // "90-konto" is the name of a kind of account, not a figure.
    expect(new Set(siffror.replaceAll("90-konto", "").match(/\d+/g))).toEqual(new Set(["20"]));
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

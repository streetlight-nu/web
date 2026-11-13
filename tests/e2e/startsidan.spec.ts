import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, farg, LAYOUT } from "./helpers";

// The rules every page keeps (h1, WCAG, skip link, 18 px, the glossary) are in hela-sajten.spec.ts.

test("startsidan har titeln Streetlight och rubriken Ett ljus på vägen till skolan", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Streetlight");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ett ljus på vägen till skolan.");
});

test("huvudmenyn länkar till Om Streetlight och Nyheter", LAYOUT, async ({ page, isMobile }) => {
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Huvudmeny" });
  if (isMobile) await nav.getByRole("button", { name: "Meny" }).click();
  for (const [name, path] of [
    ["Om Streetlight", "om-foreningen"],
    ["Nyheter", "nyheter"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", new RegExp(`${path}$`));
  }
  // Vanliga frågor is reached from the footer, not the header.
  await expect(nav.getByRole("link", { name: "Frågor", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Bli fadder" })).toHaveAttribute("href", /\/bli-fadder$/);
  // The Ett ljus rule: the hero's "Bli fadder" is the start page's gold button, so the header's is a line.
  expect(await nav.getByRole("link", { name: "Bli fadder" }).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    "rgba(0, 0, 0, 0)",
  );
});

test.describe("mobilmenyn", LAYOUT, () => {
  test.skip(({ isMobile }) => !isMobile, "Menyknappen finns bara på smal skärm");

  test("loggan, Bli fadder och Meny ryms på en rad även vid 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const sida of ["./", "bli-fadder"]) {
      await page.goto(sida);
      const nav = page.getByRole("navigation", { name: "Huvudmeny" });
      const delar = [
        nav.getByRole("link", { name: "Streetlight, till startsidan" }),
        nav.getByRole("link", { name: "Bli fadder" }),
        nav.getByRole("button", { name: "Meny" }),
      ];
      const rutor = await Promise.all(delar.map(async (del) => (await del.boundingBox())!));
      for (const ruta of rutor) {
        expect(ruta.y).toBeLessThan(rutor[0].y + rutor[0].height);
        expect(ruta.height).toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    }
  });

  test("öppnas och stängs med tangentbordet", async ({ page }) => {
    await page.goto("./");
    const toggle = page.getByRole("button", { name: "Meny" });
    const firstLink = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Nyheter", exact: true });
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

  test("ብርሃን i toppen är amhariska, i guld och med uttalet under", LAYOUT, async ({ page }) => {
    await page.goto("./");
    const word = page.getByRole("banner").getByText("ብርሃን", { exact: true });
    await expect(word).toBeVisible();
    await expect(word).toHaveAttribute("lang", "am");
    await expect(word).toHaveCSS("color", farg("gold"));
    const pronunciation = page.getByRole("banner").getByText("”ljus” på amhariska, uttalas birhan");
    await expect(pronunciation).toBeVisible();
    const [w, p] = [(await word.boundingBox())!, (await pronunciation.boundingBox())!];
    expect(p.y).toBeGreaterThanOrEqual(w.y + w.height - 1);
  });

  test("berättar hur det började, vad stödet är till för, hur familjerna får stöd och hur föreningarna arbetar", async ({
    page,
  }) => {
    // On the build with filled-in test files: Så började det and the vision come from om-foreningen.json.
    await page.goto(process.env.E2E_IFYLLD_URL!);
    const borjan = page.locator("#borjan");
    await expect(borjan.getByRole("heading", { level: 2, name: "Så började det." })).toBeVisible();
    await expect(borjan).toContainText("TEST-BÖRJAN, första stycket.");
    await expect(borjan).not.toContainText("andra stycket");
    await expect(borjan.getByRole("link", { name: "Läs hela berättelsen om Streetlight" })).toHaveAttribute(
      "href",
      /\/om-foreningen#borjan$/,
    );
    // What the support pays for, and the proof, have their one home on the page Bli fadder.
    const stod = page.locator("#stod");
    await expect(stod.getByRole("heading", { level: 2, name: "Utbildning är vägen ut ur fattigdom." })).toBeVisible();
    await expect(stod.getByRole("link", { name: "Se vart ditt bidrag går" })).toHaveAttribute("href", /\/bli-fadder#vart$/);
    // What the support is for comes before Så började det.
    const stodY = (await stod.boundingBox())!.y;
    const borjanY = (await borjan.boundingBox())!.y;
    expect(stodY).toBeLessThan(borjanY);
    const familjer = page.locator("#familjer");
    await expect(familjer.getByRole("heading", { level: 2, name: "Ljuset ska nå hela familjen." })).toBeVisible();
    await expect(familjer).toContainText("Då får familjen en egen inkomst, och barnet kan fortsätta gå i skolan.");
    await expect(
      page.getByText("TEST-VISION om en ljus framtid för barnen."),
    ).toBeVisible();
    await expect(page.getByText("Streetlights vision")).toBeVisible();
    const arbete = page.locator("#sa-arbetar-vi");
    await expect(arbete.getByRole("heading", { level: 3, name: "Streetlight Sverige" })).toBeVisible();
    await expect(arbete.getByRole("heading", { level: 3, name: "Streetlight Etiopien" })).toBeVisible();
    await expect(arbete.getByRole("link", { name: "Läs hur barnen väljs ut och hur pengarna når fram" })).toHaveAttribute("href", /\/bli-fadder#nar-fram$/);
    await expect(arbete.getByRole("region", { name: "Insyn" })).toHaveCount(0);
  });

  test("texterna talar om fadderbarn och hittar inte på några siffror", async ({ page }) => {
    // On the build with empty test files: the föreningsuppgifter the association fills in have figures of their own.
    await page.goto(process.env.E2E_TOM_URL!);
    const text = (await page.getByRole("banner").innerText()) + (await page.locator("main").innerText());
    // "Senaste nytt" shows the newest inlägg's date, which comes from the inlägg, not from the page, and Så började
    // det tells the year from the association's own text (src/data/om-foreningen.json).
    const utanNyheter = await page.locator("main").evaluate((main) => {
      const dolda = ["#senaste", "#borjan"].flatMap((id) => main.querySelector<HTMLElement>(id) ?? []);
      for (const el of dolda) el.style.display = "none";
      const synligText = (main as HTMLElement).innerText;
      for (const el of dolda) el.style.display = "";
      return synligText;
    });
    const siffror = (await page.getByRole("banner").innerText()) + utanNyheter;
    // "90-konto" is the name of a kind of account, not a figure.
    expect(new Set(siffror.replaceAll("90-konto", "").match(/\d+/g))).toEqual(new Set(["20"]));
    expect(text).toContain("fadderbarn");
  });
});

test("Vad stödet går till leder till Vart ditt bidrag går på Bli fadder", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "Vad stödet går till" }).click();
  await expect(page).toHaveURL(/\/bli-fadder#vart$/);
  await expect(page.getByRole("heading", { level: 2, name: "Vart ditt bidrag går." })).toBeInViewport();
});

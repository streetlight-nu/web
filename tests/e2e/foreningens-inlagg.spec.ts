import { expect, test } from "@playwright/test";

// The association's own inlägg, on the site as it is built from src/content/nyheter. The template's
// behaviour is tested with the Exempelinlägg in inlagg.spec.ts and nyheter.spec.ts.

const arsmote = "nyheter/arsmote-25-april-valkommen-att-vara-med-och-forma-streetlight";
const titel = "Årsmöte 25 april – välkommen att vara med och forma Streetlight!";

test("nyhetslistan visar föreningens egna inlägg och inga exempelinlägg", async ({ page }) => {
  await page.goto("nyheter");
  const listan = page.getByRole("region", { name: "Alla nyheter" });
  await expect(listan.getByRole("heading", { level: 3 })).toContainText([titel]);
  await expect(page.getByRole("main").getByText("Exempel", { exact: true })).toHaveCount(0);
});

test("inlägget om årsmötet har sin bild och Zoom-länken", async ({ page }) => {
  await page.goto(arsmote);
  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(titel);
  await expect(main.getByRole("img", { name: /En grupp barn och unga/ })).toBeVisible();
  await expect(main.getByRole("link", { name: "Delta via Zoom" })).toHaveAttribute("href", /zoom\.us/);
});

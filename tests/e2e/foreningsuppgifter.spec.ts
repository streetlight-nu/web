import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations } from "./helpers";

/** The list "Följ oss" at the bottom of the footer. */
function foljOss(page: Page) {
  return page.getByRole("contentinfo").getByRole("list", { name: "Följ oss" });
}

test.describe("Följ oss i sidfoten", () => {
  test("med tom testfil visas varken Följ oss eller något ”fylls i”", async ({ page }) => {
    await page.goto(`${process.env.E2E_TOM_URL}`);
    await expect(foljOss(page)).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("heading", { name: "Följ oss" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByText(/fylls i/)).toHaveCount(0);
  });

  test("med ifylld testfil länkar Facebook och Instagram till föreningens sidor", async ({ page }) => {
    await page.goto(`${process.env.E2E_IFYLLD_URL}`);
    await expect(foljOss(page).getByRole("link", { name: "Facebook" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/test-streetlight",
    );
    await expect(foljOss(page).getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/test-streetlight",
    );
    await expect(foljOss(page).getByText(/fylls i/)).toHaveCount(0);
    await expectNoA11yViolations(page);
  });
});

test.describe("organisationsnumret i sidfoten", () => {
  test("visar numret från den ifyllda testfilen", async ({ page }) => {
    await page.goto(process.env.E2E_IFYLLD_URL!);
    await expect(page.getByRole("contentinfo").getByTestId("sidfot-orgnr")).toHaveText("Org.nr TEST-ORGNR");
  });

  test("visar ingen rad när numret saknas", async ({ page }) => {
    await page.goto(process.env.E2E_TOM_URL!);
    await expect(page.getByRole("contentinfo").getByTestId("sidfot-orgnr")).toHaveCount(0);
  });
});

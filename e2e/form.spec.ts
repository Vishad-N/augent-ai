import { expect, test } from "@playwright/test";

test.describe("demo request form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#cta");
    await page.locator("#cta").scrollIntoViewIfNeeded();
  });

  test("blocks an empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Thank you!")).toHaveCount(0);
  });

  test("submits a valid request", async ({ page }) => {
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("E-mail").fill("ada@example.com");
    await page.getByLabel("Company").fill("Analytical Engines");
    await page.getByLabel("Job Title").fill("CTO");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Thank you!")).toBeVisible();
  });
});

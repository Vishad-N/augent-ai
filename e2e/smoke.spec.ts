import { expect, test } from "@playwright/test";

test("home renders the hero, nav and every section", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/AuGENT/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Retrieve knowledge");
  for (const id of ["solutions", "core-capabilities", "use-cases", "architecture", "philosophy", "cta"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("no horizontal scroll and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // the page can't be dragged sideways (body clips overflow-x, so scrollWidth alone would over-report)
  const scrollX = await page.evaluate(() => {
    window.scrollTo(300, 0);
    return window.scrollX;
  });
  expect(scrollX).toBe(0);
  expect(errors).toEqual([]);
});

test("mobile screenshot of the hero", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "mobile only");
  await page.goto("/");
  await page.waitForTimeout(1800); // headline entrance
  await page.screenshot({ path: "test-results/mobile-hero.png" });
});

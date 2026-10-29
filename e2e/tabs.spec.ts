import { expect, test } from "@playwright/test";

test("use-case tabs switch the industry panel", async ({ page }) => {
  await page.goto("/#use-cases");
  const panel = page.locator("#usecase-panel");
  await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Automotive");
  await page.getByRole("tab", { name: "Banking & Finance" }).click();
  await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Banking & Finance");
  await expect(page.getByRole("tab", { name: "Banking & Finance" })).toHaveAttribute("aria-selected", "true");
});

test("solutions tabs are keyboard navigable", async ({ page }) => {
  await page.goto("/#solutions");
  const tabs = page.getByRole("tablist", { name: "AuGENT solutions" }).getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
});

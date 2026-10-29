import { expect, test } from "@playwright/test";

test("capability cards lock open on click and unlock on outside click / Escape", async ({ page }) => {
  await page.goto("/#core-capabilities");
  const card = page.locator(".mag-card").first();
  const toggle = card.getByRole("button", { name: "Agentic Workflow Engine" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(card.locator(".mag-desc")).not.toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(card.locator(".mag-desc")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await page.locator(".capabilities .heading-title").first().click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("the nearest card is pulled toward the cursor (desktop only), capped at 1.06x", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "magnet is disabled on touch / small screens");
  await page.goto("/#core-capabilities");
  const cards = page.locator(".mag-card");
  await expect(cards).toHaveCount(7);
  await page.waitForTimeout(1500); // anchor smooth-scroll and the reveal animation settle first
  const box = (await cards.nth(1).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 30, { steps: 8 });
  await page.waitForTimeout(900);
  const scale = await cards.nth(1).evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(scale).toBeGreaterThan(1.005);
  expect(scale).toBeLessThanOrEqual(1.0601);
});

test("on mobile the cards never move on their own", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "mobile only");
  await page.goto("/#core-capabilities");
  await page.waitForTimeout(600);
  const transform = await page.locator(".mag-card").first().evaluate((el) => (el as HTMLElement).style.transform);
  expect(transform).toBe("");
});

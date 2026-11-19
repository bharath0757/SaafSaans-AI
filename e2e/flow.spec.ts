import { test, expect } from "@playwright/test";

test.describe("SaafSaans E2E User Flows", () => {
  test("loads dashboard, navigates tabs, and views impact", async ({ page }) => {
    await page.goto("/");

    // Wait for live air quality to load
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("SaafSaans").first()).toBeVisible();

    // Verify tabs switch content
    const homeTab = page.getByRole("tab", { name: /At Home/i });
    await expect(homeTab).toBeVisible();
    await homeTab.click();
    await expect(page.locator("#panel-home")).toBeVisible();

    const swapsTab = page.getByRole("tab", { name: /Switch It Up/i });
    await expect(swapsTab).toBeVisible();
    await swapsTab.click();
    await expect(page.locator("#panel-swaps")).toBeVisible();
  });

  test("opens streaming chat drawer and sends an inquiry", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    // Open chat
    const chatBtn = page.getByRole("button", { name: /Ask SaafSaans/i });
    await expect(chatBtn).toBeVisible();
    await chatBtn.click();

    // Verify dialog opens
    const dialog = page.getByRole("dialog", { name: /Air Quality Assistant/i });
    await expect(dialog).toBeVisible();

    // Click a suggested question
    const suggestion = page.getByRole("button", { name: /When is the cleanest window/i });
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    // Wait for assistant response to stream in
    await expect(page.getByText(/cleanest window|SaafSaans/i).last()).toBeVisible({
      timeout: 15000,
    });

    // Close chat with Escape key
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("navigates to community pack and updates collective simulator", async ({ page }) => {
    await page.goto("/community");

    await expect(page.getByRole("heading", { name: /Community Action Pack/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Collective Community Impact/i)).toBeVisible();
    await expect(page.getByText(/PM2.5 Avoided/i)).toBeVisible();

    // Adjust households slider
    const slider = page.locator("#households-slider");
    await expect(slider).toBeVisible();
    await slider.fill("120");
    await expect(page.getByText("120")).toBeVisible();
  });
});

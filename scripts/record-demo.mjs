import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, durationMs = 1000) {
  await page.evaluate(
    async ({ targetY, durationMs }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();
      return new Promise((resolve) => {
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          const ease =
            progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    },
    { targetY, durationMs },
  );
  await sleep(durationMs + 200);
}

async function demonstrateOnboarding(page) {
  const editLocationBtn = page.getByRole("button", { name: /change location/i });
  if (!(await editLocationBtn.isVisible())) return;

  await editLocationBtn.click();
  await sleep(1500);

  const searchInput = page.getByPlaceholder(/search city or neighbourhood/i);
  if (await searchInput.isVisible()) {
    await searchInput.fill("Anand Vihar");
    await sleep(1500);
    const firstResult = page
      .locator("button:has-text('Anand Vihar'), button:has-text('Delhi')")
      .first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await sleep(1000);
    }
  }

  const nextBtn = page.getByRole("button", { name: /next/i }).first();
  if (!(await nextBtn.isVisible())) return;

  await nextBtn.click();
  await sleep(1500);
  const childrenToggle = page.locator("#toggle-children");
  if (await childrenToggle.isVisible()) await childrenToggle.click();

  await page.getByRole("button", { name: /next/i }).first().click();
  await sleep(1500);

  const saveBtn = page.getByRole("button", { name: /save and view plan|save/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await sleep(2500);
  }
}

async function demonstrateDashboardHero(page) {
  await smoothScroll(page, 150, 800);
  await sleep(2500);

  const cpcbDetails = page
    .locator("summary:has-text('CPCB Breakpoints'), summary:has-text('View scale')")
    .first();
  if (await cpcbDetails.isVisible()) {
    await cpcbDetails.click();
    await sleep(1500);
    await cpcbDetails.click();
    await sleep(800);
  }

  await smoothScroll(page, 450, 800);
  await sleep(2000);
  const tableToggle = page.getByRole("button", { name: /show as table/i }).first();
  if (await tableToggle.isVisible()) {
    await tableToggle.click();
    await sleep(2000);
    const visualToggle = page.getByRole("button", { name: /show visual cards/i }).first();
    if (await visualToggle.isVisible()) {
      await visualToggle.click();
      await sleep(1500);
    }
  }
}

async function demonstratePlanTabs(page) {
  await smoothScroll(page, 750, 800);
  await sleep(1500);

  const homeTab = page.getByRole("tab", { name: /at home/i }).first();
  if (await homeTab.isVisible()) {
    await homeTab.click();
    await sleep(2500);
  }

  const swapsTab = page.getByRole("tab", { name: /switch it up/i }).first();
  if (await swapsTab.isVisible()) {
    await swapsTab.click();
    await sleep(2500);
  }

  const todayTab = page.getByRole("tab", { name: /today/i }).first();
  if (await todayTab.isVisible()) {
    await todayTab.click();
    await sleep(1500);
  }

  await smoothScroll(page, 1100, 800);
  await sleep(2000);
  const formulasDetails = page
    .locator("summary:has-text('Formulas'), summary:has-text('assumptions')")
    .first();
  if (await formulasDetails.isVisible()) {
    await formulasDetails.click();
    await sleep(2500);
  }
}

async function demonstrateLocalization(page) {
  await smoothScroll(page, 0, 800);
  await sleep(1200);

  const hindiBtn = page.getByRole("button", { name: /हिंदी|hi/i }).first();
  if (await hindiBtn.isVisible()) {
    await hindiBtn.click();
    await sleep(2500);
  }

  const teluguBtn = page.getByRole("button", { name: /తెలుగు|te/i }).first();
  if (await teluguBtn.isVisible()) {
    await teluguBtn.click();
    await sleep(2500);
  }

  const englishBtn = page.getByRole("button", { name: /english|en/i }).first();
  if (await englishBtn.isVisible()) {
    await englishBtn.click();
    await sleep(1500);
  }
}

async function demonstrateCommunityPack(page) {
  const communityLink = page.getByRole("link", { name: /community/i }).first();
  if (!(await communityLink.isVisible())) return;

  await communityLink.click();
  await page.waitForURL("**/community", { timeout: 10000 });
  await sleep(2000);

  const slider = page.locator("#households-slider");
  if (await slider.isVisible()) {
    await smoothScroll(page, 300, 600);
    await slider.fill("75");
    await sleep(1500);
    await slider.fill("200");
    await sleep(1500);
  }

  const shareBtn = page.getByRole("button", { name: /share|copy link/i }).first();
  if (await shareBtn.isVisible()) {
    await shareBtn.click();
    await sleep(1500);
  }

  const homeLink = page.getByRole("link", { name: /saafsaans|today/i }).first();
  await homeLink.click();
  await page.waitForURL("**/", { timeout: 10000 });
  await sleep(1500);
}

async function demonstrateChat(page) {
  const chatBtn = page.getByRole("button", { name: /ask saafsaans/i }).first();
  if (!(await chatBtn.isVisible())) return;

  await chatBtn.click();
  await sleep(2000);

  const suggestionChip = page
    .locator("button:has-text('DIY'), button:has-text('cleanest window')")
    .first();
  if (await suggestionChip.isVisible()) {
    await suggestionChip.click();
    await sleep(6000);
  }

  const chatInput = page.getByPlaceholder(/ask about air quality/i);
  if (await chatInput.isVisible()) {
    await chatInput.fill("When is the best time to go for a run today?");
    await sleep(800);
    const sendBtn = page.getByRole("button", { name: /send/i }).first();
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
      await sleep(6000);
    }
  }

  await page.keyboard.press("Escape");
  await sleep(1500);
}

async function recordDemo() {
  const outputDir = path.resolve(process.cwd(), "demo-recordings");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: outputDir, size: { width: 1280, height: 720 } },
  });

  const page = await context.newPage();
  try {
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await sleep(1500);
    await demonstrateOnboarding(page);
    await demonstrateDashboardHero(page);
    await demonstratePlanTabs(page);
    await demonstrateLocalization(page);
    await demonstrateCommunityPack(page);
    await demonstrateChat(page);
    await smoothScroll(page, 0, 800);
    await sleep(2000);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();
    if (videoObj) {
      const vPath = await videoObj.path();
      const dest = path.resolve(outputDir, "SaafSaans-Project-Demo.webm");
      if (fs.existsSync(vPath)) fs.copyFileSync(vPath, dest);
    }
  }
}

recordDemo().catch((err) => {
  console.error("Recording error:", err);
  process.exit(1);
});

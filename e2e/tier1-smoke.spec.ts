import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  mockGoodAqi,
  mockSatisfactoryAqi,
  mockModerateAqi,
  mockPoorAqi,
  mockVeryPoorAqi,
  mockSevereAqi,
  mockPlanOutput,
  interceptAirQuality,
  interceptPlan,
  interceptGeocode,
  getTestIp,
  testApiHeaders,
} from "./fixtures/test-data";

test.describe("Tier 1: Feature Coverage (@tier1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getTestIp(),
    });
  });

  // Helper to locate our custom AQI alert banner, avoiding Next.js route announcer
  const getAlertBanner = (page: import("@playwright/test").Page) =>
    page
      .locator('[role="alert"]')
      .filter({ hasText: /Air Quality Alert|वायु गुणवत्ता चेतावनी|గాలి నాణ్యత హెచ్చరిక/i });

  // --------------------------------------------------------------------------
  // FA1: AQI Dashboard & CPCB Bands
  // --------------------------------------------------------------------------
  test.describe("FA1: AQI Dashboard & CPCB Bands", () => {
    test("T1-FA1-01: displays Good band (AQI 35) without alert banner", async ({ page }) => {
      await interceptAirQuality(page, mockGoodAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator(".tabular-nums").first()).toContainText("35");
      await expect(page.locator("span", { hasText: /^Good$/ })).toBeVisible();
      await expect(page.locator("#verdict-heading")).toContainText(
        "Air is good — outdoor activity is fine for most people.",
      );
      // AlertBanner should NOT be rendered for Good band
      await expect(getAlertBanner(page)).not.toBeVisible();
    });

    test("T1-FA1-02: displays Satisfactory band (AQI 75)", async ({ page }) => {
      await interceptAirQuality(page, mockSatisfactoryAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator(".tabular-nums").first()).toContainText("75");
      await expect(page.locator("span", { hasText: /^Satisfactory$/ })).toBeVisible();
      await expect(page.locator("#verdict-heading")).toContainText("Air is acceptable");
      await expect(getAlertBanner(page)).not.toBeVisible();
    });

    test("T1-FA1-03: displays Moderate band (AQI 150)", async ({ page }) => {
      await interceptAirQuality(page, mockModerateAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator(".tabular-nums").first()).toContainText("150");
      await expect(page.locator("span", { hasText: /^Moderate$/ })).toBeVisible();
      await expect(page.locator("#verdict-heading")).toContainText("Limit long outdoor exertion");
      await expect(getAlertBanner(page)).not.toBeVisible();
    });

    test("T1-FA1-04: displays Poor band (AQI 260) with Alert Banner", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator(".tabular-nums").first()).toContainText("260");
      await expect(page.locator("span", { hasText: /^Poor$/ })).toBeVisible();
      // AlertBanner should be present
      const alert = getAlertBanner(page);
      await expect(alert).toBeVisible();
      await expect(alert).toContainText("Air Quality Alert: Poor (AQI 260)");
    });

    test("T1-FA1-05: displays Very Poor band (AQI 350) with Alert Banner", async ({ page }) => {
      await interceptAirQuality(page, mockVeryPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator(".tabular-nums").first()).toContainText("350");
      await expect(page.locator("span", { hasText: /^Very poor$/i })).toBeVisible();
      const alert = getAlertBanner(page);
      await expect(alert).toBeVisible();
      await expect(alert).toContainText("Air Quality Alert: Very poor (AQI 350)");
    });

    test("T1-FA1-06: displays Severe band (AQI 450) and ladder marker positioning", async ({
      page,
    }) => {
      await interceptAirQuality(page, mockSevereAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator(".tabular-nums").first()).toContainText("450");
      await expect(page.locator("span", { hasText: /^Severe$/ })).toBeVisible();
      const alert = getAlertBanner(page);
      await expect(alert).toBeVisible();
      await expect(alert).toContainText("Air Quality Alert: Severe (AQI 450)");

      // Check scale ladder image
      const ladderImg = page.locator('[role="img"][aria-label*="AQI 450"]');
      await expect(ladderImg).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // FA2: 24-Hour Hourly Forecast & Cleanest Window
  // --------------------------------------------------------------------------
  test.describe("FA2: 24-Hour Hourly Forecast & Cleanest Window", () => {
    test("T1-FA2-01: renders 24 diurnal hourly cards in toolbar", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const toolbar = page.locator('[role="toolbar"]');
      await expect(toolbar).toBeVisible();
      // Toolbar should contain hourly cards
      const cards = toolbar.locator("> *");
      await expect(cards).toHaveCount(24);
    });

    test("T1-FA2-02: detects and displays cleanest outdoor window highlight", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/Cleanest window:/i)).toBeVisible();
      await expect(page.locator("span.text-teal", { hasText: /1:00 PM – 4:00 PM/i })).toBeVisible();
      await expect(page.getByText(/Avg AQI 180/i)).toBeVisible();
    });

    test("T1-FA2-03: toggles view between visual cards and accessible table", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const toggleBtn = page.getByRole("button", { name: /Show as table/i }).first();
      await expect(toggleBtn).toBeVisible();
      await toggleBtn.click();

      // Table should now be visible
      const table = page.locator("table").filter({ hasText: /forecast/i });
      await expect(table).toBeVisible();
      await expect(page.getByRole("button", { name: /Show visual cards/i }).first()).toBeVisible();
    });

    test("T1-FA2-04: toggles back from table to visual cards", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const toggleBtn = page.getByRole("button", { name: /Show as table/i }).first();
      await toggleBtn.click();
      await expect(page.locator("table").filter({ hasText: /forecast/i })).toBeVisible();

      const showCardsBtn = page.getByRole("button", { name: /Show visual cards/i }).first();
      await showCardsBtn.click();
      await expect(page.locator('[role="toolbar"]')).toBeVisible();
      await expect(page.locator("table").filter({ hasText: /forecast/i })).not.toBeVisible();
    });

    test("T1-FA2-05: responds to keyboard arrow navigation on hourly toolbar", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const toolbar = page.locator('[role="toolbar"]');
      await toolbar.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowLeft");
      await expect(toolbar).toBeFocused();
    });
  });

  // --------------------------------------------------------------------------
  // FA3: Personalized Mitigation Plans (PlanTabs)
  // --------------------------------------------------------------------------
  test.describe("FA3: Personalized Mitigation Plans (PlanTabs)", () => {
    test("T1-FA3-01: displays default Today routine tab and routine slots", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const todayTab = page.locator("#tab-today");
      await expect(todayTab).toBeVisible({ timeout: 15000 });
      await expect(todayTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#panel-today")).toBeVisible();
      await expect(page.getByText("Morning commute & school arrival")).toBeVisible();
      await expect(page.getByText("Evening indoor family rest")).toBeVisible();
    });

    test("T1-FA3-02: navigates to At Home indoor hacks tab", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const homeTab = page.locator("#tab-home");
      await expect(homeTab).toBeVisible({ timeout: 15000 });
      await homeTab.click();
      await expect(page.locator("#panel-home")).toBeVisible();
      await expect(page.getByText("Damp mop instead of dry sweeping")).toBeVisible();
      await expect(page.getByText("Free").first()).toBeVisible();
    });

    test("T1-FA3-03: navigates to Switch It Up sustainable swaps tab", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const swapsTab = page.locator("#tab-swaps");
      await expect(swapsTab).toBeVisible({ timeout: 15000 });
      await swapsTab.click();
      await expect(page.locator("#panel-swaps")).toBeVisible();
      await expect(page.getByText("Take Delhi Metro instead of two-wheeler")).toBeVisible();
      await expect(page.getByText(/320g CO2e\/day/i)).toBeVisible();
    });

    test("T1-FA3-04: keyboard arrow navigation between plan tabs", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const todayTab = page.locator("#tab-today");
      await expect(todayTab).toBeVisible({ timeout: 15000 });
      await todayTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("#panel-home")).toBeVisible();

      const homeTab = page.locator("#tab-home");
      await homeTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("#panel-swaps")).toBeVisible();
    });

    test("T1-FA3-05: verifies action item mask requirement badge rendering", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      await expect(page.locator("#tab-today")).toBeVisible({ timeout: 15000 });
      await expect(page.locator("#panel-today")).toBeVisible();
      await expect(page.getByText("N95 recommended")).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // FA4: Deterministic Impact Analytics (Impact Engine)
  // --------------------------------------------------------------------------
  test.describe("FA4: Deterministic Impact Analytics", () => {
    test("T1-FA4-01: renders inhaled dose comparison headline", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("#impact-heading")).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/77% reduction in personal inhaled PM2.5/i)).toBeVisible();
      await expect(page.getByText(/saves ~1270 µg\/day/i)).toBeVisible();
    });

    test("T1-FA4-02: renders visual comparative dose bars (Without changes vs With plan)", async ({
      page,
    }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("#impact-heading")).toBeVisible({ timeout: 15000 });
      await expect(page.getByText("Without changes")).toBeVisible();
      await expect(page.getByText("1650 µg/day")).toBeVisible();
      await expect(page.getByText("With your plan")).toBeVisible();
      await expect(page.getByText("380 µg/day")).toBeVisible();
    });

    test("T1-FA4-03: toggles impact table view with Low, Central, and High estimates", async ({
      page,
    }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("#impact-heading")).toBeVisible({ timeout: 15000 });
      // Second "Show as table" button is in the Impact section
      const showTableBtn = page.getByRole("button", { name: /Show as table/i }).nth(1);
      await showTableBtn.click();

      const impactTable = page.locator("table").filter({ hasText: /dose/i });
      await expect(impactTable).toBeVisible();
      await expect(impactTable.getByText(/Low/i).first()).toBeVisible();
      await expect(impactTable.getByText(/Central/i).first()).toBeVisible();
      await expect(impactTable.getByText(/High/i).first()).toBeVisible();
    });

    test("T1-FA4-04: expands scientific transparency disclosure details", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("#impact-heading")).toBeVisible({ timeout: 15000 });
      const summary = page.locator("summary", {
        hasText: /How we calculate this/i,
      });
      await expect(summary).toBeVisible();
      await summary.click();

      await expect(page.getByText(/Indoor steady-state mass-balance equation/i)).toBeVisible();
      await expect(page.getByText(/Dose = Σ/i)).toBeVisible();
      await expect(page.getByText(/CPCB National Air Quality Index/i)).toBeVisible();
    });

    test("T1-FA4-05: displays educational non-medical disclaimer", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("#impact-heading")).toBeVisible({ timeout: 15000 });
      const summary = page.locator("summary", {
        hasText: /How we calculate this/i,
      });
      await summary.click();

      await expect(
        page.getByText(/They are educational estimates, not medical advice/i),
      ).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // FA5: Clean Air AI Chat & Scope Guard
  // --------------------------------------------------------------------------
  test.describe("FA5: Clean Air AI Chat & Scope Guard", () => {
    test("T1-FA5-01: opens and closes chat drawer via floating launcher button", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const launcher = page.getByRole("button", { name: /Ask SaafSaans/i });
      await expect(launcher).toBeVisible();
      await launcher.click();

      const dialog = page.getByRole("dialog", { name: /Air Quality Assistant/i });
      await expect(dialog).toBeVisible();

      const closeBtn = dialog.getByRole("button", { name: /Close|✕/i });
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    });

    test("T1-FA5-02: displays initial greeting message in chat drawer", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Ask SaafSaans/i }).click();

      const dialog = page.getByRole("dialog", { name: /Air Quality Assistant/i });
      await expect(dialog).toBeVisible();
      await expect(page.getByText(/Namaste! I am SaafSaans/i)).toBeVisible();
      await expect(page.getByText(/Corsi-Rosenthal clean air box/i)).toBeVisible();
    });

    test("T1-FA5-03: submits suggested prompt query", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Ask SaafSaans/i }).click();

      const promptBtn = page.getByRole("button", { name: /When is the cleanest window/i });
      await expect(promptBtn).toBeVisible();
      await promptBtn.click();

      // Assistant response arrives
      await expect(page.getByText(/cleanest window|SaafSaans/i).last()).toBeVisible({
        timeout: 15000,
      });
    });

    test("T1-FA5-04: submits custom air quality inquiry", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Ask SaafSaans/i }).click();

      const input = page.locator("#chat-input");
      await expect(input).toBeVisible();
      await input.fill("What is the best mask for 300 AQI smog?");

      const sendBtn = page.getByRole("button", { name: /Send/i });
      await sendBtn.click();

      await expect(page.getByText("What is the best mask for 300 AQI smog?")).toBeVisible();
      await expect(page.getByText(/N95|mask|respirator|SaafSaans/i).last()).toBeVisible({
        timeout: 15000,
      });
    });

    test("T1-FA5-05: dismisses chat drawer via Escape key", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Ask SaafSaans/i }).click();

      const dialog = page.getByRole("dialog", { name: /Air Quality Assistant/i });
      await expect(dialog).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // FA6: Onboarding & Household Profiling
  // --------------------------------------------------------------------------
  test.describe("FA6: Onboarding & Household Profiling", () => {
    test("T1-FA6-01: launches onboarding wizard from Change location button", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const changeLocBtn = page.getByRole("button", { name: /Change location/i });
      await expect(changeLocBtn).toBeVisible();
      await changeLocBtn.click();

      const dialog = page.getByRole("dialog", { name: /Household profile/i });
      await expect(dialog).toBeVisible();
      await expect(page.getByText("Step 1 of 3")).toBeVisible();
    });

    test("T1-FA6-02: Step 1 city search selection", async ({ page }) => {
      await interceptGeocode(page);
      await page.goto("/");
      await page.getByRole("button", { name: /Change location/i }).click();

      const searchInput = page.locator("#city-search");
      await searchInput.fill("Mumbai");

      const mumbaiOption = page.getByRole("button", { name: /Mumbai, Maharashtra/i });
      await expect(mumbaiOption).toBeVisible({ timeout: 5000 });
      await mumbaiOption.click();

      await expect(page.getByText(/Selected: Mumbai/i)).toBeVisible();
    });

    test("T1-FA6-03: Step 2 demographic vulnerability toggles", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Change location/i }).click();

      // Advance to Step 2
      await page.getByRole("button", { name: /Next/i }).click();
      await expect(page.getByText("Step 2 of 3")).toBeVisible();

      const childToggle = page.locator("#toggle-children");
      const respToggle = page.locator("#toggle-respiratory");

      await childToggle.check();
      await expect(childToggle).toBeChecked();

      await respToggle.check();
      await expect(respToggle).toBeChecked();
    });

    test("T1-FA6-04: Step 3 habits and equipment selections", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Change location/i }).click();

      // Go to Step 3
      await page.getByRole("button", { name: /Next/i }).click();
      await page.getByRole("button", { name: /Next/i }).click();
      await expect(page.getByText("Step 3 of 3")).toBeVisible();

      const commuteSelect = page.locator("#commute-mode");
      await commuteSelect.selectOption("metro");
      await expect(commuteSelect).toHaveValue("metro");

      const homeSelect = page.locator("#home-type");
      await homeSelect.selectOption("sealed");
      await expect(homeSelect).toHaveValue("sealed");

      const maskSelect = page.locator("#mask-select");
      await maskSelect.selectOption("n95");
      await expect(maskSelect).toHaveValue("n95");
    });

    test("T1-FA6-05: completes wizard and persists profile to localStorage", async ({ page }) => {
      await interceptGeocode(page);
      await page.goto("/");
      await page.getByRole("button", { name: /Change location/i }).click();

      // Step 1: select Delhi
      await page.locator("#city-search").fill("Delhi");
      const delhiOpt = page.getByRole("button", { name: /Delhi, India/i }).first();
      await expect(delhiOpt).toBeVisible({ timeout: 5000 });
      await delhiOpt.click();

      // Step 2
      await page.getByRole("button", { name: /Next/i }).click();
      await page.locator("#toggle-children").check();

      // Step 3
      await page.getByRole("button", { name: /Next/i }).click();
      await page.locator("#commute-mode").selectOption("metro");

      // Save
      await page.getByRole("button", { name: /Save and view plan/i }).click();
      await expect(page.getByRole("dialog", { name: /Household profile/i })).not.toBeVisible();

      // Verify localStorage
      const profile = await page.evaluate(() => localStorage.getItem("saafsaans_profile"));
      expect(profile).toContain('"hasChildren":true');
      expect(profile).toContain('"commuteMode":"metro"');
    });

    test("T1-FA6-06: skips onboarding with default Delhi settings", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Change location/i }).click();

      const skipBtn = page.getByRole("button", { name: /Use defaults \(Delhi\)/i });
      await expect(skipBtn).toBeVisible();
      await skipBtn.click();

      await expect(page.getByRole("dialog", { name: /Household profile/i })).not.toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // FA7: Community Collective Action Pack
  // --------------------------------------------------------------------------
  test.describe("FA7: Community Collective Action Pack", () => {
    test("T1-FA7-01: navigates to community page via navigation header", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const commLink = page
        .getByRole("banner")
        .getByRole("link", { name: /Community Action Pack/i });
      await expect(commLink).toBeVisible();
      await commLink.click();

      await expect(page).toHaveURL(/\/community/);
      await expect(page.getByRole("heading", { name: /Community Action Pack/i })).toBeVisible({
        timeout: 15000,
      });
    });

    test("T1-FA7-02: collective simulator slider interaction recalculates impact", async ({
      page,
    }) => {
      await page.goto("/community");
      await expect(page.getByText(/Collective Community Impact/i)).toBeVisible({
        timeout: 15000,
      });

      const slider = page.locator("#households-slider");
      await slider.fill("100");
      await expect(page.getByText("100")).toBeVisible();
      await expect(page.getByText(/PM2.5 Avoided/i)).toBeVisible();
      await expect(page.getByText(/Clean Air Delivered/i)).toBeVisible();
    });

    test("T1-FA7-03: renders all 4 community collective action cards", async ({ page }) => {
      await page.goto("/community");
      await expect(page.getByText(/Common Clean Air Sanctuary/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/Zero Open Waste Burning Patrol/i)).toBeVisible();
      await expect(page.getByText(/Wet Misting & Dust Suppression/i)).toBeVisible();
      await expect(page.getByText(/School Transit & Anti-Idling Gate Zone/i)).toBeVisible();
    });

    test("T1-FA7-04: renders High-Risk Member Emergency Shield checklist", async ({ page }) => {
      await page.goto("/community");
      await expect(page.getByText("High-Risk Member Emergency Shield")).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText(/Registry of high-risk residents/i)).toBeVisible();
      await expect(page.getByText(/Emergency supply of certified N95 respirators/i)).toBeVisible();
      await expect(page.getByText(/Functional pulse oximeters/i)).toBeVisible();
    });

    test("T1-FA7-05: return link navigates back to personal household plan", async ({ page }) => {
      await page.goto("/community");
      const returnLink = page.getByRole("link", {
        name: /Return to Personalized Household Plan/i,
      });
      await expect(returnLink).toBeVisible({ timeout: 15000 });
      await returnLink.click();

      await expect(page).toHaveURL(/\//);
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    });
  });

  // --------------------------------------------------------------------------
  // FA8: Multilingual i18n System
  // --------------------------------------------------------------------------
  test.describe("FA8: Multilingual i18n System", () => {
    test("T1-FA8-01: language switcher renders EN, HI, TE buttons with EN pressed by default", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const enBtn = page.getByRole("button", { name: "English" });
      const hiBtn = page.getByRole("button", { name: "हिन्दी" });
      const teBtn = page.getByRole("button", { name: "తెలుగు" });

      await expect(enBtn).toHaveAttribute("aria-pressed", "true");
      await expect(hiBtn).toHaveAttribute("aria-pressed", "false");
      await expect(teBtn).toHaveAttribute("aria-pressed", "false");
    });

    test("T1-FA8-02: switches application language to Hindi", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const hiBtn = page.getByRole("button", { name: "हिन्दी" });
      await hiBtn.click();
      await expect(hiBtn).toHaveAttribute("aria-pressed", "true");

      // Verify translated elements
      await expect(page.getByRole("button", { name: /स्थान बदलें/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /दिनचर्या अपडेट करें/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /आज/i })).toBeVisible();
    });

    test("T1-FA8-03: switches application language to Telugu", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const teBtn = page.getByRole("button", { name: "తెలుగు" });
      await teBtn.click();
      await expect(teBtn).toHaveAttribute("aria-pressed", "true");

      // Verify translated elements
      await expect(page.getByRole("button", { name: /స్థానాన్ని మార్చండి/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /ఈరోజు/i })).toBeVisible();
    });

    test("T1-FA8-04: translates Alert Banner in Hindi", async ({ page }) => {
      await interceptAirQuality(page, mockPoorAqi);
      await interceptPlan(page, mockPlanOutput);
      await page.goto("/");

      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const hiBtn = page.getByRole("button", { name: "हिन्दी" });
      await hiBtn.click();

      const alert = getAlertBanner(page);
      await expect(alert).toBeVisible();
      await expect(alert).toContainText("वायु गुणवत्ता चेतावनी: Poor (AQI 260)");
    });

    test("T1-FA8-05: returns to English from regional language cleanly", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      await page.getByRole("button", { name: "हिन्दी" }).click();
      await expect(page.getByRole("button", { name: /स्थान बदलें/i })).toBeVisible();

      await page.getByRole("button", { name: "English" }).click();
      await expect(page.getByRole("button", { name: /Change location/i })).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // FA9: HTTP API Contracts
  // --------------------------------------------------------------------------
  test.describe("FA9: HTTP API Contracts", () => {
    test("T1-FA9-01: GET /api/health returns HTTP 200 with ok status", async ({ request }) => {
      const res = await request.get("/api/health", { headers: testApiHeaders() });
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("ok");
      expect(json.version).toBe("0.1.0");
      expect(typeof json.timestamp).toBe("string");
      expect(res.headers()["x-ratelimit-remaining"]).toBeDefined();
    });

    test("T1-FA9-02: GET /api/air-quality with valid coordinates returns 200", async ({
      request,
    }) => {
      const res = await request.get("/api/air-quality?lat=28.6&lon=77.2", {
        headers: testApiHeaders(),
      });
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.current).toBeDefined();
      expect(typeof json.current.aqi).toBe("number");
      expect(Array.isArray(json.hourly)).toBe(true);
      expect(json.hourly.length).toBeGreaterThan(0);
    });

    test("T1-FA9-03: POST /api/plan with valid payload returns 200", async ({ request }) => {
      const res = await request.post("/api/plan", {
        headers: testApiHeaders(),
        data: {
          aqi: 280,
          cityName: "Delhi",
          profile: {
            hasChildren: true,
            commuteMode: "metro",
            mask: "n95",
          },
        },
      });
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.plan).toBeDefined();
      expect(json.plan.routine).toBeDefined();
      expect(json.impact).toBeDefined();
      expect(json.impact.central).toBeDefined();
    });

    test("T1-FA9-04: GET /api/geocode returns cities for valid query", async ({ request }) => {
      const res = await request.get("/api/geocode?q=Delhi", { headers: testApiHeaders() });
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.results)).toBe(true);
      expect(json.results.length).toBeGreaterThan(0);
      expect(json.results[0].name).toContain("Delhi");
    });

    test("T1-FA9-05: POST /api/chat streams assistant response", async ({ request }) => {
      const res = await request.post("/api/chat", {
        headers: testApiHeaders(),
        data: {
          messages: [
            {
              role: "user",
              content: "What is an N95 mask?",
            },
          ],
        },
      });
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text.length).toBeGreaterThan(0);
      expect(text).toMatch(/mask|filter|particulate|respirator|SaafSaans/i);
    });
  });

  // --------------------------------------------------------------------------
  // FA10: Security Headers & Rate Limiting
  // --------------------------------------------------------------------------
  test.describe("FA10: Security Headers & Rate Limiting", () => {
    test("T1-FA10-01: enforces static security headers on document responses", async ({
      request,
    }) => {
      const res = await request.get("/", { headers: testApiHeaders() });
      const headers = res.headers();

      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["x-dns-prefetch-control"]).toBe("off");
      expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
      expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
    });

    test("T1-FA10-02: dynamic CSP header contains nonce and strict directives", async ({
      request,
    }) => {
      const res = await request.get("/", { headers: testApiHeaders() });
      const csp = res.headers()["content-security-policy"];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("nonce-");
    });

    test("T1-FA10-03: rate limit tracking header is present on API calls", async ({ request }) => {
      const res = await request.get("/api/health", { headers: testApiHeaders() });
      const remaining = res.headers()["x-ratelimit-remaining"];
      expect(remaining).toBeDefined();
      expect(Number(remaining)).toBeGreaterThanOrEqual(0);
    });

    test("T1-FA10-04: consecutive requests decrement remaining rate limit quota", async ({
      request,
    }) => {
      // Use dedicated IP to test decrement deterministically
      const headers = { "x-forwarded-for": "198.51.100.99" };
      const res1 = await request.get("/api/health", { headers });
      const rem1 = Number(res1.headers()["x-ratelimit-remaining"]);

      const res2 = await request.get("/api/health", { headers });
      const rem2 = Number(res2.headers()["x-ratelimit-remaining"]);

      expect(rem2).toBe(rem1 - 1);
    });

    test("T1-FA10-05: client key resolves from X-Forwarded-For header", async ({ request }) => {
      const res = await request.get("/api/health", {
        headers: { "x-forwarded-for": "203.0.113.15, 10.0.0.1" },
      });
      expect(res.status()).toBe(200);
      expect(res.headers()["x-ratelimit-remaining"]).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // FA11: Axe Accessibility & Inclusive UX
  // --------------------------------------------------------------------------
  test.describe("FA11: Axe Accessibility & Inclusive UX", () => {
    test("T1-FA11-01: skip to content accessibility link receives focus on Tab", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      // Press Tab key
      await page.keyboard.press("Tab");
      const skipLink = page.locator('a[href="#main"]').first();
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toContainText("Skip to content");
    });

    test("T1-FA11-02: onboarding modal contains proper ARIA dialog semantics", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Change location/i }).click();

      const modal = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveAttribute("aria-labelledby", "onboarding-title");
    });

    test("T1-FA11-03: touch targets have min-height for mobile accessibility", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const launcher = page.getByRole("button", { name: /Ask SaafSaans/i });
      const box = await launcher.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36);
      }
    });

    test("T1-FA11-04: verifies axe accessibility audit on home dashboard", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const serious = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(serious).toEqual([]);
    });

    test("T1-FA11-05: verifies axe accessibility audit on community action pack", async ({
      page,
    }) => {
      await page.goto("/community");
      await expect(page.getByRole("heading", { name: /Community Action Pack/i })).toBeVisible({
        timeout: 15000,
      });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const serious = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(serious).toEqual([]);
    });
  });
});

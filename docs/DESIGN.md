# SaafSaans AI — Design System & Experience Specification

> **Document Status**: Complete (Phase 4 / Milestone 1)  
> **Target Audience**: Frontend Engineers, Design System Authors, QA Engineers, Accessibility Auditors  
> **Foundational Standards**: WCAG 2.2 AA/AAA, WAI-ARIA 1.2, CPCB National Air Quality Index, SCAQMD Accessible Scales

---

## 1. Executive Summary & Design Philosophy

SaafSaans ("Clean Breath" in Hindi) is a calm, evidence-based, highly accessible air quality companion engineered specifically for Indian cities during severe seasonal smog episodes.

Public discourse surrounding air pollution in South Asia frequently swings between fatalistic apathy and sensory panic. Most consumer air quality applications amplify this anxiety with aggressive crimson gauges, flashing sirens, and sensationalist warnings that induce helplessness rather than agency.

SaafSaans rejects the alarmist paradigm in favor of an **answer-first, calm, context-rich, and actionable** user experience:

1. **Answer First**: Users should not need to decipher microgram concentrations or sub-index curves to know what to do right now. The application immediately surfaces a clear, one-sentence action headline at the very top of the page.
2. **Context & Clarity**: Abstract numbers (e.g. AQI 312) are anchored in 24-hour temporal trajectories, identifying the cleanest daytime outdoor window and breaking down exposure by micro-environments (home, transit, work).
3. **Actionability Over Alarm**: Every warning is paired with practical, cost-tiered interventions (free habit shifts, low-cost room sealing, medium-cost DIY air purification, and sustainable transit swaps).
4. **Calm Aesthetic**: A restrained, editorial palette inspired by morning fog, high-grade newsprint, deep charcoal ink, and subtle teal/saffron accents.
5. **Universal Inclusion**: Uncompromising accessibility for color-vision deficiency (CVD), Windows High Contrast Mode (`forced-colors`), screen readers, keyboard-only navigation, and multilingual scripts (English, Hindi, Telugu).

---

## 2. Benchmark Pattern Synthesis (The 8 Design References)

The interface patterns in SaafSaans are synthesized from rigorous analysis of eight benchmark environmental, meteorological, and accessible design references. We adopted specific structural patterns, adapted them to the South Asian context, and explicitly rejected antipatterns.

### 2.1 Cansaas & Airly Dashboards

- **Benchmark Patterns**: Micro-environmental sensor cards, temporal context separation (real-time vs. forecast), and clean data density without sensory clutter.
- **Adopted in SaafSaans**:
  - Clear separation between the right-now verdict hero and the 24-hour hourly trajectory.
  - Micro-environment segmentation (indoor home, transit, outdoor) reflecting the reality of urban Indian exposure.
- **Adapted**: Replaced Airly's heavy reliance on proprietary colored rings with a clean horizontal linear ladder scale.
- **Rejected**: Avoided dense multi-pollutant telemetry walls (NO2, SO2, CO, O3) on the primary screen. In India, PM2.5 and PM10 drive >95% of high-smog days; extraneous pollutants are relegated to secondary disclosures.

### 2.2 AQI Me

- **Benchmark Patterns**: Human-centric impact translation; answering "What does this mean for me?" rather than "What is the sensor value?".
- **Adopted in SaafSaans**:
  - The "Answer First" pattern in `VerdictHero`: the primary headline is an actionable instruction tailored to the dominant vulnerable demographic in the household.
  - Vulnerability-tailored advice (children, elders, respiratory conditions).
- **Adapted**: Enhanced AQI Me's generic rules by coupling them with the Phase 2 deterministic impact engine (calculating actual inhaled dose reductions in micrograms).
- **Rejected**: Avoided cute illustrations or gamified badges that trivialize serious respiratory hazards.

### 2.3 Breezy Weather

- **Benchmark Patterns**: Card-based modern visual rhythm, horizontally scrolling hourly strips, smooth non-linear time navigation, and crisp icon-value pairings.
- **Adopted in SaafSaans**:
  - 24-hour horizontally scrollable hourly strip container with kinetic scroll and clear visual hierarchy.
  - Prominent visual badge highlighting the "Cleanest outdoor window" directly within the timeline.
- **Adapted**: Added full keyboard navigation (`tabindex="0"`, `ArrowLeft`/`ArrowRight`) and an accessible 1:1 data table alternative ("Show as table") to ensure complete screen reader accessibility.
- **Rejected**: Avoided full-screen animated weather backgrounds (rain/fog canvas animations) that consume battery and distract from core health guidance.

### 2.4 Forecast Bar

- **Benchmark Patterns**: Ultra-compact horizontal bar charts where bar height and color encode magnitude, allowing rapid visual scanning of peaks and troughs.
- **Adopted in SaafSaans**:
  - Proportional vertical mini-bars inside each hourly strip card, enabling users to instantly spot the afternoon ventilation dip.
- **Adapted**: Enforced dual-encoding: every hourly bar is capped with its corresponding CPCB band geometric shape icon and numerical AQI.
- **Rejected**: Avoided rainbow spectrum gradients across bars that confuse color-blind users.

### 2.5 Google Weather Redesign

- **Benchmark Patterns**: Editorial Georgia display serif headlines, spacious card-based layout, subtle 12px surface radii, and calm, pastel-tinted neutral card surfaces.
- **Adopted in SaafSaans**:
  - Typographic pairing: Classic Georgia serif for editorial headlines (`h1`, `h2`, brand) combined with robust system sans-serif for numbers and body copy.
  - Strict two-radii rule: 4px for interactive controls (buttons, inputs, chips) and 12px for content surfaces and cards.
  - Calm paper/fog background tones (`#F1F4F5`, `#FFFFFF`).
- **Adapted**: Optimized the system font stack to seamlessly fall back to Nirmala UI, Noto Sans Devanagari, and Noto Sans Telugu for Indic scripts without downloading multi-megabyte web fonts.
- **Rejected**: Avoided Google's 3D cartoon frog/weather mascots.

### 2.6 SCAQMD (South Coast Air Quality Management District) Accessible Scale

- **Benchmark Patterns**: Scientifically validated air quality color scales featuring monotonic lightness progression.
- **Adopted in SaafSaans**:
  - Relative luminance steps strictly downwards from Good (0.294) to Severe (0.011). Under grayscale conversion, monochromacy, protanopia, or deuteranopia, the scale naturally darkens as pollution worsens.
- **Adapted**: Calibrated breakpoints to the official Central Pollution Control Board (CPCB) 6-band scale (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) rather than the US EPA 6-band scale.
- **Rejected**: Avoided fluorescent purple/maroon shades that have poor text contrast.

### 2.7 Smashing Magazine Colour-Blindness Guidance

- **Benchmark Patterns**: Dual-encoding mandate (WCAG 1.4.1): color must never be the sole carrier of meaning.
- **Adopted in SaafSaans**:
  - Every AQI band is uniquely identified by a distinct geometric SVG icon:
    - **Good (0–50)**: Circle
    - **Satisfactory (51–100)**: Diamond
    - **Moderate (101–200)**: Triangle
    - **Poor (201–300)**: Square
    - **Very Poor (301–400)**: Hexagon
    - **Severe (401–500)**: Octagon
  - High-contrast text contrast verified to WCAG AAA (≥ 7:1) for body ink on paper/fog, and WCAG AA (≥ 4.5:1) for interactive teal.
  - Dark mode and forced-colors border specifications to ensure Severe and Very Poor bands remain legible.
- **Adapted**: Implemented pure, zero-dependency inline SVGs with accessible `title` attributes.

### 2.8 OPENAIR UI Guide

- **Benchmark Patterns**: Transparent civic environmental data communication: tabular alternatives, uncertainty disclosure, sensor attribution, and educational disclaimers.
- **Adopted in SaafSaans**:
  - Accessible `<table>` toggles for both the hourly forecast strip and the dual-bar personal dose impact cards.
  - Detailed scientific disclosure (`<details>` accordion) revealing the steady-state mass balance equations, personal dose formulas, and primary literature citations (CPCB, EPA Exposure Factors Handbook, Chen & Zhao).
  - Explicit educational disclaimer in the footer: _"Educational estimates only — not medical advice."_
  - Source attribution badge for Open-Meteo air quality telemetry.

---

## 3. Core Design Principles

```
+-------------------------------------------------------------------------+
|                              SAAFSAANS AI                               |
|                                                                         |
|   +-----------------------+   +-------------------------------------+   |
|   | 1. Answer First       |   | 2. Context & Trajectory             |   |
|   | One-sentence action   |   | 24-hr strip + Cleanest Window       |   |
|   +-----------------------+   +-------------------------------------+   |
|   +-----------------------+   +-------------------------------------+   |
|   | 3. Actionable Agency  |   | 4. Calm Restraint                   |   |
|   | Today / Home / Swaps  |   | Fog, Paper, Ink, Teal, Saffron      |   |
|   +-----------------------+   +-------------------------------------+   |
|   +-----------------------+   +-------------------------------------+   |
|   | 5. Universal Access   |   | 6. Dual-Encoding                    |   |
|   | WCAG AAA, forced-color|   | Shape Icon + Label + Value          |   |
|   +-----------------------+   +-------------------------------------+   |
+-------------------------------------------------------------------------+
```

### 3.1 Clarity

Information hierarchy is ruthlessly pruned. The user's eye lands first on what matters right now (the verdict action), second on the current air quality state (AQI number and ladder), and third on the personal action plan.

### 3.2 Context

A single AQI number is insufficient for planning a day. SaafSaans always contextualizes current air quality within:

- Diurnal variation (when will smog dip this afternoon?).
- Micro-environments (what is my exposure in traffic vs. inside a sealed bedroom?).
- Household risk (how do children or elderly family members shift priorities?).

### 3.3 Actionability

Every piece of data is linked to an intervention:

- AQI > 200? Highlight morning ventilation timing and N95 fit.
- Cooking on biomass or LPG? Offer induction swap metrics with estimated CO2e and PM2.5 savings.
- Commuting on two-wheeler? Show inhaled dose reduction if switching to Delhi Metro.

### 3.4 Calm Palette

Air pollution is stressful enough. The color palette provides psychological reassurance:

- **Fog (`#F1F4F5` / Dark: `#0E161A`)**: Soft ambient page background that reduces eye strain.
- **Paper (`#FFFFFF` / Dark: `#152028`)**: Pure card surfaces that establish clear elevation without drop-shadow clutter.
- **Ink (`#11222C` / Dark: `#E8EEF1`)**: Deep charcoal body text ensuring crisp legibility (> 14:1 contrast).
- **Muted (`#3E5360` / Dark: `#A8B8C0`)**: Subtle secondary metadata text (> 8:1 contrast).
- **Line (`#C9D3D8` / Dark: `#2A3A42`)**: Delicate structural dividers and card borders.
- **Teal (`#0B5D66` / Dark: `#3DB8C4`)**: Primary interactive accent, focus ring, and clean air highlight.
- **Saffron (`#8F4A00` / Dark: `#E09A4A`)**: Warm secondary accent for environmental swaps and warnings.

### 3.5 Signature Ladder Marker

The central visual anchor is the **AQI Ladder**: a continuous horizontal bar spanning 0 to 500 across the 6 CPCB bands. A sliding physical marker (`bg-ink ring-2 ring-paper`) pinpoints the exact current reading, immediately showing how close the air is to the next clean or dangerous threshold.

### 3.6 Two-Radii System

To prevent visual dissonance, only two border radii are permitted:

- `rounded-control` (`4px`): Used on buttons, input fields, checkboxes, tabs, and tag pills.
- `rounded-surface` (`12px`): Used on cards, dialogs, drawers, and major container sections.

### 3.7 Zero-Remote-Font Typography

To ensure zero external network calls, strict CSP compliance, instantaneous render times, and guaranteed offline capability, SaafSaans uses zero downloaded web fonts:

- **Display Serif**: `Georgia, Cambria, "Times New Roman", "Noto Serif Devanagari", "Noto Serif Telugu", serif`
- **Body & Numerical Sans**: `system-ui, "Segoe UI", "Nirmala UI", Roboto, "Noto Sans", "Noto Sans Devanagari", "Noto Sans Telugu", sans-serif`

---

## 4. Contrast & Accessibility Specifications

```
Dual-Encoding Matrix:
+--------------+---------+-----------+------------+-----------------------+
| CPCB Band    | Range   | Hex Color | Shape Icon | Relative Luminance    |
+--------------+---------+-----------+------------+-----------------------+
| Good         | 0-50    | #30A85C   | Circle     | 0.294 (Lightest)      |
| Satisfactory | 51-100  | #6B9018   | Diamond    | 0.231                 |
| Moderate     | 101-200 | #8A6200   | Triangle   | 0.141                 |
| Poor         | 201-300 | #9A3800   | Square     | 0.097                 |
| Very Poor    | 301-400 | #701028   | Hexagon    | 0.040                 |
| Severe       | 401-500 | #3A0810   | Octagon    | 0.011 (Darkest)       |
+--------------+---------+-----------+------------+-----------------------+
```

### 4.1 Dual-Encoding for Colour-Vision Deficiency (CVD)

Color is **never** the sole signifier. Every instance of an AQI band display must satisfy the Trinity Rule:

1. **Geometric Shape Icon**: Circle, Diamond, Triangle, Square, Hexagon, or Octagon rendered as inline SVG.
2. **Explicit Text Label**: "Good", "Satisfactory", "Moderate", "Poor", "Very poor", or "Severe" always rendered adjacent to or within the component.
3. **Calibrated Color**: Background or stroke tinted with the designated band color.

### 4.2 Light Mode Contrast Ratios

All color pairs have been mathematically verified via relative luminance:

- `ink` (`#11222C`) on `paper` (`#FFFFFF`): **16.29:1** (Exceeds WCAG AAA 7:1)
- `ink` (`#11222C`) on `fog` (`#F1F4F5`): **14.74:1** (Exceeds WCAG AAA 7:1)
- `muted` (`#3E5360`) on `paper` (`#FFFFFF`): **8.04:1** (Exceeds WCAG AAA 7:1)
- `teal` (`#0B5D66`) on `paper` (`#FFFFFF`): **7.58:1** (Exceeds WCAG AAA 7:1)
- `saffron` (`#8F4A00`) on `paper` (`#FFFFFF`): **6.67:1** (Exceeds WCAG AA 4.5:1)

### 4.3 Dark Mode Contrast & Severe Band Safety

In dark mode (`prefers-color-scheme: dark`), Severe (`#3A0810`, lum 0.011) against Dark Paper (`#152028`, lum 0.018) yields a contrast ratio of only 1.04:1. Very Poor (`#701028`, lum 0.040) yields 1.41:1.
To guarantee legibility in dark mode:

- **No Dark Text on Dark Backgrounds**: AQI values and labels in dark mode are rendered in `dark.ink` (`#E8EEF1`, contrast 14.13:1).
- **High-Contrast Badge Borders**: All AQI badges and card callouts include `border border-line` (`#2A3A42`) or `var(--color-badge-border)` (`rgba(232, 238, 241, 0.25)`).
- **Dual-Encoding Redundancy**: The shape icon and text label provide 100% recognition even if band hue perception is degraded.

### 4.4 Windows High Contrast Mode (`forced-colors: active`)

In Windows High Contrast mode:

- CSS variables automatically map to semantic system keywords:
  - `--color-fog` -> `Canvas`
  - `--color-paper` -> `Canvas`
  - `--color-ink` -> `CanvasText`
  - `--color-muted` -> `GrayText`
  - `--color-line` -> `ButtonBorder`
  - `--color-teal` -> `Highlight`
  - `--color-saffron` -> `LinkText`
- Visualization bars (AQI ladder bar segments, hourly forecast vertical bars, impact dose comparison bars) carry `.visualization-bar` with `forced-color-adjust: none` and an explicit `1px solid ButtonBorder` outline to prevent system flattening.
- All interactive controls have explicit `border: 1px solid ButtonBorder`.

### 4.5 Reduced Motion (`prefers-reduced-motion: reduce`)

When the user requests reduced motion:

- CSS transition and animation durations are clamped to `0.01ms !important`.
- The AQI ladder indicator marker jumps instantaneously to position without sliding tween.
- Smooth scrolling is disabled (`scroll-behavior: auto`).

### 4.6 Keyboard Navigation & Focus Rings

- Global `:focus-visible` styling: `3px solid var(--color-teal)` with `3px outline-offset`.
- Skip link: Accessible `<a href="#main">` fixed at the top of the viewport when focused.
- Interactive components (Hourly Strip, Plan Tabs) support full standard arrow key navigation.

---

## 5. Detailed Component Specifications

### 5.1 Onboarding Wizard (`OnboardingWizard.tsx`)

- **Purpose**: Collect lightweight household profile parameters required to run personal dose simulations without user fatigue.
- **Modal / Container**: Centered dialog or sheet with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="onboarding-title"`.
- **Step 1: Location**:
  - Primary button: "Use my location" (triggers `navigator.geolocation.getCurrentPosition`, rounds to 0.1°).
  - Secondary input: City search input querying `GET /api/geocode?q={input}` with debounced autocomplete list.
  - Default fallback: Delhi (`28.6, 77.2`). Skippable via "Use default (Delhi)" button.
  - Privacy note: _"Your location stays on your device. We do not store your coordinates."_
- **Step 2: Household Members**:
  - Accessible toggle checkboxes:
    - Children in home (`hasChildren`)
    - Elders in home (`hasElders`)
    - Respiratory condition (asthma, COPD, bronchitis) (`hasRespiratoryCondition`)
  - Plain language explanation: _"Helps us prioritize actions for sensitive lungs."_
- **Step 3: Day, Commute & Fuel**:
  - Commute mode selector: Walk, Cycle, Two-wheeler, Car, Bus, Metro.
  - Daily commute distance slider / input: 0 to 50 km (default: 10 km).
  - Cooking fuel selector: LPG, Induction, Biomass / Chulha, Kerosene.
  - Home construction toggle: Leaky (standard Indian apartment/house with natural ventilation gaps) vs. Sealed (modern airtight construction).
  - Existing equipment toggles: Air purifier (None, Small, Medium, Large), Mask (None, Cloth, Surgical, N95).
- **State Persistence**: Saved exclusively to `localStorage.getItem("saafsaans_profile")`. No personal data transmitted to server databases.

### 5.2 Verdict Hero (`VerdictHero.tsx`)

- **Purpose**: Answer-first right-now verdict that gives users immediate clarity within 2 seconds of loading.
- **Visual Layout**:
  - Top line: Location name (e.g. "New Delhi, Delhi") + updated timestamp + stale data badge if applicable.
  - Headline `<h1>`: Dynamic one-sentence verdict action derived from `current.actionSentence` or `defaultActionForBand(band.key)`. Example: _"Keep children and elders indoors this morning; outdoor air is Severe."_
  - Numerical AQI block: Large display numeral with `tabular-nums` and `<span className="sr-only">Air quality index </span>`.
  - Band badge: Geometric shape icon + band label pill with high-contrast border.
  - Integrated `AqiLadder` component.
  - Action button group: "Change location" and "Update routine" buttons (`min-h-touch min-w-touch` 44px).

### 5.3 Signature AQI Ladder (`AqiLadder.tsx`)

- **Purpose**: Provide spatial intuition of where current air quality falls along the CPCB spectrum.
- **Structure**:
  - Scale bar: Horizontal container (`h-3 rounded-control overflow-hidden`).
  - Segments: 6 flex children representing Good, Satisfactory, Moderate, Poor, Very Poor, Severe. Each segment styled with `backgroundColor: b.color` and class `visualization-bar`.
  - Position Marker: Absolute indicator (`h-5 w-1 rounded-control bg-ink ring-2 ring-paper`) positioned at `left: calc(${position}% - 2px)`.
  - Scale ticks: Ordered list (`<ol>`) displaying band lower limits (0, 51, 101, 201, 301, 401, 500) paired with miniature geometric SVG shape icons.
  - A11y: Container has `role="img"` and `aria-label="AQI {value}, {bandLabel}, on a scale from 0 to 500"`.

### 5.4 Hourly Forecast Strip (`HourlyStrip.tsx` & `HourlyTable.tsx`)

- **Purpose**: Allow users to plan their day and identify the cleanest daytime outdoor window.
- **Scroll Container**:
  - Horizontally scrollable flex container (`overflow-x-auto`) with `tabindex="0"`, `role="region"`, `aria-label="Hourly air quality forecast"`.
  - Keyboard listener: `ArrowLeft` / `ArrowRight` smoothly navigates focus between hourly cards.
- **Hourly Cards (24 items)**:
  - Time label (e.g. "10 AM", "1 PM").
  - Proportional vertical bar (`visualization-bar`) showing relative AQI severity.
  - Numerical AQI value (`tabular-nums`).
  - Band shape icon (`AqiBandIcon`).
  - Cleanest Window Highlight: Cards falling within `bestWindow` carry a subtle teal highlight and a badge: _"Cleanest window"_.
- **Accessible Table Alternative (`HourlyTable.tsx`)**:
  - Toggle button: "Show as table" / "Show visual cards".
  - Semantic HTML `<table>` with `<caption>Hourly Air Quality Forecast</caption>`.
  - Columns: Hour, AQI, Band, PM2.5 (µg/m³), Cleanest Window indicator.

### 5.5 Plan Tabs (`PlanTabs.tsx`)

- **Purpose**: Organize personalized interventions into manageable, contextual categories.
- **Tablist Structure**:
  - Semantic `role="tablist"` with 3 tabs:
    1. **"Today"** (`plan.routine`): Time-windowed daily routine blocks (Morning, Commute, Midday, Evening, Night) with activity, action, and location/mask badges.
    2. **"At Home"** (`plan.indoorHacks`): Low-cost indoor interventions (sealing door gaps, wet-mopping, exhaust fan protocols, DIY purifiers) with cost pills ("Free", "Low cost", "Medium cost").
    3. **"Switch It Up"** (`plan.sustainableSwaps`): Long-term sustainable transitions (metro commute swap, induction cooking swap) with environmental impact callouts (e.g. _"Saves ~350g CO2e/day"_).
  - Accessible tab switching with `ArrowLeft`/`ArrowRight` key support and `aria-selected` management.

### 5.6 Impact Cards (`ImpactCards.tsx` & `ImpactTable.tsx`)

- **Purpose**: Quantify the physical benefit of taking action, replacing feelings of helplessness with tangible progress.
- **Dual-Bar Shared Scale**:
  - Bar 1 ("Without changes"): Shows baseline inhaled dose in µg/day using neutral muted color (`var(--color-muted)`).
  - Bar 2 ("With your plan"): Shows reduced inhaled dose in µg/day using vibrant teal (`var(--color-teal)`).
  - Shared maximum scale: `maxDose = Math.max(before, after, 100)` ensuring fair visual comparison.
- **Headline Callout**:
  - _"38% reduction in inhaled PM2.5 (saves ~42 µg/day)"_.
- **Scientific Disclosure Accordion (`<details>`)**:
  - Summary: _"How we calculate this (assumptions & sources)"_.
  - Discloses:
    - Mass balance equation: $C_{in} = \frac{P \cdot a \cdot C_{out} + S/V}{a + k + \frac{CADR}{V}}$
    - Personal inhaled dose integral: $Dose = \sum \frac{C_{ambient}}{APF} \cdot InhalationRate \cdot Hours$
    - Uncertainty envelope: Low estimate (-20%), Central estimate, High estimate (+25%).
    - Primary cited literature: CPCB National AQI Guidelines (2014), US EPA Exposure Factors Handbook, Chen & Zhao (2011) building penetration parameters.
    - Disclaimer: _"Educational estimates only — not medical advice."_
- **Accessible Table Alternative (`ImpactTable.tsx`)**:
  - "Show as table" toggle rendering baseline vs. plan dose values across low, central, and high tiers.

### 5.7 Persistent Alert Banner (`AlertBanner.tsx`)

- **Purpose**: Ensure critical health hazards are unmissable when pollution reaches dangerous levels.
- **Trigger**: Active when `isAlertBand(band.key)` is true (AQI ≥ 201: Poor, Very Poor, Severe).
- **Placement**: Fixed or prominent sticky banner below header with high-visibility styling (`border-b-2 border-line bg-paper`).
- **Visuals**: Band geometric icon (Square for Poor, Hexagon for Very Poor, Octagon for Severe) + high-visibility bold alert text.
- **Copy**: Non-hysterical, specific advice. E.g. for Severe: _"Severe Air Quality Alert (AQI {aqi}): Sensitive groups should avoid all outdoor physical exertion. Keep windows shut and wear an N95 outdoors."_

### 5.8 Feedback States & Resilience

- **Loading Skeletons (`LoadingSkeleton.tsx`)**:
  - Layout-stable skeleton blocks matching the exact heights and widths of Hero, Ladder, Strip, and Cards.
  - Container marked with `aria-busy="true"` and `aria-label="Loading air quality data"`.
  - Zero cumulative layout shift (CLS).
- **Empty State (`EmptyState.tsx`)**:
  - Rendered when location search yields no results or initial state is unloaded.
  - Clear icon, friendly guidance, and quick-action chips for major Indian cities (Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata).
- **Error State (`ErrorState.tsx`)**:
  - User-facing error message explaining what failed in plain language without raw stack traces.
  - Actionable retry button: _"Try again"_ calling reload or query refetch.
  - Alternative option: _"Switch to Delhi (default)"_.
- **Stale Data Indicator (`StaleIndicator.tsx`)**:
  - Displayed when `/api/air-quality` returns `isStale: true` (e.g. Open-Meteo upstream is slow or unreachable).
  - Subtle badge: _"Showing cached data from {time}. Upstream sensor feed is temporarily delayed."_
- **Offline Fallback (`OfflineNotice.tsx`)**:
  - Listens to `window.addEventListener("offline")`.
  - Informs the user that cached local data is being shown and personal simulation remains fully functional.

### 5.9 i18n & Microcopy Guidelines

- **Supported Locales**: English (`en`), Hindi (`hi`), Telugu (`te`).
- **Tone & Style**:
  - Plain language: Avoid scientific jargon where simple terms suffice (use "indoor air cleaner" alongside "air purifier", "ventilation window" alongside "air exchange").
  - Sentence case for all headings and button labels.
  - No moralizing or guilt: Emphasize practical harm reduction.
- **Zero-Dependency Architecture**:
  - Typed dictionaries in `src/i18n/dictionaries.ts`.
  - Translation helper `t(locale, key)`.
  - Clean font rendering with native Devanagari and Telugu fallbacks.

---

## 6. Implementation Checklist & Quality Verification

To verify that any component conforms to this design specification:

1. **WCAG Contrast**: Body text > 7:1 against background, UI components > 3:1.
2. **Dual-Encoding**: Verify that disabling CSS colors entirely still leaves all 6 AQI bands distinguishable via geometric shapes and text labels.
3. **High Contrast Mode**: Activate Windows High Contrast Mode (`forced-colors: active`) and confirm all borders, ladders, and focus rings remain visible.
4. **Reduced Motion**: Enable `prefers-reduced-motion` in OS settings and confirm all slide/expand transitions are instantaneous.
5. **Axe-Core Automated Testing**: Run `axe(container)` via `vitest-axe` on every component state; assert `toHaveNoViolations()`.
6. **Keyboard Navigation**: Verify complete task flow using Tab, Shift+Tab, Enter, Space, and Arrow keys with no mouse.

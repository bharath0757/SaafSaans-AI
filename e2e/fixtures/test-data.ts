import type { Page } from "@playwright/test";
import { defaultActionForBand } from "../../src/domain/aqi";

export interface MockAqiSummary {
  coordinates: { latitude: number; longitude: number };
  current: {
    aqi: number;
    band: {
      key: "good" | "satisfactory" | "moderate" | "poor" | "veryPoor" | "severe";
      label: string;
      color: string;
      icon: string;
      min: number;
      max: number;
    };
    pm25: number;
    pm10: number;
    dominant: "pm25" | "pm10" | "none";
    actionSentence: string;
    timestamp: string;
  };
  hourly: Array<{
    time: string;
    hour: number;
    pm25: number;
    pm10: number;
    aqi: number;
    bandKey: "good" | "satisfactory" | "moderate" | "poor" | "veryPoor" | "severe";
  }>;
  bestWindow?: {
    startHour: number;
    endHour: number;
    label: string;
    avgAqi: number;
  };
  attribution: string;
  isStale: boolean;
}

export const CPCB_BANDS = {
  good: {
    key: "good" as const,
    label: "Good",
    color: "#30A85C",
    icon: "circle",
    min: 0,
    max: 50,
  },
  satisfactory: {
    key: "satisfactory" as const,
    label: "Satisfactory",
    color: "#79C24A",
    icon: "diamond",
    min: 51,
    max: 100,
  },
  moderate: {
    key: "moderate" as const,
    label: "Moderate",
    color: "#F3B737",
    icon: "triangle",
    min: 101,
    max: 200,
  },
  poor: {
    key: "poor" as const,
    label: "Poor",
    color: "#ED752F",
    icon: "square",
    min: 201,
    max: 300,
  },
  veryPoor: {
    key: "veryPoor" as const,
    label: "Very poor",
    color: "#D94237",
    icon: "hexagon",
    min: 301,
    max: 400,
  },
  severe: {
    key: "severe" as const,
    label: "Severe",
    color: "#3A0810",
    icon: "octagon",
    min: 401,
    max: 500,
  },
};

export function createMockHourly(baseAqi: number, hasBestWindow = true) {
  const points = [];
  for (let hour = 0; hour < 24; hour++) {
    let hourAqi = baseAqi;
    if (hasBestWindow && hour >= 13 && hour <= 16) {
      hourAqi = Math.max(30, Math.round(baseAqi * 0.6));
    } else if (hour >= 6 && hour <= 10) {
      hourAqi = Math.min(500, Math.round(baseAqi * 1.2));
    }

    let bandKey: keyof typeof CPCB_BANDS = "good";
    if (hourAqi > 400) bandKey = "severe";
    else if (hourAqi > 300) bandKey = "veryPoor";
    else if (hourAqi > 200) bandKey = "poor";
    else if (hourAqi > 100) bandKey = "moderate";
    else if (hourAqi > 50) bandKey = "satisfactory";

    points.push({
      time: `2026-11-20T${hour.toString().padStart(2, "0")}:00:00Z`,
      hour,
      pm25: Math.round(hourAqi * 0.75),
      pm10: Math.round(hourAqi * 1.2),
      aqi: hourAqi,
      bandKey,
    });
  }
  return points;
}

export function createAqiSummary(
  aqi: number,
  bandKey: keyof typeof CPCB_BANDS,
  bestWindow?: { startHour: number; endHour: number; label?: string; avgAqi: number },
  isStale = false,
): MockAqiSummary {
  const band = CPCB_BANDS[bandKey];
  return {
    coordinates: { latitude: 28.6, longitude: 77.2 },
    current: {
      aqi,
      band,
      pm25: Math.round(aqi * 0.75),
      pm10: Math.round(aqi * 1.2),
      dominant: "pm25",
      actionSentence: defaultActionForBand(band.key),
      timestamp: "10:00 AM",
    },
    hourly: createMockHourly(aqi, Boolean(bestWindow)),
    bestWindow: bestWindow
      ? {
          startHour: bestWindow.startHour,
          endHour: bestWindow.endHour,
          label: bestWindow.label ?? `${bestWindow.startHour}:00 – ${bestWindow.endHour}:00`,
          avgAqi: bestWindow.avgAqi,
        }
      : {
          startHour: 13,
          endHour: 16,
          label: "1:00 PM – 4:00 PM",
          avgAqi: Math.round(aqi * 0.6),
        },
    attribution: "Air quality data by Open-Meteo.com",
    isStale,
  };
}

export const mockGoodAqi = createAqiSummary(35, "good", {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 25,
});

export const mockSatisfactoryAqi = createAqiSummary(75, "satisfactory", {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 50,
});

export const mockModerateAqi = createAqiSummary(150, "moderate", {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 110,
});

export const mockPoorAqi = createAqiSummary(260, "poor", {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 180,
});

export const mockVeryPoorAqi = createAqiSummary(350, "veryPoor", {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 240,
});

export const mockSevereAqi = createAqiSummary(450, "severe", {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 290,
});

export const mockFlatSevereAqi: MockAqiSummary = {
  coordinates: { latitude: 28.6, longitude: 77.2 },
  current: {
    aqi: 320,
    band: CPCB_BANDS.veryPoor,
    pm25: 240,
    pm10: 390,
    dominant: "pm25",
    actionSentence: defaultActionForBand("veryPoor"),
    timestamp: "10:00 AM",
  },
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: `2026-11-20T${i.toString().padStart(2, "0")}:00:00Z`,
    hour: i,
    pm25: 240,
    pm10: 390,
    aqi: 320,
    bandKey: "veryPoor" as const,
  })),
  bestWindow: undefined,
  attribution: "Air quality data by Open-Meteo.com",
  isStale: false,
};

export const mockPlanOutput = {
  plan: {
    headline: "Protect your household from high ambient particulate exposure",
    summary: "Air quality is degraded today. Shift outdoor exertion and seal indoor living areas.",
    routine: [
      {
        timeWindow: "6:00 AM – 9:00 AM",
        activity: "Morning commute & school arrival",
        action: "Keep windows closed. Wear a certified N95 respirator if stepping outside.",
        location: "outdoor" as const,
        maskRecommended: true,
      },
      {
        timeWindow: "1:00 PM – 4:00 PM",
        activity: "Daytime errands & ventilation",
        action: "Optimal diurnal window. Brief ventilation permitted if purifier running.",
        location: "outdoor" as const,
        maskRecommended: false,
      },
      {
        timeWindow: "7:00 PM – 10:00 PM",
        activity: "Evening indoor family rest",
        action: "Run air purifier on medium CADR in bedroom. Wet-mop room floor.",
        location: "indoor" as const,
        maskRecommended: false,
      },
    ],
    indoorHacks: [
      {
        title: "Damp mop instead of dry sweeping",
        description:
          "Dry brooms re-suspend settled fine particulate. Wet mopping captures PM2.5 on surfaces.",
        costBand: "free" as const,
      },
      {
        title: "Door snake and window foam tape",
        description:
          "Draft proof bedroom door and window frame gaps to drop indoor infiltration by 40%.",
        costBand: "low" as const,
      },
    ],
    sustainableSwaps: [
      {
        title: "Take Delhi Metro instead of two-wheeler",
        description:
          "Travel inside filtered underground coaches instead of motorcycle through road dust corridors.",
        estimatedCo2eSaved: "320g CO2e/day",
      },
      {
        title: "Induction cooktop over unvented LPG",
        description: "Single-burner induction stove eliminates indoor NO2 and ultrafine particles.",
        estimatedCo2eSaved: "400g CO2e/day",
      },
    ],
    providerUsed: "rule-based" as const,
  },
  impact: {
    low: {
      indoorPm25Before: 140,
      indoorPm25After: 70,
      personalDoseBeforeUg: 1200,
      personalDoseAfterUg: 480,
      doseReductionPct: 60,
      doseSavedUg: 720,
      transportCo2eBeforeG: 400,
      transportCo2eAfterG: 200,
      transportCo2eSavedG: 200,
      cookingCo2eBeforeG: 500,
      cookingCo2eAfterG: 200,
      cookingCo2eSavedG: 300,
      totalCo2eSavedG: 500,
    },
    central: {
      indoorPm25Before: 180,
      indoorPm25After: 45,
      personalDoseBeforeUg: 1650,
      personalDoseAfterUg: 380,
      doseReductionPct: 77,
      doseSavedUg: 1270,
      transportCo2eBeforeG: 550,
      transportCo2eAfterG: 180,
      transportCo2eSavedG: 370,
      cookingCo2eBeforeG: 600,
      cookingCo2eAfterG: 150,
      cookingCo2eSavedG: 450,
      totalCo2eSavedG: 820,
    },
    high: {
      indoorPm25Before: 220,
      indoorPm25After: 35,
      personalDoseBeforeUg: 2100,
      personalDoseAfterUg: 315,
      doseReductionPct: 85,
      doseSavedUg: 1785,
      transportCo2eBeforeG: 700,
      transportCo2eAfterG: 150,
      transportCo2eSavedG: 550,
      cookingCo2eBeforeG: 700,
      cookingCo2eAfterG: 100,
      cookingCo2eSavedG: 600,
      totalCo2eSavedG: 1150,
    },
    formulaSummary:
      "Dose = Σ(Conc × InhalationRate × Hours / MaskFactor); C_in = (P·a·C_out + S/V)/(a + k + CADR/V)",
    primarySources: [
      "CPCB National Air Quality Index Technical Report (2014)",
      "EPA Exposure Factors Handbook (2011 Edition)",
      "Chen & Zhao (2011), Indoor air quality models and infiltration mechanics",
      "Pope & Burnett (2002), Cardiopulmonary mortality and fine particulate exposure",
    ],
  },
  appliedActions: ["mask_n95", "purifier_medium", "transit_metro", "indoor_sealing"],
};

export async function interceptAirQuality(page: Page, summary: MockAqiSummary) {
  await page.route("**/api/air-quality*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(summary),
    });
  });
}

export async function interceptPlan(page: Page, planData = mockPlanOutput) {
  await page.route("**/api/plan*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(planData),
    });
  });
}

export async function interceptGeocode(
  page: Page,
  results: Array<{ name: string; latitude: number; longitude: number; country?: string }> = [
    { name: "Mumbai, Maharashtra, India", latitude: 19.07, longitude: 72.87 },
    { name: "Delhi, India", latitude: 28.61, longitude: 77.21 },
    { name: "Bengaluru, Karnataka, India", latitude: 12.97, longitude: 77.59 },
    { name: "Noida, Uttar Pradesh, India", latitude: 28.54, longitude: 77.39 },
  ],
) {
  await page.route("**/api/geocode*", async (route) => {
    const url = new URL(route.request().url());
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const matched = results.filter((r) => r.name.toLowerCase().includes(q));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: matched.length > 0 ? matched : results }),
    });
  });
}

let ipCounter = 1;
export function getTestIp(): string {
  ipCounter = (ipCounter % 250) + 1;
  const octet2 = Math.floor(Math.random() * 200) + 10;
  const octet3 = Math.floor(Math.random() * 200) + 10;
  return `10.${octet2}.${octet3}.${ipCounter}`;
}

export function testApiHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "x-forwarded-for": getTestIp(),
    ...extra,
  };
}

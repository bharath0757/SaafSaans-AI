import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DEFAULT_LOCATION, DEFAULT_PROFILE } from "@/components/onboarding/types";
import type { ImpactMetrics } from "@/domain/impact";

const mockMetrics: ImpactMetrics = {
  indoorPm25Before: 180,
  indoorPm25After: 60,
  personalDoseBeforeUg: 1500,
  personalDoseAfterUg: 450,
  doseReductionPct: 70,
  doseSavedUg: 1050,
  transportCo2eBeforeG: 500,
  transportCo2eAfterG: 200,
  transportCo2eSavedG: 300,
  cookingCo2eBeforeG: 600,
  cookingCo2eAfterG: 200,
  cookingCo2eSavedG: 400,
  totalCo2eSavedG: 700,
};

const mockAq = {
  current: {
    aqi: 220,
    band: "Poor",
    dominantPollutant: "pm25",
    pm25: 110,
    pm10: 210,
    timestamp: "2026-11-19T10:00:00Z",
    actionSentence: "Air quality is poor.",
  },
  hourly: [],
  bestWindow: {
    startHour: 13,
    endHour: 16,
    label: "1:00 PM – 4:00 PM",
    avgAqi: 150,
  },
  isStale: false,
};

const mockPlan = {
  plan: {
    headline: "Air in Delhi is Poor",
    summary: "Follow the plan",
    routine: [],
    indoorHacks: [],
    sustainableSwaps: [],
    providerUsed: "rule-based" as const,
  },
  impact: {
    low: mockMetrics,
    central: mockMetrics,
    high: mockMetrics,
    appliedActions: [],
    formulaSummary: "",
    primarySources: [],
  },
  appliedActions: [],
};

describe("useDashboardData Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("fetches live data and persists to localStorage", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (typeof url === "string" && url.includes("/api/air-quality")) {
        return { ok: true, json: async () => mockAq } as Response;
      }
      return { ok: true, json: async () => mockPlan } as Response;
    });

    const { result } = renderHook(() => useDashboardData(DEFAULT_LOCATION, DEFAULT_PROFILE));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.airQuality?.current.aqi).toBe(220);
    expect(result.current.planData?.plan.headline).toBe("Air in Delhi is Poor");
    expect(localStorage.getItem("saafsaans_cached_aq")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("falls back to cached data with isStale=true when network request fails", async () => {
    localStorage.setItem("saafsaans_cached_aq", JSON.stringify(mockAq));
    localStorage.setItem("saafsaans_cached_plan", JSON.stringify(mockPlan));

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network offline"));

    const { result } = renderHook(() => useDashboardData(DEFAULT_LOCATION, DEFAULT_PROFILE));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.airQuality).toBeTruthy();
    expect(result.current.airQuality?.isStale).toBe(true);
    expect(result.current.planData).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  it("returns error when fetch fails and no cache exists", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDashboardData(DEFAULT_LOCATION, DEFAULT_PROFILE));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.airQuality).toBeNull();
    expect(result.current.error).toBe("Network error");
  });
});

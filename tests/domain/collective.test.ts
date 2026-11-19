import { describe, expect, it } from "vitest";
import { computeCollectiveImpact } from "@/domain/collective";
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

describe("Collective Impact Engine", () => {
  it("computes scaled impact metrics for a 50-household community", () => {
    const res = computeCollectiveImpact(50, mockMetrics);

    expect(res.households).toBe(50);
    // 1050 ug * 50 = 52,500 ug = 0.0525 g -> 0.05 g
    expect(res.totalPm25AvoidedGrams).toBe(0.05);
    // 700 g * 50 = 35,000 g = 35 kg
    expect(res.totalCo2eAvoidedKg).toBe(35);
    // 52,500 / 220 = 238.6 -> 239 cigarettes
    expect(res.totalCigarettesAvoided).toBe(239);
    // 230 * 8 * 50 = 92,000 m3
    expect(res.cleanAirVolumeM3).toBe(92000);
    expect(res.collectiveActions.length).toBe(4);
  });

  it("handles boundary values like 1 household or invalid counts gracefully", () => {
    const single = computeCollectiveImpact(1, mockMetrics);
    expect(single.households).toBe(1);
    expect(single.totalPm25AvoidedGrams).toBeGreaterThanOrEqual(0);

    const zero = computeCollectiveImpact(0, mockMetrics);
    expect(zero.households).toBe(1);

    const negative = computeCollectiveImpact(-10, mockMetrics);
    expect(negative.households).toBe(1);
  });

  it("accepts a full DayImpactSummary object as input", () => {
    const daySummary = {
      low: mockMetrics,
      central: mockMetrics,
      high: mockMetrics,
      appliedActions: [],
      formulaSummary: "Test formula",
      primarySources: [],
    };

    const res = computeCollectiveImpact(100, daySummary);
    expect(res.households).toBe(100);
    expect(res.totalCo2eAvoidedKg).toBe(70);
  });
});

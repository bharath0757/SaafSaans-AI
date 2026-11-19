import { describe, expect, it } from "vitest";
import { ACTIONS, getApplicableActions, type HouseholdProfile } from "@/domain/actions";
import { computeImpact } from "@/domain/impact";

describe("Impact Engine (Baseline vs. Plan)", () => {
  const sampleProfile: HouseholdProfile = {
    hasChildren: true,
    hasElders: false,
    hasRespiratoryCondition: false,
    commuteMode: "twoWheeler",
    commuteDistanceKm: 12,
    cookingFuel: "biomass",
    homeType: "leaky",
    purifier: "none",
    mask: "none",
    budget: "low",
  };

  it("contains pre-defined catalog actions", () => {
    expect(ACTIONS.length).toBeGreaterThanOrEqual(5);
    expect(ACTIONS.some((a) => a.category === "routine")).toBe(true);
    expect(ACTIONS.some((a) => a.category === "indoor")).toBe(true);
    expect(ACTIONS.some((a) => a.category === "alternative")).toBe(true);
  });

  it("filters applicable actions for a smoggy day", () => {
    const applicable = getApplicableActions(sampleProfile, 320);
    expect(applicable.length).toBeGreaterThanOrEqual(4);
    expect(applicable.some((a) => a.id === "wear-n95-outside")).toBe(true);
    expect(applicable.some((a) => a.id === "seal-room-gaps")).toBe(true);
    expect(applicable.some((a) => a.id === "switch-to-induction")).toBe(true);
  });

  it("computes meaningful dose and emissions reduction when actions are applied", () => {
    const applicable = getApplicableActions(sampleProfile, 280);
    const impact = computeImpact(sampleProfile, 280, applicable);

    expect(impact.central.personalDoseAfterUg).toBeLessThan(impact.central.personalDoseBeforeUg);
    expect(impact.central.doseReductionPct).toBeGreaterThan(30);
    expect(impact.central.totalCo2eSavedG).toBeGreaterThan(0);

    expect(impact.low.personalDoseBeforeUg).toBeLessThanOrEqual(
      impact.central.personalDoseBeforeUg,
    );
    expect(impact.central.personalDoseBeforeUg).toBeLessThanOrEqual(
      impact.high.personalDoseBeforeUg,
    );

    expect(impact.formulaSummary.length).toBeGreaterThan(15);
    expect(impact.primarySources.length).toBeGreaterThanOrEqual(3);
  });

  it("handles an already protected household with no additional applicable actions", () => {
    const protectedProfile: HouseholdProfile = {
      hasChildren: false,
      hasElders: false,
      hasRespiratoryCondition: false,
      commuteMode: "metro",
      commuteDistanceKm: 10,
      cookingFuel: "induction",
      homeType: "sealed",
      purifier: "medium",
      mask: "n95",
      budget: "high",
    };

    const applicable = getApplicableActions(protectedProfile, 40);
    const impact = computeImpact(protectedProfile, 40, applicable);

    expect(impact.central.doseSavedUg).toBe(0);
    expect(impact.central.doseReductionPct).toBe(0);
    expect(impact.central.totalCo2eSavedG).toBe(0);
  });
});

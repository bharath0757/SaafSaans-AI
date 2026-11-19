import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { buildDayEnvironments, computeExposure } from "@/domain/exposure";

describe("Personal Exposure - Dose Calculations", () => {
  it("computes personal dose as concentration × inhalation rate × time", () => {
    const res = computeExposure(
      [
        {
          label: "Office",
          concentration: 100,
          hours: 2,
          activity: "light",
          mask: "none",
        },
      ],
      "adult",
      "central",
    );

    expect(res.totalDose).toBeCloseTo(180, 1);
    expect(res.breakdown).toHaveLength(1);
    expect(res.breakdown[0]?.dose).toBeCloseTo(180, 1);
  });

  it("reflects higher inhalation dose during moderate exercise than rest", () => {
    const rest = computeExposure(
      [{ label: "Rest", concentration: 150, hours: 1, activity: "rest", mask: "none" }],
      "adult",
      "central",
    ).totalDose;

    const exercise = computeExposure(
      [{ label: "Exercise", concentration: 150, hours: 1, activity: "moderate", mask: "none" }],
      "adult",
      "central",
    ).totalDose;

    expect(exercise).toBeGreaterThan(rest * 2.5);
  });

  it("reduces dose proportionally when N95 mask is worn", () => {
    const unmasked = computeExposure(
      [{ label: "Outdoor", concentration: 200, hours: 2, activity: "moderate", mask: "none" }],
      "adult",
      "central",
    ).totalDose;

    const masked = computeExposure(
      [{ label: "Outdoor", concentration: 200, hours: 2, activity: "moderate", mask: "n95" }],
      "adult",
      "central",
    ).totalDose;

    expect(masked).toBeCloseTo(unmasked / 10, 1);
  });

  it("buildDayEnvironments constructs three micro-environments", () => {
    const envs = buildDayEnvironments({
      outdoorPm25: 250,
      indoorPm25: 60,
      commuteMode: "metro",
      commuteDistanceKm: 15,
      outdoorHours: 2,
      commuteHours: 1.5,
      indoorHours: 20.5,
      outdoorMask: "n95",
      commuteMask: "n95",
      outdoorActivity: "moderate",
      commuteActivity: "light",
      indoorActivity: "rest",
    });

    expect(envs).toHaveLength(3);
    expect(envs[0]?.label).toContain("Indoor");
    expect(envs[1]?.label).toBe("Outdoor");
    expect(envs[2]?.label).toContain("Commute");
  });
});

describe("Personal Exposure - Property Invariants", () => {
  it("more time in higher concentration never lowers total dose", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 10, max: 400, noNaN: true }),
        fc.float({ min: 1, max: 8, noNaN: true }),
        (conc, extraHours) => {
          const baseDose = computeExposure(
            [{ label: "Env", concentration: conc, hours: 2, activity: "light", mask: "none" }],
            "adult",
            "central",
          ).totalDose;

          const longerDose = computeExposure(
            [
              {
                label: "Env",
                concentration: conc,
                hours: 2 + extraHours,
                activity: "light",
                mask: "none",
              },
            ],
            "adult",
            "central",
          ).totalDose;

          return longerDose >= baseDose;
        },
      ),
    );
  });

  it("wearing a mask never increases dose", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 10, max: 500, noNaN: true }),
        fc.constantFrom("cloth", "surgical", "n95" as const),
        (conc, mask) => {
          const unmasked = computeExposure(
            [{ label: "Env", concentration: conc, hours: 2, activity: "moderate", mask: "none" }],
            "adult",
            "central",
          ).totalDose;

          const masked = computeExposure(
            [{ label: "Env", concentration: conc, hours: 2, activity: "moderate", mask }],
            "adult",
            "central",
          ).totalDose;

          return masked <= unmasked;
        },
      ),
    );
  });
});

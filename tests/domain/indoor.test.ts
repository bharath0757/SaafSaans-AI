import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { indoorPm25, indoorPm25Range } from "@/domain/indoor";

describe("Indoor IAQ Mass-Balance Model - Calculations", () => {
  it("computes steady-state indoor concentration accurately", () => {
    const res = indoorPm25({
      outdoorPm25: 200,
      homeType: "sealed",
      purifier: "none",
    });

    expect(res.indoorPm25).toBeCloseTo(70, 1);
    expect(res.ioRatio).toBeCloseTo(0.35, 2);
  });

  it("reduces indoor PM2.5 substantially when a purifier is added", () => {
    const withoutPurifier = indoorPm25({
      outdoorPm25: 250,
      homeType: "sealed",
      purifier: "none",
    });

    const withPurifier = indoorPm25({
      outdoorPm25: 250,
      homeType: "sealed",
      purifier: "medium",
    });

    expect(withPurifier.indoorPm25).toBeLessThan(withoutPurifier.indoorPm25);
    expect(withPurifier.indoorPm25).toBeLessThan(withoutPurifier.indoorPm25 * 0.35);
  });

  it("provides low, central, and high ranges with expected ordering", () => {
    const range = indoorPm25Range({
      outdoorPm25: 300,
      homeType: "leaky",
      purifier: "small",
    });

    expect(range.low.indoorPm25).toBeLessThanOrEqual(range.central.indoorPm25);
    expect(range.central.indoorPm25).toBeLessThanOrEqual(range.high.indoorPm25);
  });
});

describe("Indoor IAQ Mass-Balance Model - Invariants", () => {
  it("adding or upgrading a purifier never raises indoor PM2.5", () => {
    fc.assert(
      fc.property(fc.float({ min: 10, max: 800, noNaN: true }), (outdoor) => {
        const noPurifier = indoorPm25({
          outdoorPm25: outdoor,
          homeType: "leaky",
          purifier: "none",
        }).indoorPm25;

        const small = indoorPm25({
          outdoorPm25: outdoor,
          homeType: "leaky",
          purifier: "small",
        }).indoorPm25;

        const medium = indoorPm25({
          outdoorPm25: outdoor,
          homeType: "leaky",
          purifier: "medium",
        }).indoorPm25;

        const large = indoorPm25({
          outdoorPm25: outdoor,
          homeType: "leaky",
          purifier: "large",
        }).indoorPm25;

        return large <= medium && medium <= small && small <= noPurifier;
      }),
    );
  });

  it("higher outdoor PM2.5 never lowers indoor PM2.5", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 500, noNaN: true }),
        fc.float({ min: 0, max: 500, noNaN: true }),
        (c1, c2) => {
          const [lower, higher] = c1 <= c2 ? [c1, c2] : [c2, c1];
          const inLower = indoorPm25({
            outdoorPm25: lower,
            homeType: "sealed",
            purifier: "medium",
          }).indoorPm25;
          const inHigher = indoorPm25({
            outdoorPm25: higher,
            homeType: "sealed",
            purifier: "medium",
          }).indoorPm25;

          return inLower <= inHigher;
        },
      ),
    );
  });
});

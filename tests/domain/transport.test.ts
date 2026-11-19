import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import {
  compareTransport,
  getTransportSpec,
  listTransportModes,
  transitCo2e,
  transitPm25,
} from "@/domain/transport";

describe("Transport Mode Model", () => {
  it("retrieves transport specifications correctly", () => {
    const spec = getTransportSpec("metro");
    expect(spec.label).toBe("Metro");
    expect(spec.co2ePerPkm.central).toBe(22);

    const fallback = getTransportSpec("unknown" as never);
    expect(fallback.label).toBe("Walk");
  });

  it("computes PM2.5 and CO2e correctly for known modes", () => {
    expect(transitPm25(150, "twoWheeler", "central")).toBe(225);
    expect(transitPm25(150, "metro", "central")).toBe(45);
    expect(transitCo2e(10, "car", "central")).toBe(1500);
    expect(transitCo2e(10, "walk", "central")).toBe(0);
  });

  it("compares two modes accurately", () => {
    const comp = compareTransport(200, 15, "car", "metro", "central");
    expect(comp.betterForPm25).toBe("metro");
    expect(comp.betterForCo2e).toBe("metro");
    expect(comp.co2eDeltaGrams).toBeLessThan(0);
  });

  it("lists all transport modes", () => {
    const modes = listTransportModes();
    expect(modes.length).toBeGreaterThanOrEqual(6);
  });

  describe("Property-based invariants", () => {
    it("active transport (walk, cycle) always has 0 direct CO2e emissions", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.constantFrom("walk", "cycle" as const),
          (dist, mode) => {
            return transitCo2e(dist, mode, "central") === 0;
          },
        ),
      );
    });

    it("transit emissions scale proportionally with distance", () => {
      fc.assert(
        fc.property(fc.float({ min: 1, max: 50, noNaN: true }), (dist) => {
          const co2_1x = transitCo2e(dist, "car", "central");
          const co2_2x = transitCo2e(dist * 2, "car", "central");
          return Math.abs(co2_2x - co2_1x * 2) < 0.001;
        }),
      );
    });
  });
});

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { computeAqi, pm25SubIndex, pm10SubIndex } from "@/domain/pollutants";

describe("Pollutants - PM2.5 Breakpoints (24-hr average)", () => {
  it("matches CPCB Good and Satisfactory categories", () => {
    expect(pm25SubIndex(0)).toBe(0);
    expect(pm25SubIndex(30)).toBe(50);
    expect(pm25SubIndex(31)).toBeCloseTo(51, 0);
    expect(pm25SubIndex(60)).toBe(100);
  });

  it("matches CPCB Moderate and Poor categories", () => {
    expect(pm25SubIndex(61)).toBeCloseTo(101, 0);
    expect(pm25SubIndex(90)).toBe(200);
    expect(pm25SubIndex(91)).toBeCloseTo(201, 0);
    expect(pm25SubIndex(120)).toBe(300);
  });

  it("matches CPCB Very Poor and Severe categories", () => {
    expect(pm25SubIndex(121)).toBeCloseTo(301, 0);
    expect(pm25SubIndex(250)).toBe(400);
    expect(pm25SubIndex(251)).toBeCloseTo(401, 0);
    expect(pm25SubIndex(380)).toBe(500);
  });

  it("handles out of bounds concentrations", () => {
    expect(pm25SubIndex(450)).toBe(500);
    expect(pm25SubIndex(1000)).toBe(500);
    expect(Number.isNaN(pm25SubIndex(-5))).toBe(true);
  });
});

describe("Pollutants - PM10 Breakpoints (24-hr average)", () => {
  it("matches exact CPCB category boundaries", () => {
    expect(pm10SubIndex(0)).toBe(0);
    expect(pm10SubIndex(50)).toBe(50);
    expect(pm10SubIndex(51)).toBeCloseTo(51, 0);
    expect(pm10SubIndex(100)).toBe(100);
    expect(pm10SubIndex(101)).toBeCloseTo(101, 0);
    expect(pm10SubIndex(250)).toBe(200);
    expect(pm10SubIndex(251)).toBeCloseTo(201, 0);
    expect(pm10SubIndex(350)).toBe(300);
    expect(pm10SubIndex(351)).toBeCloseTo(301, 0);
    expect(pm10SubIndex(430)).toBe(400);
    expect(pm10SubIndex(431)).toBeCloseTo(401, 0);
    expect(pm10SubIndex(510)).toBe(500);
    expect(pm10SubIndex(600)).toBe(500);
  });
});

describe("Pollutants - computeAqi and Invariants", () => {
  it("determines overall AQI by the worst sub-index", () => {
    const res1 = computeAqi({ pm25: 60, pm10: 250 });
    expect(res1.aqi).toBe(200);
    expect(res1.dominant).toBe("pm10");

    const res2 = computeAqi({ pm25: 120, pm10: 100 });
    expect(res2.aqi).toBe(300);
    expect(res2.dominant).toBe("pm25");
  });

  it("handles single-pollutant and empty inputs gracefully", () => {
    const res = computeAqi({ pm25: 90 });
    expect(res.aqi).toBe(200);
    expect(res.dominant).toBe("pm25");
    expect(Number.isNaN(res.pm10SI)).toBe(true);

    const empty = computeAqi({});
    expect(empty.aqi).toBe(0);
    expect(empty.dominant).toBe("none");
  });

  it("handles floating-point concentrations in integer breakpoint gaps without returning NaN", () => {
    // PM2.5 gaps
    expect(pm25SubIndex(30.5)).toBeCloseTo(50.5, 1);
    expect(pm25SubIndex(60.5)).toBeCloseTo(100.5, 1);
    expect(pm25SubIndex(90.5)).toBeCloseTo(200.5, 1);
    expect(pm25SubIndex(120.000008)).toBeCloseTo(300.000008, 4);
    expect(pm25SubIndex(120.5)).toBeCloseTo(300.5, 1);
    expect(pm25SubIndex(250.5)).toBeCloseTo(400.5, 1);

    // PM10 gaps
    expect(pm10SubIndex(50.5)).toBeCloseTo(50.5, 1);
    expect(pm10SubIndex(100.5)).toBeCloseTo(100.5, 1);
    expect(pm10SubIndex(250.5)).toBeCloseTo(200.5, 1);
    expect(pm10SubIndex(350.5)).toBeCloseTo(300.5, 1);
    expect(pm10SubIndex(430.5)).toBeCloseTo(400.5, 1);
  });

  it("pm25SubIndex is monotonically non-decreasing", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.float({ min: 0, max: 1000, noNaN: true }),
        (c1, c2) => {
          const [smaller, larger] = c1 <= c2 ? [c1, c2] : [c2, c1];
          return pm25SubIndex(smaller) <= pm25SubIndex(larger);
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("pm10SubIndex is monotonically non-decreasing", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.float({ min: 0, max: 1000, noNaN: true }),
        (c1, c2) => {
          const [smaller, larger] = c1 <= c2 ? [c1, c2] : [c2, c1];
          return pm10SubIndex(smaller) <= pm10SubIndex(larger);
        },
      ),
      { numRuns: 1000 },
    );
  });
});

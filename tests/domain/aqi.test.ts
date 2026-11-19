import { describe, expect, it } from "vitest";
import {
  clampAqi,
  getAqiBand,
  isAlertBand,
  aqiLadderPosition,
  defaultActionForBand,
  listAqiBands,
} from "@/domain/aqi";

describe("National AQI band model", () => {
  it("clamps non-finite and out-of-range values", () => {
    expect(clampAqi(Number.NaN)).toBe(0);
    expect(clampAqi(-10)).toBe(0);
    expect(clampAqi(999)).toBe(500);
    expect(clampAqi(312.4)).toBe(312);
  });

  it("maps breakpoint boundaries to the correct band", () => {
    expect(getAqiBand(0).key).toBe("good");
    expect(getAqiBand(50).key).toBe("good");
    expect(getAqiBand(51).key).toBe("satisfactory");
    expect(getAqiBand(100).key).toBe("satisfactory");
    expect(getAqiBand(101).key).toBe("moderate");
    expect(getAqiBand(200).key).toBe("moderate");
    expect(getAqiBand(201).key).toBe("poor");
    expect(getAqiBand(300).key).toBe("poor");
    expect(getAqiBand(301).key).toBe("veryPoor");
    expect(getAqiBand(400).key).toBe("veryPoor");
    expect(getAqiBand(401).key).toBe("severe");
    expect(getAqiBand(500).key).toBe("severe");
  });

  it("flags Poor or worse for the alert banner", () => {
    expect(isAlertBand("moderate")).toBe(false);
    expect(isAlertBand("poor")).toBe(true);
    expect(isAlertBand("severe")).toBe(true);
  });

  it("places the ladder marker proportionally", () => {
    expect(aqiLadderPosition(0)).toBe(0);
    expect(aqiLadderPosition(250)).toBe(0.5);
    expect(aqiLadderPosition(500)).toBe(1);
  });

  it("returns a non-empty action sentence per band", () => {
    for (const band of listAqiBands()) {
      const action = defaultActionForBand(band.key);
      expect(action.length).toBeGreaterThan(10);
    }
  });
});

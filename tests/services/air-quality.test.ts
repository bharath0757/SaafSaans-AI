import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getAirQuality, roundCoordinate, AIR_QUALITY_ATTRIBUTION } from "@/services/air-quality";

const mockOpenMeteoPayload = {
  latitude: 28.6,
  longitude: 77.2,
  current: {
    time: "2026-11-19T14:00",
    pm2_5: 180.5,
    pm10: 290.0,
  },
  hourly: {
    time: [
      "2026-11-19T00:00",
      "2026-11-19T06:00",
      "2026-11-19T12:00",
      "2026-11-19T13:00",
      "2026-11-19T14:00",
      "2026-11-19T15:00",
      "2026-11-19T18:00",
    ],
    pm2_5: [250, 310, 160, 120, 110, 130, 280],
    pm10: [350, 420, 260, 210, 190, 220, 380],
  },
};

describe("Air Quality Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rounds coordinates to 0.1 degree for privacy and caching", () => {
    expect(roundCoordinate(28.6139)).toBe(28.6);
    expect(roundCoordinate(77.209)).toBe(77.2);
    expect(roundCoordinate(18.5204)).toBe(18.5);
  });

  it("fetches, parses, and shapes Open-Meteo air quality data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockOpenMeteoPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const summary = await getAirQuality(28.6139, 77.209);

    expect(summary.coordinates.latitude).toBe(28.6);
    expect(summary.coordinates.longitude).toBe(77.2);
    expect(summary.attribution).toBe(AIR_QUALITY_ATTRIBUTION);
    expect(summary.isStale).toBe(false);

    // Current AQI: PM2.5 181, PM10 290 -> Very Poor / Poor
    expect(summary.current.aqi).toBeGreaterThan(200);
    expect(summary.current.actionSentence.length).toBeGreaterThan(10);

    // Hourly points
    expect(summary.hourly.length).toBeGreaterThan(0);
    expect(summary.hourly[0]?.bandKey).toBeDefined();

    // Cleanest window: hours 13-16 had PM2.5 of 120, 110, 130
    expect(summary.bestWindow.label).toBeDefined();
    expect(summary.bestWindow.avgAqi).toBeGreaterThan(0);
  });

  it("serves stale data when upstream service fails if previously cached", async () => {
    // First call succeeds and caches
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockOpenMeteoPayload), { status: 200 }),
    );
    await getAirQuality(19.076, 72.877);

    // Second call fails
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const staleResult = await getAirQuality(19.076, 72.877);

    expect(staleResult).toBeDefined();
    expect(staleResult.coordinates.latitude).toBe(19.1);
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET as getAirQualityRoute } from "@/app/api/air-quality/route";
import { GET as getGeocodeRoute } from "@/app/api/geocode/route";
import { POST as postPlanRoute } from "@/app/api/plan/route";
import { POST as postChatRoute } from "@/app/api/chat/route";

const mockAirPayload = {
  latitude: 28.6,
  longitude: 77.2,
  current: { time: "2026-11-19T14:00", pm2_5: 180, pm10: 280 },
  hourly: {
    time: ["2026-11-19T12:00", "2026-11-19T13:00", "2026-11-19T14:00"],
    pm2_5: [150, 120, 110],
    pm10: [250, 210, 190],
  },
};

const mockGeocodePayload = {
  results: [
    {
      id: 1,
      name: "Delhi",
      admin1: "Delhi",
      country: "India",
      latitude: 28.65,
      longitude: 77.23,
    },
  ],
};

describe("API Route Handlers - GET", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with air quality data for valid lat/lon", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockAirPayload), { status: 200 }),
    );

    const req = new Request("http://localhost/api/air-quality?lat=28.6139&lon=77.2090");
    const res = await getAirQualityRoute(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.coordinates.latitude).toBe(28.6);
    expect(json.current.aqi).toBeGreaterThan(0);
  });

  it("returns 400 for missing or invalid coordinates", async () => {
    const req = new Request("http://localhost/api/air-quality?lat=invalid");
    const res = await getAirQualityRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("returns 200 with matched cities for geocode", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockGeocodePayload), { status: 200 }),
    );

    const req = new Request("http://localhost/api/geocode?q=delhi");
    const res = await getGeocodeRoute(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(1);
    expect(json.results[0].name).toBe("Delhi");
  });

  it("returns 400 for geocode queries shorter than 2 chars", async () => {
    const req = new Request("http://localhost/api/geocode?q=d");
    const res = await getGeocodeRoute(req);
    expect(res.status).toBe(400);
  });
});

describe("API Route Handlers - POST", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a tailored plan with no API keys using rule-based fallback", async () => {
    const req = new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aqi: 280,
        cityName: "Pune",
        profile: {
          hasChildren: true,
          commuteMode: "twoWheeler",
        },
      }),
    });

    const res = await postPlanRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.plan.providerUsed).toBe("rule-based");
    expect(json.plan.routine.length).toBeGreaterThanOrEqual(4);
    expect(json.impact.central.doseReductionPct).toBeGreaterThan(0);
    expect(json.appliedActions.length).toBeGreaterThan(0);
  });

  it("returns 400 for malformed plan request body", async () => {
    const req = new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json",
    });

    const res = await postPlanRoute(req);
    expect(res.status).toBe(400);
  });

  it("streams follow-up chat messages", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "How do I make a DIY Corsi-Rosenthal box?" }],
      }),
    });

    const res = await postChatRoute(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");

    const bodyText = await res.text();
    expect(bodyText).toContain("Corsi-Rosenthal");
  });

  it("returns 400 for empty chat message arrays", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });

    const res = await postChatRoute(req);
    expect(res.status).toBe(400);
  });
});

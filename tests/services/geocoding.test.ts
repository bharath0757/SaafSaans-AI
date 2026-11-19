import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { searchCities } from "@/services/geocoding";

const mockGeocodeResponse = {
  results: [
    {
      id: 1273294,
      name: "Delhi",
      admin1: "National Capital Territory of Delhi",
      country: "India",
      latitude: 28.65195,
      longitude: 77.23149,
    },
    {
      id: 1269843,
      name: "Hyderabad",
      admin1: "Telangana",
      country: "India",
      latitude: 17.38405,
      longitude: 78.45636,
    },
  ],
};

describe("Geocoding Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array for queries shorter than 2 chars", async () => {
    const res = await searchCities("a");
    expect(res).toEqual([]);
  });

  it("searches and returns cities with rounded coordinates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockGeocodeResponse), { status: 200 }),
    );

    const cities = await searchCities("Delhi");
    expect(cities).toHaveLength(2);
    expect(cities[0]?.name).toBe("Delhi");
    expect(cities[0]?.latitude).toBe(28.7);
    expect(cities[0]?.longitude).toBe(77.2);
    expect(cities[0]?.country).toBe("India");
  });

  it("caches repeated queries without additional fetch calls", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(mockGeocodeResponse), { status: 200 }));

    const first = await searchCities("pune");
    const second = await searchCities("pune");

    expect(first).toEqual(second);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

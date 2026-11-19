/**
 * Open-Meteo Geocoding Service.
 * Searches cities, parses coordinates with Zod, and caches query results.
 */

import { z } from "zod";
import { TtlCache } from "@/lib/cache";
import { safeFetch } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { roundCoordinate } from "@/services/air-quality";

export type GeocodedCity = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
};

const geocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        admin1: z.string().optional(),
        country: z.string().default("India"),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
});

const geocodeCache = new TtlCache<GeocodedCity[]>(24 * 60 * 60 * 1000); // 24 hours

/**
 * Search cities by text query.
 */
export async function searchCities(query: string): Promise<GeocodedCity[]> {
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) return [];

  const cached = geocodeCache.get(clean);
  if (cached) return cached.value;

  const encoded = encodeURIComponent(clean);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=5&language=en&format=json`;

  try {
    const { text, status } = await safeFetch(url);
    if (status !== 200) {
      throw new AppError("UPSTREAM", "Failed to search cities", 502);
    }

    const raw = JSON.parse(text);
    const parsed = geocodingResponseSchema.parse(raw);

    const results: GeocodedCity[] = (parsed.results ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      admin1: item.admin1,
      country: item.country,
      latitude: roundCoordinate(item.latitude),
      longitude: roundCoordinate(item.longitude),
    }));

    geocodeCache.set(clean, results);
    return results;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("UPSTREAM", "Failed to communicate with geocoding service", 502, error);
  }
}

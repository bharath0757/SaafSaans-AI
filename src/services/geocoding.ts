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

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const GEOCODE_CACHE_TTL_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;
const MIN_SEARCH_QUERY_LENGTH = 2;
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_BAD_GATEWAY = 502;
const MAX_SEARCH_RESULTS_COUNT = 5;

const geocodeCache = new TtlCache<GeocodedCity[]>(GEOCODE_CACHE_TTL_MS);

/**
 * Search cities by text query.
 */
export async function searchCities(query: string): Promise<GeocodedCity[]> {
  const clean = query.trim().toLowerCase();
  if (clean.length < MIN_SEARCH_QUERY_LENGTH) return [];

  const cached = geocodeCache.get(clean);
  if (cached) return cached.value;

  const encoded = encodeURIComponent(clean);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=${MAX_SEARCH_RESULTS_COUNT}&language=en&format=json`;

  try {
    const { text, status } = await safeFetch(url);
    if (status !== HTTP_STATUS_OK) {
      throw new AppError("UPSTREAM", "Failed to search cities", HTTP_STATUS_BAD_GATEWAY);
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
    throw new AppError(
      "UPSTREAM",
      "Failed to communicate with geocoding service",
      HTTP_STATUS_BAD_GATEWAY,
      error,
    );
  }
}

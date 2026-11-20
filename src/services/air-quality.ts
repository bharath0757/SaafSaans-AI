/**
 * Open-Meteo Air Quality & Forecast Service.
 * Fetches hourly PM2.5/PM10 readings, computes National AQI bands,
 * determines the cleanest daily window, and manages TTL caching with stale fallback.
 */

import { TtlCache } from "@/lib/cache";
import { safeFetch } from "@/lib/http";
import { AppError } from "@/lib/errors";
import {
  openMeteoResponseSchema,
  type HourlyAqiPoint,
  type BestOutdoorWindow,
  type AirQualitySummary,
  AIR_QUALITY_ATTRIBUTION,
} from "./air-quality/types";
import { roundCoordinate, processOpenMeteoData } from "./air-quality/transform";

export {
  AIR_QUALITY_ATTRIBUTION,
  openMeteoResponseSchema,
  roundCoordinate,
  type HourlyAqiPoint,
  type BestOutdoorWindow,
  type AirQualitySummary,
};

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const CACHE_TTL_MINUTES = 10;
const CACHE_STALE_MINUTES = 60;

const CACHE_TTL_MS = CACHE_TTL_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
const CACHE_STALE_MS = CACHE_STALE_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_BAD_GATEWAY = 502;

const cache = new TtlCache<AirQualitySummary>(CACHE_TTL_MS, CACHE_STALE_MS);

/**
 * Fetch air quality for given latitude and longitude.
 */
export async function getAirQuality(rawLat: number, rawLon: number): Promise<AirQualitySummary> {
  const lat = roundCoordinate(rawLat);
  const lon = roundCoordinate(rawLon);
  const cacheKey = `aq:${lat}:${lon}`;

  const cached = cache.get(cacheKey);
  if (cached && !cached.isStale) {
    return cached.value;
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5&hourly=pm10,pm2_5&timezone=auto&forecast_days=2`;

  try {
    const { text, status } = await safeFetch(url);
    if (status !== HTTP_STATUS_OK) {
      throw new AppError(
        "UPSTREAM",
        `Open-Meteo returned status ${status}`,
        HTTP_STATUS_BAD_GATEWAY,
      );
    }

    const raw = JSON.parse(text);
    const parsed = openMeteoResponseSchema.parse(raw);
    const summary = processOpenMeteoData(parsed, lat, lon, false);

    cache.set(cacheKey, summary);
    return summary;
  } catch (error) {
    if (cached) {
      return { ...cached.value, isStale: true };
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      "UPSTREAM",
      "Failed to retrieve air quality data",
      HTTP_STATUS_BAD_GATEWAY,
      error,
    );
  }
}

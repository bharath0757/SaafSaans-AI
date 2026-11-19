/**
 * Open-Meteo Air Quality & Forecast Service.
 * Fetches hourly PM2.5/PM10 readings, computes National AQI bands,
 * determines the cleanest daily window, and manages TTL caching with stale fallback.
 */

import { z } from "zod";
import { TtlCache } from "@/lib/cache";
import { safeFetch } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { computeAqi } from "@/domain/pollutants";
import { getAqiBand, defaultActionForBand, type AqiBand } from "@/domain/aqi";
import type { AqiBandKey } from "@/design/tokens";

export const AIR_QUALITY_ATTRIBUTION = "Air quality data by Open-Meteo.com (CC BY 4.0)";

const openMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current: z
    .object({
      time: z.string().optional(),
      pm2_5: z.number().nullable().optional(),
      pm10: z.number().nullable().optional(),
    })
    .optional(),
  hourly: z.object({
    time: z.array(z.string()),
    pm2_5: z.array(z.number().nullable()),
    pm10: z.array(z.number().nullable()),
  }),
});

export type HourlyAqiPoint = {
  time: string;
  hour: number;
  pm25: number;
  pm10: number;
  aqi: number;
  bandKey: AqiBandKey;
};

export type BestOutdoorWindow = {
  startHour: number;
  endHour: number;
  label: string;
  avgAqi: number;
};

export type AirQualitySummary = {
  coordinates: { latitude: number; longitude: number };
  current: {
    aqi: number;
    band: AqiBand;
    pm25: number;
    pm10: number;
    dominant: "pm25" | "pm10" | "none";
    actionSentence: string;
    timestamp: string;
  };
  hourly: HourlyAqiPoint[];
  bestWindow: BestOutdoorWindow;
  attribution: string;
  isStale: boolean;
};

export function roundCoordinate(val: number): number {
  return Math.round(val * 10) / 10;
}

const cache = new TtlCache<AirQualitySummary>(10 * 60 * 1000, 60 * 60 * 1000);

function parseHourFromIso(iso: string): number {
  const date = new Date(iso);
  return Number.isNaN(date.getHours()) ? 0 : date.getHours();
}

function findBestWindow(points: HourlyAqiPoint[]): BestOutdoorWindow {
  const daytime = points.filter((p) => p.hour >= 10 && p.hour <= 18);
  if (daytime.length === 0) {
    return { startHour: 13, endHour: 16, label: "1:00 PM – 4:00 PM", avgAqi: 150 };
  }

  let bestStart = 13;
  let minAqiSum = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= daytime.length - 3; i++) {
    const slice = daytime.slice(i, i + 3);
    const sum = slice.reduce((acc, p) => acc + p.aqi, 0);
    if (sum < minAqiSum) {
      minAqiSum = sum;
      bestStart = slice[0]?.hour ?? 13;
    }
  }

  const endHour = bestStart + 3;
  const startLabel = bestStart > 12 ? `${bestStart - 12}:00 PM` : `${bestStart}:00 AM`;
  const endLabel = endHour > 12 ? `${endHour - 12}:00 PM` : `${endHour}:00 AM`;

  return {
    startHour: bestStart,
    endHour,
    label: `${startLabel} – ${endLabel}`,
    avgAqi: Math.round(minAqiSum / 3),
  };
}

function buildHourlyPoints(data: z.infer<typeof openMeteoResponseSchema>): HourlyAqiPoint[] {
  const count = Math.min(24, data.hourly.time.length);
  const points: HourlyAqiPoint[] = [];

  for (let i = 0; i < count; i++) {
    const time = data.hourly.time[i] ?? "";
    const pm25 = data.hourly.pm2_5[i] ?? 0;
    const pm10 = data.hourly.pm10[i] ?? 0;
    const aqiRes = computeAqi({ pm25, pm10 });
    const band = getAqiBand(aqiRes.aqi);

    points.push({
      time,
      hour: parseHourFromIso(time),
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      aqi: aqiRes.aqi,
      bandKey: band.key,
    });
  }

  return points;
}

function extractCurrentPollutants(
  data: z.infer<typeof openMeteoResponseSchema>,
  firstHourly?: HourlyAqiPoint,
) {
  const pm25 = data.current?.pm2_5 ?? firstHourly?.pm25 ?? 50;
  const pm10 = data.current?.pm10 ?? firstHourly?.pm10 ?? 80;
  return { pm25, pm10 };
}

function buildCurrentReading(
  data: z.infer<typeof openMeteoResponseSchema>,
  firstHourly?: HourlyAqiPoint,
) {
  const { pm25, pm10 } = extractCurrentPollutants(data, firstHourly);
  const aqiRes = computeAqi({ pm25, pm10 });
  const band = getAqiBand(aqiRes.aqi);

  return {
    aqi: aqiRes.aqi,
    band,
    pm25: Math.round(pm25),
    pm10: Math.round(pm10),
    dominant: aqiRes.dominant,
    actionSentence: defaultActionForBand(band.key),
    timestamp: data.current?.time ?? new Date().toISOString(),
  };
}

function processOpenMeteoData(
  data: z.infer<typeof openMeteoResponseSchema>,
  lat: number,
  lon: number,
  isStale = false,
): AirQualitySummary {
  const hourly = buildHourlyPoints(data);
  const current = buildCurrentReading(data, hourly[0]);

  return {
    coordinates: { latitude: lat, longitude: lon },
    current,
    hourly,
    bestWindow: findBestWindow(hourly),
    attribution: AIR_QUALITY_ATTRIBUTION,
    isStale,
  };
}

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
    if (status !== 200) {
      throw new AppError("UPSTREAM", `Open-Meteo returned status ${status}`, 502);
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
    throw new AppError("UPSTREAM", "Failed to retrieve air quality data", 502, error);
  }
}

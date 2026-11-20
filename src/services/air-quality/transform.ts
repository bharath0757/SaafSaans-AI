/**
 * Air quality data transformation and window calculations.
 */

import { computeAqi } from "@/domain/pollutants";
import { getAqiBand, defaultActionForBand } from "@/domain/aqi";
import {
  type OpenMeteoResponse,
  type HourlyAqiPoint,
  type BestOutdoorWindow,
  type AirQualitySummary,
  AIR_QUALITY_ATTRIBUTION,
} from "./types";

const COORDINATE_PRECISION_FACTOR = 10;
const DAYTIME_START_HOUR = 10;
const DAYTIME_END_HOUR = 18;
const DEFAULT_WINDOW_START_HOUR = 13;
const DEFAULT_WINDOW_END_HOUR = 16;
const DEFAULT_WINDOW_AVG_AQI = 150;
const WINDOW_DURATION_HOURS = 3;
const HOURS_IN_HALF_DAY = 12;
const MAX_HOURLY_POINTS = 24;
const DEFAULT_FALLBACK_PM25 = 50;
const DEFAULT_FALLBACK_PM10 = 80;
const DEFAULT_FALLBACK_HOUR = 0;

/**
 * Round latitude or longitude coordinate to 1 decimal place.
 */
export function roundCoordinate(val: number): number {
  return Math.round(val * COORDINATE_PRECISION_FACTOR) / COORDINATE_PRECISION_FACTOR;
}

function parseHourFromIso(iso: string): number {
  const date = new Date(iso);
  const hour = date.getHours();
  return Number.isNaN(hour) ? DEFAULT_FALLBACK_HOUR : hour;
}

function formatHourLabel(hour: number): string {
  if (hour > HOURS_IN_HALF_DAY) {
    return `${hour - HOURS_IN_HALF_DAY}:00 PM`;
  }
  return `${hour}:00 AM`;
}

function findBestSlice(daytime: HourlyAqiPoint[]) {
  let bestStart = DEFAULT_WINDOW_START_HOUR;
  let minAqiSum = Number.POSITIVE_INFINITY;
  const maxIndex = daytime.length - WINDOW_DURATION_HOURS;

  for (let i = 0; i <= maxIndex; i++) {
    const slice = daytime.slice(i, i + WINDOW_DURATION_HOURS);
    const sum = slice.reduce((acc, p) => acc + p.aqi, 0);
    if (sum < minAqiSum) {
      minAqiSum = sum;
      bestStart = slice[0]?.hour ?? DEFAULT_WINDOW_START_HOUR;
    }
  }

  return { bestStart, minAqiSum };
}

export function findBestWindow(points: HourlyAqiPoint[]): BestOutdoorWindow {
  const daytime = points.filter((p) => p.hour >= DAYTIME_START_HOUR && p.hour <= DAYTIME_END_HOUR);
  if (daytime.length === 0) {
    return {
      startHour: DEFAULT_WINDOW_START_HOUR,
      endHour: DEFAULT_WINDOW_END_HOUR,
      label: "1:00 PM – 4:00 PM",
      avgAqi: DEFAULT_WINDOW_AVG_AQI,
    };
  }

  const { bestStart, minAqiSum } = findBestSlice(daytime);
  const endHour = bestStart + WINDOW_DURATION_HOURS;
  const startLabel = formatHourLabel(bestStart);
  const endLabel = formatHourLabel(endHour);

  return {
    startHour: bestStart,
    endHour,
    label: `${startLabel} – ${endLabel}`,
    avgAqi: Math.round(minAqiSum / WINDOW_DURATION_HOURS),
  };
}

export function buildHourlyPoints(data: OpenMeteoResponse): HourlyAqiPoint[] {
  const count = Math.min(MAX_HOURLY_POINTS, data.hourly.time.length);
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

function resolvePollutantValue(
  direct: number | null | undefined,
  hourly: number | undefined,
  fallback: number,
): number {
  if (direct !== null && direct !== undefined) return direct;
  if (hourly !== undefined) return hourly;
  return fallback;
}

export function extractCurrentPollutants(
  data: OpenMeteoResponse,
  firstHourly?: HourlyAqiPoint,
): { pm25: number; pm10: number } {
  const pm25 = resolvePollutantValue(data.current?.pm2_5, firstHourly?.pm25, DEFAULT_FALLBACK_PM25);
  const pm10 = resolvePollutantValue(data.current?.pm10, firstHourly?.pm10, DEFAULT_FALLBACK_PM10);
  return { pm25, pm10 };
}

export function buildCurrentReading(data: OpenMeteoResponse, firstHourly?: HourlyAqiPoint) {
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

export function processOpenMeteoData(
  data: OpenMeteoResponse,
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

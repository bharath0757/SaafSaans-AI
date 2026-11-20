/**
 * Types and Zod schemas for Open-Meteo Air Quality service.
 */

import { z } from "zod";
import type { AqiBandKey } from "@/design/tokens";
import type { AqiBand } from "@/domain/aqi";

export const AIR_QUALITY_ATTRIBUTION = "Air quality data by Open-Meteo.com (CC BY 4.0)";

export const openMeteoResponseSchema = z.object({
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

export type OpenMeteoResponse = z.infer<typeof openMeteoResponseSchema>;

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

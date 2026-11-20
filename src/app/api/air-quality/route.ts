/**
 * GET /api/air-quality?lat={lat}&lon={lon}
 * Returns current and 24-hour forecasted National AQI for rounded coordinates.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiRateLimiter } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import { getAirQuality } from "@/services/air-quality";
import { checkRateLimit, handleRouteError } from "../_lib/api-helpers";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const { remaining } = checkRateLimit(request.headers, apiRateLimiter);
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lat: searchParams.get("lat"),
      lon: searchParams.get("lon"),
    });
    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", "Invalid latitude or longitude parameters", 400);
    }
    const summary = await getAirQuality(parsed.data.lat, parsed.data.lon);
    return NextResponse.json(summary, {
      status: 200,
      headers: {
        "Cache-Control": summary.isStale
          ? "no-cache"
          : "public, max-age=600, stale-while-revalidate=3600",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    return handleRouteError(error, "api_air_quality_error", "Failed to retrieve air quality");
  }
}

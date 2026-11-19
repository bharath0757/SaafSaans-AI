/**
 * POST /api/plan
 * Generates a tailored daily routine and indoor guidance using the deterministic Impact Engine
 * and the configured LLM provider (or rule-based fallback).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiRateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getAqiBand } from "@/domain/aqi";
import { getApplicableActions } from "@/domain/actions";
import { computeImpact } from "@/domain/impact";
import { getLlmProvider } from "@/services/llm/provider";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  aqi: z.number().min(0).max(500),
  cityName: z.string().min(1).default("Your city"),
  ambientPm25: z.number().optional(),
  bestWindow: z
    .object({
      startHour: z.number(),
      endHour: z.number(),
      label: z.string(),
      avgAqi: z.number(),
    })
    .default({
      startHour: 13,
      endHour: 16,
      label: "1:00 PM – 4:00 PM",
      avgAqi: 150,
    }),
  profile: z
    .object({
      hasChildren: z.boolean().default(false),
      hasElders: z.boolean().default(false),
      hasRespiratoryCondition: z.boolean().default(false),
      commuteMode: z
        .enum(["walk", "cycle", "twoWheeler", "car", "bus", "metro"])
        .default("twoWheeler"),
      commuteDistanceKm: z.number().min(0).max(100).default(10),
      cookingFuel: z.enum(["lpg", "induction", "biomass", "kerosene"]).default("lpg"),
      homeType: z.enum(["sealed", "leaky"]).default("leaky"),
      purifier: z.enum(["none", "small", "medium", "large"]).default("none"),
      mask: z.enum(["none", "cloth", "surgical", "n95"]).default("none"),
      budget: z.enum(["free", "low", "medium", "high"]).default("low"),
    })
    .default({
      hasChildren: false,
      hasElders: false,
      hasRespiratoryCondition: false,
      commuteMode: "twoWheeler",
      commuteDistanceKm: 10,
      cookingFuel: "lpg",
      homeType: "leaky",
      purifier: "none",
      mask: "none",
      budget: "low",
    }),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const key = clientKeyFromHeaders(request.headers);
    const limit = apiRateLimiter.check(key);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Too many plan requests. Please wait a moment.", 429);
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw new AppError("BAD_REQUEST", "Invalid JSON request body", 400);
    }

    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError(
        "BAD_REQUEST",
        parsed.error.issues[0]?.message ?? "Invalid parameters",
        400,
      );
    }

    const { aqi, cityName, profile, bestWindow } = parsed.data;
    const band = getAqiBand(aqi);

    // Approximate ambient PM2.5 if not directly supplied (central breakpoint approximation)
    const ambientPm25 = parsed.data.ambientPm25 ?? Math.max(10, Math.round(aqi * 0.75));

    // Deterministic Impact Engine calculation
    const applicableActions = getApplicableActions(profile, aqi);
    const impact = computeImpact(profile, ambientPm25, applicableActions);

    // LLM or Rule-based generation
    const provider = getLlmProvider();
    const plan = await provider.generatePlan({
      profile,
      aqi,
      bandLabel: band.label,
      cityName,
      bestWindow,
      impact,
      applicableActions,
    });

    return NextResponse.json(
      {
        plan,
        impact,
        appliedActions: applicableActions,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(toErrorResponse(error), { status: error.status });
    }
    logger.error("api_plan_error", { error: String(error) });
    const internal = new AppError("INTERNAL", "Failed to generate plan", 500);
    return NextResponse.json(toErrorResponse(internal), { status: 500 });
  }
}

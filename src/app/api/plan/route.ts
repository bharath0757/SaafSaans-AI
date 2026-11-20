/**
 * POST /api/plan
 * Generates a tailored daily routine and indoor guidance using the deterministic Impact Engine.
 */

import { NextResponse } from "next/server";
import { apiRateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getAqiBand } from "@/domain/aqi";
import { getApplicableActions } from "@/domain/actions";
import { computeImpact } from "@/domain/impact";
import { getLlmProvider } from "@/services/llm/provider";
import { planRequestSchema, type PlanRequestBody } from "./schema";

export const dynamic = "force-dynamic";

const PM25_SCALER = 0.75;
const MIN_AMBIENT_PM25 = 10;

async function executePlan(data: PlanRequestBody) {
  const { aqi, cityName, profile, bestWindow } = data;
  const band = getAqiBand(aqi);
  const ambientPm25 = data.ambientPm25 ?? Math.max(MIN_AMBIENT_PM25, Math.round(aqi * PM25_SCALER));
  const applicableActions = getApplicableActions(profile, aqi);
  const impact = computeImpact(profile, ambientPm25, applicableActions);
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
  return { plan, impact, appliedActions: applicableActions };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const key = clientKeyFromHeaders(request.headers);
    const limit = apiRateLimiter.check(key);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Too many plan requests. Please wait a moment.", 429);
    }
    const json = await request.json().catch(() => {
      throw new AppError("BAD_REQUEST", "Invalid JSON request body", 400);
    });
    const parsed = planRequestSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError(
        "BAD_REQUEST",
        parsed.error.issues[0]?.message ?? "Invalid parameters",
        400,
      );
    }
    const result = await executePlan(parsed.data);
    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(limit.remaining) },
    });
  } catch (error) {
    if (error instanceof AppError)
      return NextResponse.json(toErrorResponse(error), { status: error.status });
    logger.error("api_plan_error", { error: String(error) });
    return NextResponse.json(
      toErrorResponse(new AppError("INTERNAL", "Failed to generate plan", 500)),
      { status: 500 },
    );
  }
}

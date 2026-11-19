/**
 * POST /api/chat
 * Streamed air quality follow-up assistant grounded in the user's plan.
 */

import { z } from "zod";
import { apiRateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getLlmProvider } from "@/services/llm/provider";
import { planOutputSchema } from "@/services/llm/types";

export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
  planContext: planOutputSchema.optional(),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const key = clientKeyFromHeaders(request.headers);
    const limit = apiRateLimiter.check(key);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Too many chat messages. Please wait a moment.", 429);
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw new AppError("BAD_REQUEST", "Invalid JSON request body", 400);
    }

    const parsed = chatRequestSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid messages", 400);
    }

    const { messages, planContext } = parsed.data;
    const provider = getLlmProvider();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of provider.streamChat(messages, planContext)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (streamError) {
          logger.error("chat_stream_error", { error: String(streamError) });
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(toErrorResponse(error), { status: error.status });
    }
    logger.error("api_chat_error", { error: String(error) });
    const internal = new AppError("INTERNAL", "Chat service unavailable", 500);
    return Response.json(toErrorResponse(internal), { status: 500 });
  }
}

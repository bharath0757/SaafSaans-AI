/**
 * POST /api/chat
 * Streamed air quality follow-up assistant grounded in the user's plan.
 */

import { z } from "zod";
import { apiRateLimiter } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getLlmProvider } from "@/services/llm/provider";
import { planOutputSchema, type PlanOutput, type ChatMessage } from "@/services/llm/types";
import { checkChatScope, getOutOfScopeReply } from "@/domain/scope-guard";
import { checkRateLimit, handleRouteError } from "../_lib/api-helpers";

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

function createGuardedStream(
  messages: ChatMessage[],
  planContext?: PlanOutput,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const lastUserMessage = messages[messages.length - 1]?.content ?? "";
  const scope = checkChatScope(lastUserMessage);

  if (!scope.inScope) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(getOutOfScopeReply()));
        controller.close();
      },
    });
  }

  const provider = getLlmProvider();
  return new ReadableStream({
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
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { remaining } = checkRateLimit(
      request.headers,
      apiRateLimiter,
      "Too many chat messages. Please wait a moment.",
    );
    const json = await request.json().catch(() => {
      throw new AppError("BAD_REQUEST", "Invalid JSON request body", 400);
    });
    const parsed = chatRequestSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid messages", 400);
    }
    const stream = createGuardedStream(parsed.data.messages, parsed.data.planContext);
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    return handleRouteError(error, "api_chat_error", "Chat service unavailable");
  }
}

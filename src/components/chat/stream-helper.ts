import type { PlanOutput } from "@/services/llm/types";
import type { MessageItem } from "./types";

export async function readChatStream(
  messages: MessageItem[],
  planContext: PlanOutput | undefined,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const payloadMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: payloadMessages,
      planContext,
    }),
  });

  if (!res.ok) {
    throw new Error("Chat request failed");
  }

  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

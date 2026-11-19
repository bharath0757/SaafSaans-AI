import type { MessageItem } from "./types";

type Props = {
  messages: MessageItem[];
};

export function ChatMessageList({ messages }: Props) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      className="flex-1 space-y-4 overflow-y-auto p-4"
    >
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span>{isUser ? "You" : "SaafSaans Assistant"}</span>
              <span aria-hidden="true">{isUser ? "👤" : "🍃"}</span>
            </div>
            <div
              className={`max-w-[85%] rounded-card px-4 py-3 text-sm leading-relaxed shadow-sm ${
                isUser ? "bg-teal text-paper font-medium" : "border border-line bg-surface text-ink"
              }`}
            >
              {m.content}
              {m.isStreaming && (
                <span
                  className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-current"
                  aria-label="Streaming response"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

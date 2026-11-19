import { useState, useEffect } from "react";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import type { PlanOutput } from "@/services/llm/types";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSuggestedPrompts } from "./ChatSuggestedPrompts";
import { ChatInputForm } from "./ChatInputForm";
import { readChatStream } from "./stream-helper";
import type { MessageItem } from "./types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  planContext?: PlanOutput;
};

const INITIAL_MESSAGE: MessageItem = {
  id: "initial",
  role: "assistant",
  content:
    "Namaste! I am SaafSaans, your winter smog assistant. Ask me anything about today's AQI, respirator fit, or building a DIY Corsi-Rosenthal clean air box.",
};

export function ChatDrawer({ isOpen, onClose, locale, planContext }: Props) {
  const [messages, setMessages] = useState<MessageItem[]>([INITIAL_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (content: string) => {
    const userMsg: MessageItem = { id: `u-${Date.now()}`, role: "user", content };
    const assistantMsgId = `a-${Date.now()}`;
    const initialAssistant: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, initialAssistant]);
    setIsStreaming(true);

    try {
      await readChatStream(nextMessages, planContext, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m)),
        );
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: "Unable to connect to assistant. Please try again." }
            : m,
        ),
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m)),
      );
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={t(locale, "chatTitle")}
        aria-modal="true"
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xl">
              🍃
            </span>
            <h2 className="font-display font-semibold text-ink">{t(locale, "chatTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(locale, "chatClose")}
            className="rounded-control p-1.5 text-muted hover:bg-surface hover:text-ink focus:outline-none focus:ring-2 focus:ring-teal"
          >
            ✕
          </button>
        </div>
        <ChatMessageList messages={messages} />
        <ChatSuggestedPrompts onSelectPrompt={handleSend} disabled={isStreaming} />
        <ChatInputForm locale={locale} disabled={isStreaming} onSend={handleSend} />
      </div>
    </div>
  );
}

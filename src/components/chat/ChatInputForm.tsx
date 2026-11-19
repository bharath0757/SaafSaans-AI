import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  locale: Locale;
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function ChatInputForm({ locale, disabled, onSend }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-paper p-4">
      <div className="flex gap-2">
        <label htmlFor="chat-input" className="sr-only">
          {t(locale, "chatPlaceholder")}
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(locale, "chatPlaceholder")}
          disabled={disabled}
          maxLength={1000}
          className="flex-1 rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-control bg-teal px-4 py-2 text-sm font-semibold text-paper transition hover:bg-teal-hover focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50"
        >
          {t(locale, "chatSend")}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">{t(locale, "chatDisclaimer")}</p>
    </form>
  );
}

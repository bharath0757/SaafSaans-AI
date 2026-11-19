type Props = {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
};

const SUGGESTIONS = [
  "When is the cleanest window to ventilate today?",
  "Which mask is recommended for two-wheeler commute?",
  "How can I build an affordable Corsi-Rosenthal box?",
];

export function ChatSuggestedPrompts({ onSelectPrompt, disabled }: Props) {
  return (
    <div className="border-t border-line bg-surface/60 px-4 py-3">
      <p className="mb-2 text-xs font-semibold text-muted">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(s)}
            className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition hover:border-teal hover:text-teal disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

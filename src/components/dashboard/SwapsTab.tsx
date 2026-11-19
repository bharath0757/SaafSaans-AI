import type { PlanOutput } from "@/services/llm/types";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  swaps: PlanOutput["sustainableSwaps"];
  locale: Locale;
};

export function SwapsTab({ swaps, locale }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {swaps.map((swap, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between rounded-surface border border-line bg-paper p-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-sans text-base font-semibold text-ink">{swap.title}</h3>
              <span className="shrink-0 rounded-control bg-saffron/15 px-2 py-0.5 text-xs font-semibold text-saffron">
                {t(locale, "co2SavedPill")} {swap.estimatedCo2eSaved}
              </span>
            </div>
            <p className="text-sm text-muted">{swap.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

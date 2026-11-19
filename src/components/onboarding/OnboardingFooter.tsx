import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  locale: Locale;
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onSkip: () => void;
};

export function OnboardingFooter({ locale, step, onBack, onNext, onSave, onSkip }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <button
        type="button"
        onClick={onSkip}
        className="text-sm font-medium text-muted hover:text-ink focus-visible:outline focus-visible:outline-teal"
      >
        {t(locale, "skipDefaults")}
      </button>
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-control border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-fog focus-visible:outline focus-visible:outline-teal"
          >
            {t(locale, "back")}
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={onNext}
            className="rounded-control bg-teal px-4 py-2 text-sm font-medium text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-teal"
          >
            {t(locale, "next")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            className="rounded-control bg-teal px-4 py-2 text-sm font-medium text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-teal"
          >
            {t(locale, "saveProfile")}
          </button>
        )}
      </div>
    </div>
  );
}

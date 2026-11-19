import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  message?: string;
  locale?: Locale;
  onRetry?: () => void;
  onResetToDefault?: () => void;
};

export function ErrorState({ message, locale = "en", onRetry, onResetToDefault }: Props) {
  return (
    <div
      role="alert"
      className="my-8 rounded-surface border border-line bg-paper p-6 text-center shadow-sm"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-control bg-saffron/15 text-saffron">
        <span aria-hidden="true" className="text-xl font-bold">
          !
        </span>
      </div>
      <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "error")}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">
        {message || t(locale, "heroFallback")}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-control bg-teal px-4 py-2 text-sm font-medium text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-teal"
          >
            {t(locale, "retry")}
          </button>
        )}
        {onResetToDefault && (
          <button
            type="button"
            onClick={onResetToDefault}
            className="rounded-control border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-fog focus-visible:outline focus-visible:outline-teal"
          >
            {t(locale, "skipDefaults")}
          </button>
        )}
      </div>
    </div>
  );
}

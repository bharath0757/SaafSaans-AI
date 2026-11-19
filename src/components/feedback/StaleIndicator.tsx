import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  isStale: boolean;
  timestamp?: string;
  locale?: Locale;
};

export function StaleIndicator({ isStale, timestamp, locale = "en" }: Props) {
  if (!isStale) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between rounded-control border border-line bg-fog/80 px-3 py-2 text-xs text-muted"
    >
      <span>{t(locale, "staleNotice")}</span>
      {timestamp && <span className="tabular-nums font-medium">{timestamp}</span>}
    </div>
  );
}

import { isAlertBand, type AqiBand } from "@/domain/aqi";
import { AqiBandIcon } from "@/components/icons/AqiBandIcon";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  aqi: number;
  band: AqiBand;
  locale?: Locale;
};

/**
 * Persistent high-visibility alert banner displayed when AQI is Poor (201+) or worse.
 */
export function AlertBanner({ aqi, band, locale = "en" }: Props) {
  if (!isAlertBand(band.key)) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-6 rounded-surface border-2 border-line bg-paper p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-fog text-ink">
          <AqiBandIcon band={band.key} className="h-6 w-6" title={band.label} />
        </div>
        <div className="space-y-1">
          <p className="font-sans text-base font-bold text-ink">
            {t(locale, "alertTitle")}: {band.label} (AQI {aqi})
          </p>
          <p className="text-sm text-muted">{t(locale, "alertSensitiveAdvice")}</p>
        </div>
      </div>
    </div>
  );
}

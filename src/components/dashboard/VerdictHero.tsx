import type { AqiBand } from "@/domain/aqi";
import { defaultActionForBand } from "@/domain/aqi";
import { AqiLadder } from "@/components/AqiLadder";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  aqi: number;
  band: AqiBand;
  actionSentence?: string;
  locationName: string;
  timestamp?: string;
  isStale?: boolean;
  locale?: Locale;
  onChangeLocation?: () => void;
  onUpdateRoutine?: () => void;
};

function VerdictMeta({
  locationName,
  timestamp,
  isStale,
  locale,
}: {
  locationName: string;
  timestamp?: string;
  isStale: boolean;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
      <div className="flex items-center gap-2">
        <span className="font-medium text-ink">{locationName}</span>
        {timestamp && <span>• {timestamp}</span>}
      </div>
      {isStale && (
        <span className="rounded-control bg-saffron/15 px-2 py-0.5 text-xs font-medium text-saffron">
          {t(locale, "staleNotice")}
        </span>
      )}
    </div>
  );
}

function VerdictActionButtons({
  onChangeLocation,
  onUpdateRoutine,
  locale,
}: {
  onChangeLocation?: () => void;
  onUpdateRoutine?: () => void;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {onChangeLocation && (
        <button
          type="button"
          onClick={onChangeLocation}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-control bg-teal px-4 py-2 text-base font-medium text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal"
        >
          {t(locale, "changeLocation")}
        </button>
      )}
      {onUpdateRoutine && (
        <button
          type="button"
          onClick={onUpdateRoutine}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-control border border-line bg-paper px-4 py-2 text-base font-medium text-ink hover:bg-fog focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal"
        >
          {t(locale, "updateRoutine")}
        </button>
      )}
    </div>
  );
}

export function VerdictHero({
  aqi,
  band,
  actionSentence,
  locationName,
  timestamp,
  isStale = false,
  locale = "en",
  onChangeLocation,
  onUpdateRoutine,
}: Props) {
  const action = actionSentence || defaultActionForBand(band.key);

  return (
    <section aria-labelledby="verdict-heading" className="space-y-6">
      <VerdictMeta
        locationName={locationName}
        timestamp={timestamp}
        isStale={isStale}
        locale={locale}
      />

      <div className="space-y-3">
        <h1
          id="verdict-heading"
          className="font-display text-3xl font-semibold text-ink md:text-4xl"
        >
          {action}
        </h1>
        <p className="max-w-prose text-base text-muted">{t(locale, "heroFallback")}</p>
      </div>

      <div aria-live="polite">
        <p className="mb-2 text-sm font-medium text-muted">{t(locale, "aqiLabel")}</p>
        <AqiLadder aqi={aqi} band={band} />
      </div>

      <VerdictActionButtons
        onChangeLocation={onChangeLocation}
        onUpdateRoutine={onUpdateRoutine}
        locale={locale}
      />
    </section>
  );
}

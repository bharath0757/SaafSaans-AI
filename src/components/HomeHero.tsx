import { getAqiBand, defaultActionForBand } from "@/domain/aqi";
import { AqiLadder } from "@/components/AqiLadder";
import { t, type Locale } from "@/i18n/dictionaries";

type Props = {
  locale?: Locale;
  /** Demo AQI for Phase 1 shell; live data arrives in Phase 3. */
  demoAqi?: number;
};

/**
 * Answer-first hero: one sentence action, AQI ladder beneath.
 */
export function HomeHero({ locale = "en", demoAqi = 312 }: Props) {
  const band = getAqiBand(demoAqi);
  const action = defaultActionForBand(band.key);

  return (
    <section aria-labelledby="hero-heading" className="space-y-6">
      <div className="space-y-3">
        <h1 id="hero-heading" className="font-display text-3xl font-semibold text-ink md:text-4xl">
          {action}
        </h1>
        <p className="max-w-prose text-base text-muted">{t(locale, "heroFallback")}</p>
        <p className="text-sm text-muted">{t(locale, "privacyNote")}</p>
      </div>

      <div aria-live="polite">
        <p className="mb-2 text-sm font-medium text-muted">{t(locale, "aqiLabel")}</p>
        <AqiLadder aqi={demoAqi} band={band} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-control bg-teal px-4 py-2 text-base font-medium text-paper focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal"
          disabled
          aria-disabled="true"
          title="Location flow arrives in Phase 4"
        >
          {t(locale, "useLocation")}
        </button>
        <button
          type="button"
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-control border border-line bg-paper px-4 py-2 text-base font-medium text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal"
          disabled
          aria-disabled="true"
          title="City search arrives in Phase 4"
        >
          {t(locale, "searchCity")}
        </button>
      </div>
    </section>
  );
}

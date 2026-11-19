import { getAqiBand } from "@/domain/aqi";
import type { Locale } from "@/i18n/dictionaries";
import { VerdictHero } from "@/components/dashboard/VerdictHero";

type Props = {
  locale?: Locale;
  demoAqi?: number;
  locationName?: string;
  onChangeLocation?: () => void;
  onUpdateRoutine?: () => void;
};

/**
 * Answer-first hero: backward-compatible wrapper around VerdictHero.
 */
export function HomeHero({
  locale = "en",
  demoAqi = 312,
  locationName = "New Delhi, Delhi",
  onChangeLocation,
  onUpdateRoutine,
}: Props) {
  const band = getAqiBand(demoAqi);

  return (
    <VerdictHero
      aqi={demoAqi}
      band={band}
      locationName={locationName}
      locale={locale}
      onChangeLocation={onChangeLocation}
      onUpdateRoutine={onUpdateRoutine}
    />
  );
}

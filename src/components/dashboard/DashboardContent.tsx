import type { AirQualitySummary } from "@/services/air-quality";
import type { PlanResponse } from "@/hooks/useDashboardData";
import type { Locale } from "@/i18n/dictionaries";
import { AlertBanner } from "./AlertBanner";
import { VerdictHero } from "./VerdictHero";
import { HourlyStrip } from "./HourlyStrip";
import { PlanTabs } from "./PlanTabs";
import { ImpactCards } from "./ImpactCards";

type Props = {
  airQuality: AirQualitySummary;
  planData: PlanResponse | null;
  locationName: string;
  locale: Locale;
  onEditLocation: () => void;
  onEditRoutine: () => void;
};

export function DashboardContent({
  airQuality,
  planData,
  locationName,
  locale,
  onEditLocation,
  onEditRoutine,
}: Props) {
  return (
    <div className="space-y-8">
      <AlertBanner aqi={airQuality.current.aqi} band={airQuality.current.band} locale={locale} />
      <VerdictHero
        aqi={airQuality.current.aqi}
        band={airQuality.current.band}
        actionSentence={airQuality.current.actionSentence}
        locationName={locationName}
        timestamp={airQuality.current.timestamp}
        isStale={airQuality.isStale}
        locale={locale}
        onChangeLocation={onEditLocation}
        onUpdateRoutine={onEditRoutine}
      />
      <HourlyStrip hourly={airQuality.hourly} bestWindow={airQuality.bestWindow} locale={locale} />
      {planData && (
        <>
          <PlanTabs plan={planData.plan} locale={locale} />
          <ImpactCards impact={planData.impact} locale={locale} />
        </>
      )}
    </div>
  );
}

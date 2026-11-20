"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { OfflineNotice } from "@/components/feedback/OfflineNotice";
import type { Locale } from "@/i18n/dictionaries";
import { useDashboardData } from "@/hooks/useDashboardData";
import { computeCollectiveImpact } from "@/domain/collective";
import { DEFAULT_LOCATION, DEFAULT_PROFILE } from "@/components/onboarding/types";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CollectiveSimulator } from "@/components/community/CollectiveSimulator";
import { CommunityActionCards } from "@/components/community/CommunityActionCards";
import { VulnerableRegistry } from "@/components/community/VulnerableRegistry";
import type { AirQualitySummary } from "@/services/air-quality";
import type { DayImpactSummary } from "@/domain/impact";

const FALLBACK_METRICS = {
  indoorPm25Before: 180,
  indoorPm25After: 60,
  personalDoseBeforeUg: 1500,
  personalDoseAfterUg: 450,
  doseReductionPct: 70,
  doseSavedUg: 1050,
  transportCo2eBeforeG: 500,
  transportCo2eAfterG: 200,
  transportCo2eSavedG: 300,
  cookingCo2eBeforeG: 600,
  cookingCo2eAfterG: 200,
  cookingCo2eSavedG: 400,
  totalCo2eSavedG: 700,
};

function resolveCommunityMetrics(airQuality: AirQualitySummary | null, impact?: DayImpactSummary) {
  const aqi = airQuality ? airQuality.current.aqi : 280;
  const band = airQuality ? airQuality.current.band.label : "Poor";
  const metrics = impact ? impact.central : FALLBACK_METRICS;
  return { aqi, band, metrics };
}

export default function CommunityPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [households, setHouseholds] = useState(50);

  const { airQuality, planData } = useDashboardData(DEFAULT_LOCATION, DEFAULT_PROFILE);
  const { aqi, band, metrics } = resolveCommunityMetrics(airQuality, planData?.impact);
  const collective = computeCollectiveImpact(households, metrics);

  return (
    <AppShell
      locale={locale}
      headerAction={<LanguageSwitcher currentLocale={locale} onLocaleChange={setLocale} />}
    >
      <OfflineNotice locale={locale} />
      <div className="mx-auto max-w-4xl space-y-6">
        <CommunityHeader
          locale={locale}
          cityName={DEFAULT_LOCATION.name}
          aqi={aqi}
          band={band}
          onPrint={() => window.print()}
        />

        <CollectiveSimulator
          households={households}
          impact={collective}
          onChangeHouseholds={setHouseholds}
        />

        <CommunityActionCards />

        <VulnerableRegistry />

        <div className="text-center print:hidden">
          <Link href="/" className="text-xs font-semibold text-teal hover:underline">
            ← Return to Personalized Household Plan
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

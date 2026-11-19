"use client";

import { useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import { AppShell } from "@/components/AppShell";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { OfflineNotice } from "@/components/feedback/OfflineNotice";
import { LoadingSkeleton } from "@/components/feedback/LoadingSkeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import {
  type UserLocation,
  DEFAULT_LOCATION,
  DEFAULT_PROFILE,
} from "@/components/onboarding/types";
import type { HouseholdProfile } from "@/domain/actions";
import { useDashboardData } from "@/hooks/useDashboardData";

const emptySubscribe = () => () => {};

function getStoredProfile(): HouseholdProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem("saafsaans_profile");
    return raw ? (JSON.parse(raw) as HouseholdProfile) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function getStoredLocation(): UserLocation {
  if (typeof window === "undefined") return DEFAULT_LOCATION;
  try {
    const raw = localStorage.getItem("saafsaans_location");
    return raw ? (JSON.parse(raw) as UserLocation) : DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

function ChatLauncherButton({ locale, onClick }: { locale: Locale; onClick: () => void }) {
  const label = t(locale, "askSaafSaans");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} — ${t(locale, "chatTitle")}`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-teal px-4 py-3 font-semibold text-paper shadow-lg hover:bg-teal-hover focus:outline-none focus:ring-2 focus:ring-teal print:hidden"
    >
      <span aria-hidden="true">💬</span>
      <span>{label}</span>
    </button>
  );
}

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [profile, setProfile] = useState<HouseholdProfile>(getStoredProfile);
  const [location, setLocation] = useState<UserLocation>(getStoredLocation);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const { airQuality, planData, loading, error, refetch } = useDashboardData(location, profile);

  return (
    <AppShell
      locale={locale}
      headerAction={<LanguageSwitcher currentLocale={locale} onLocaleChange={setLocale} />}
    >
      <OfflineNotice locale={locale} />

      {!isClient || (loading && !airQuality) ? (
        <LoadingSkeleton locale={locale} />
      ) : error && !airQuality ? (
        <ErrorState
          message={error}
          locale={locale}
          onRetry={refetch}
          onResetToDefault={() => {
            setLocation(DEFAULT_LOCATION);
            setProfile(DEFAULT_PROFILE);
          }}
        />
      ) : (
        airQuality && (
          <DashboardContent
            airQuality={airQuality}
            planData={planData}
            locationName={location.name}
            locale={locale}
            onEditLocation={() => setShowOnboarding(true)}
            onEditRoutine={() => setShowOnboarding(true)}
          />
        )
      )}

      <ChatLauncherButton locale={locale} onClick={() => setIsChatOpen(true)} />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        locale={locale}
        planContext={planData?.plan}
      />

      {showOnboarding && (
        <OnboardingWizard
          locale={locale}
          initialProfile={profile}
          initialLocation={location}
          canClose={Boolean(airQuality)}
          onClose={() => setShowOnboarding(false)}
          onComplete={(newProfile, newLoc) => {
            setProfile(newProfile);
            setLocation(newLoc);
            setShowOnboarding(false);
          }}
        />
      )}
    </AppShell>
  );
}

"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
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
import { useDashboardData, type PlanResponse } from "@/hooks/useDashboardData";
import type { AirQualitySummary } from "@/services/air-quality";

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

type DashboardViewProps = {
  isClient: boolean;
  loading: boolean;
  error: string | null;
  airQuality: AirQualitySummary | null;
  planData: PlanResponse | null;
  location: UserLocation;
  locale: Locale;
  refetch: () => void;
  onReset: () => void;
  onOpenOnboarding: () => void;
};

function DashboardView({
  isClient,
  loading,
  error,
  airQuality,
  planData,
  location,
  locale,
  refetch,
  onReset,
  onOpenOnboarding,
}: DashboardViewProps) {
  if (!isClient || (loading && !airQuality)) {
    return <LoadingSkeleton locale={locale} />;
  }
  if (error && !airQuality) {
    return (
      <ErrorState message={error} locale={locale} onRetry={refetch} onResetToDefault={onReset} />
    );
  }
  if (!airQuality) return null;
  return (
    <DashboardContent
      airQuality={airQuality}
      planData={planData}
      locationName={location.name}
      locale={locale}
      onEditLocation={onOpenOnboarding}
      onEditRoutine={onOpenOnboarding}
    />
  );
}

function useHomeState() {
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

  const handleReset = useCallback(() => {
    setLocation(DEFAULT_LOCATION);
    setProfile(DEFAULT_PROFILE);
  }, []);

  const handleOnboardingComplete = useCallback(
    (newProfile: HouseholdProfile, newLoc: UserLocation) => {
      setProfile(newProfile);
      setLocation(newLoc);
      setShowOnboarding(false);
    },
    [],
  );

  return {
    locale,
    setLocale,
    profile,
    location,
    showOnboarding,
    setShowOnboarding,
    isChatOpen,
    setIsChatOpen,
    isClient,
    handleReset,
    handleOnboardingComplete,
  };
}

export default function HomePage() {
  const state = useHomeState();
  const { airQuality, planData, loading, error, refetch } = useDashboardData(
    state.location,
    state.profile,
  );

  return (
    <AppShell
      locale={state.locale}
      headerAction={
        <LanguageSwitcher currentLocale={state.locale} onLocaleChange={state.setLocale} />
      }
    >
      <OfflineNotice locale={state.locale} />

      <DashboardView
        isClient={state.isClient}
        loading={loading}
        error={error}
        airQuality={airQuality}
        planData={planData}
        location={state.location}
        locale={state.locale}
        refetch={refetch}
        onReset={state.handleReset}
        onOpenOnboarding={() => state.setShowOnboarding(true)}
      />

      <ChatLauncherButton locale={state.locale} onClick={() => state.setIsChatOpen(true)} />

      <ChatDrawer
        isOpen={state.isChatOpen}
        onClose={() => state.setIsChatOpen(false)}
        locale={state.locale}
        planContext={planData?.plan}
      />

      {state.showOnboarding && (
        <OnboardingWizard
          locale={state.locale}
          initialProfile={state.profile}
          initialLocation={state.location}
          canClose={Boolean(airQuality)}
          onClose={() => state.setShowOnboarding(false)}
          onComplete={state.handleOnboardingComplete}
        />
      )}
    </AppShell>
  );
}

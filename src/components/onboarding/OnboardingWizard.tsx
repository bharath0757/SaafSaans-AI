import { useState } from "react";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import type { HouseholdProfile } from "@/domain/actions";
import { type UserLocation, DEFAULT_LOCATION, DEFAULT_PROFILE } from "./types";
import { StepLocation } from "./StepLocation";
import { StepHousehold } from "./StepHousehold";
import { StepHabits } from "./StepHabits";
import { OnboardingFooter } from "./OnboardingFooter";

type Props = {
  locale: Locale;
  initialProfile?: HouseholdProfile;
  initialLocation?: UserLocation;
  canClose?: boolean;
  onClose?: () => void;
  onComplete: (profile: HouseholdProfile, location: UserLocation) => void;
};

function saveToStorage(p: HouseholdProfile, loc: UserLocation) {
  try {
    localStorage.setItem("saafsaans_profile", JSON.stringify(p));
    localStorage.setItem("saafsaans_location", JSON.stringify(loc));
  } catch {
    // Ignore localStorage unavailable in SSR / strict sandbox
  }
}

function OnboardingHeader({
  locale,
  step,
  canClose,
  onClose,
}: {
  locale: Locale;
  step: number;
  canClose: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
      <div>
        <h2 id="onboarding-title" className="font-display text-xl font-semibold text-ink">
          {t(locale, "onboardingTitle")}
        </h2>
        <p className="text-xs text-muted">Step {step} of 3</p>
      </div>
      {canClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t(locale, "close")}
          className="rounded-control p-1 text-muted hover:text-ink focus-visible:outline focus-visible:outline-teal"
        >
          ✕
        </button>
      )}
    </div>
  );
}

type StepContentProps = {
  step: number;
  locale: Locale;
  location: UserLocation;
  profile: HouseholdProfile;
  setLocation: (loc: UserLocation) => void;
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
};

function StepContent({
  step,
  locale,
  location,
  profile,
  setLocation,
  setProfile,
}: StepContentProps) {
  if (step === 1) {
    return <StepLocation locale={locale} location={location} onLocationChange={setLocation} />;
  }
  if (step === 2) {
    return (
      <StepHousehold
        locale={locale}
        profile={profile}
        onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
      />
    );
  }
  return (
    <StepHabits
      locale={locale}
      profile={profile}
      onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
    />
  );
}

export function OnboardingWizard({
  locale,
  initialProfile = DEFAULT_PROFILE,
  initialLocation = DEFAULT_LOCATION,
  canClose = false,
  onClose,
  onComplete,
}: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<HouseholdProfile>(initialProfile);
  const [location, setLocation] = useState<UserLocation>(initialLocation);

  const handleFinish = (p: HouseholdProfile, loc: UserLocation) => {
    saveToStorage(p, loc);
    onComplete(p, loc);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 p-4"
    >
      <div className="relative w-full max-w-2xl rounded-surface border border-line bg-paper p-6 shadow-xl">
        <OnboardingHeader locale={locale} step={step} canClose={canClose} onClose={onClose} />

        <div className="min-h-[220px] py-2">
          <StepContent
            step={step}
            locale={locale}
            location={location}
            profile={profile}
            setLocation={setLocation}
            setProfile={setProfile}
          />
        </div>

        <OnboardingFooter
          locale={locale}
          step={step}
          onBack={() => setStep((s) => Math.max(1, s - 1))}
          onNext={() => setStep((s) => Math.min(3, s + 1))}
          onSave={() => handleFinish(profile, location)}
          onSkip={() => handleFinish(DEFAULT_PROFILE, DEFAULT_LOCATION)}
        />
      </div>
    </div>
  );
}

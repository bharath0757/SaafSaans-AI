import { useState, useEffect } from "react";
import type { AirQualitySummary } from "@/services/air-quality";
import type { PlanOutput } from "@/services/llm/types";
import type { DayImpactSummary } from "@/domain/impact";
import type { ActionItem, HouseholdProfile } from "@/domain/actions";
import type { UserLocation } from "@/components/onboarding/types";

export type PlanResponse = {
  plan: PlanOutput;
  impact: DayImpactSummary;
  appliedActions: ActionItem[];
};

const CACHE_KEY_AQ = "saafsaans_cached_aq";
const CACHE_KEY_PLAN = "saafsaans_cached_plan";

function loadCachedData(): { aq: AirQualitySummary | null; plan: PlanResponse | null } {
  if (typeof window === "undefined") return { aq: null, plan: null };
  try {
    const rawAq = localStorage.getItem(CACHE_KEY_AQ);
    const rawPlan = localStorage.getItem(CACHE_KEY_PLAN);
    const aq = rawAq ? (JSON.parse(rawAq) as AirQualitySummary) : null;
    const plan = rawPlan ? (JSON.parse(rawPlan) as PlanResponse) : null;
    if (aq) aq.isStale = true;
    return { aq, plan };
  } catch {
    return { aq: null, plan: null };
  }
}

function persistCache(aq: AirQualitySummary, plan: PlanResponse) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY_AQ, JSON.stringify(aq));
    localStorage.setItem(CACHE_KEY_PLAN, JSON.stringify(plan));
  } catch {
    // quota exceeded or private mode
  }
}

async function fetchDashboard(
  loc: UserLocation,
  prof: HouseholdProfile,
): Promise<{ aq: AirQualitySummary; plan: PlanResponse }> {
  const aqRes = await fetch(`/api/air-quality?lat=${loc.latitude}&lon=${loc.longitude}`);
  if (!aqRes.ok) throw new Error("Failed to load air quality data");
  const aq: AirQualitySummary = await aqRes.json();

  const planRes = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      aqi: aq.current.aqi,
      cityName: loc.name,
      ambientPm25: aq.current.pm25,
      bestWindow: aq.bestWindow,
      profile: prof,
    }),
  });
  if (!planRes.ok) throw new Error("Failed to generate plan");
  const plan: PlanResponse = await planRes.json();

  persistCache(aq, plan);
  return { aq, plan };
}

export function useDashboardData(location: UserLocation, profile: HouseholdProfile) {
  const [airQuality, setAirQuality] = useState<AirQualitySummary | null>(null);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { aq, plan } = await fetchDashboard(location, profile);
        if (ignore) return;
        setAirQuality(aq);
        setPlanData(plan);
        setError(null);
      } catch (err) {
        if (ignore) return;
        const cached = loadCachedData();
        if (cached.aq && cached.plan) {
          setAirQuality(cached.aq);
          setPlanData(cached.plan);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [location, profile, reloadTrigger]);

  const refetch = () => {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  return { airQuality, planData, loading, error, refetch };
}

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

export function useDashboardData(location: UserLocation, profile: HouseholdProfile) {
  const [airQuality, setAirQuality] = useState<AirQualitySummary | null>(null);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function execute() {
      try {
        const aqRes = await fetch(
          `/api/air-quality?lat=${location.latitude}&lon=${location.longitude}`,
        );
        if (!aqRes.ok) throw new Error("Failed to load air quality data");
        const aqJson: AirQualitySummary = await aqRes.json();
        if (ignore) return;
        setAirQuality(aqJson);

        const planRes = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aqi: aqJson.current.aqi,
            cityName: location.name,
            ambientPm25: aqJson.current.pm25,
            bestWindow: aqJson.bestWindow,
            profile,
          }),
        });
        if (!planRes.ok) throw new Error("Failed to generate plan");
        const planJson: PlanResponse = await planRes.json();
        if (ignore) return;
        setPlanData(planJson);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void execute();

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

import type { HouseholdProfile } from "@/domain/actions";

export type UserLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export const DEFAULT_LOCATION: UserLocation = {
  name: "Delhi",
  latitude: 28.6,
  longitude: 77.2,
};

export const DEFAULT_PROFILE: HouseholdProfile = {
  hasChildren: false,
  hasElders: false,
  hasRespiratoryCondition: false,
  commuteMode: "twoWheeler",
  commuteDistanceKm: 10,
  cookingFuel: "lpg",
  homeType: "leaky",
  purifier: "none",
  mask: "none",
  budget: "low",
};

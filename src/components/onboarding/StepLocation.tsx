import { useState } from "react";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import type { UserLocation } from "./types";
import type { GeocodedCity } from "@/services/geocoding";
import { CitySearchResults } from "./CitySearchResults";

type Props = {
  locale: Locale;
  location: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
};

const COORD_PRECISION_FACTOR = 10;
const MIN_QUERY_LENGTH = 2;

function GeolocationSelector({
  locale,
  location,
  onLocationChange,
  geoError,
  setGeoError,
}: {
  locale: Locale;
  location: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
  geoError: string | null;
  setGeoError: (err: string | null) => void;
}) {
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat =
          Math.round(pos.coords.latitude * COORD_PRECISION_FACTOR) / COORD_PRECISION_FACTOR;
        const lon =
          Math.round(pos.coords.longitude * COORD_PRECISION_FACTOR) / COORD_PRECISION_FACTOR;
        onLocationChange({ name: "Current Location", latitude: lat, longitude: lon });
      },
      () => setGeoError("Unable to retrieve location"),
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUseLocation}
          className="inline-flex min-h-touch items-center justify-center rounded-control bg-teal px-4 py-2 text-sm font-medium text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {t(locale, "useLocation")}
        </button>
        <span className="text-sm font-medium text-ink">
          Selected: <span className="font-semibold">{location.name}</span> ({location.latitude},{" "}
          {location.longitude})
        </span>
      </div>
      {geoError && <p className="text-sm text-saffron">{geoError}</p>}
    </>
  );
}

async function fetchCityResults(query: string): Promise<GeocodedCity[]> {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function CitySearchSection({
  locale,
  locationName,
  onLocationChange,
}: {
  locale: Locale;
  locationName: string;
  onLocationChange: (loc: UserLocation) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodedCity[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    setSearching(true);
    const cities = await fetchCityResults(val);
    setResults(cities);
    setSearching(false);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="city-search" className="block text-sm font-medium text-ink">
        {t(locale, "searchCity")}
      </label>
      <input
        id="city-search"
        type="search"
        value={query}
        onChange={(e) => void handleSearch(e.target.value)}
        placeholder="e.g. Delhi, Mumbai, Bengaluru"
        className="w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink placeholder-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
      />
      {searching && <p className="text-xs text-muted">{t(locale, "searching")}</p>}
      <CitySearchResults
        results={results}
        selectedName={locationName}
        onSelect={(loc) => {
          onLocationChange(loc);
          setResults([]);
          setQuery("");
        }}
      />
    </div>
  );
}

export function StepLocation({ locale, location, onLocationChange }: Props) {
  const [geoError, setGeoError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <GeolocationSelector
        locale={locale}
        location={location}
        onLocationChange={onLocationChange}
        geoError={geoError}
        setGeoError={setGeoError}
      />
      <CitySearchSection
        locale={locale}
        locationName={location.name}
        onLocationChange={onLocationChange}
      />
      <p className="text-xs text-muted">{t(locale, "privacyNote")}</p>
    </div>
  );
}

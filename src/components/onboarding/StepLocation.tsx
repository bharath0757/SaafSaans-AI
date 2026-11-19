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

export function StepLocation({ locale, location, onLocationChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodedCity[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10) / 10;
        const lon = Math.round(pos.coords.longitude * 10) / 10;
        onLocationChange({ name: "Current Location", latitude: lat, longitude: lon });
      },
      () => setGeoError("Unable to retrieve location"),
    );
  };

  return (
    <div className="space-y-4">
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
          selectedName={location.name}
          onSelect={(loc) => {
            onLocationChange(loc);
            setResults([]);
            setQuery("");
          }}
        />
      </div>
      <p className="text-xs text-muted">{t(locale, "privacyNote")}</p>
    </div>
  );
}

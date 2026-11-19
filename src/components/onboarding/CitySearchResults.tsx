import type { GeocodedCity } from "@/services/geocoding";
import type { UserLocation } from "./types";

type Props = {
  results: GeocodedCity[];
  selectedName: string;
  onSelect: (loc: UserLocation) => void;
};

export function CitySearchResults({ results, selectedName, onSelect }: Props) {
  if (results.length === 0) return null;

  return (
    <ul
      aria-label="City suggestions"
      className="max-h-40 overflow-y-auto rounded-control border border-line bg-paper p-1"
    >
      {results.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect({ name: c.name, latitude: c.latitude, longitude: c.longitude })}
            className={`w-full rounded-control px-2 py-1.5 text-left text-sm text-ink hover:bg-fog focus-visible:bg-fog focus-visible:outline-none ${
              selectedName === c.name ? "bg-fog font-medium" : ""
            }`}
          >
            {c.name} {c.admin1 ? `, ${c.admin1}` : ""} ({c.country})
          </button>
        </li>
      ))}
    </ul>
  );
}

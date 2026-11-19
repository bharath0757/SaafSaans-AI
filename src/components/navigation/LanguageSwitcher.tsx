import type { Locale } from "@/i18n/dictionaries";

type Props = {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

const LANGUAGES: Array<{ code: Locale; label: string; nativeName: string }> = [
  { code: "en", label: "English", nativeName: "EN" },
  { code: "hi", label: "हिन्दी", nativeName: "HI" },
  { code: "te", label: "తెలుగు", nativeName: "TE" },
];

/**
 * Accessible language switcher with touch-friendly segmented controls.
 */
export function LanguageSwitcher({ currentLocale, onLocaleChange }: Props) {
  return (
    <nav
      aria-label="Language"
      className="inline-flex rounded-control border border-line bg-fog p-1"
    >
      {LANGUAGES.map((lang) => {
        const isSelected = currentLocale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onLocaleChange(lang.code)}
            aria-pressed={isSelected}
            lang={lang.code}
            title={lang.label}
            className={`min-h-[36px] min-w-[40px] rounded-control px-2.5 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
              isSelected
                ? "bg-paper text-ink shadow-sm"
                : "text-muted hover:text-ink focus-visible:text-ink"
            }`}
          >
            <span aria-hidden="true">{lang.nativeName}</span>
            <span className="sr-only">{lang.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

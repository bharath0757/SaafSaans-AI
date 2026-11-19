import type { ReactNode } from "react";
import { t, type Locale } from "@/i18n/dictionaries";

type Props = {
  children: ReactNode;
  locale?: Locale;
};

/**
 * Accessible application chrome: skip link, landmark header/footer, main slot.
 */
export function AppShell({ children, locale = "en" }: Props) {
  const dict = {
    skip: t(locale, "skipToContent"),
    brand: t(locale, "brand"),
    tagline: t(locale, "tagline"),
    advice: t(locale, "notMedicalAdvice"),
    attribution: t(locale, "dataAttribution"),
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-teal focus:px-4 focus:py-3 focus:text-paper"
      >
        {dict.skip}
      </a>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-ink">
              {dict.brand}
            </p>
            <p className="text-sm text-muted">{dict.tagline}</p>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-sm text-muted">
          <p>{dict.advice}</p>
          <p>{dict.attribution}</p>
        </div>
      </footer>
    </>
  );
}

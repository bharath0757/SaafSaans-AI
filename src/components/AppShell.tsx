import type { ReactNode } from "react";
import Link from "next/link";
import { t, type Locale } from "@/i18n/dictionaries";

type Props = {
  children: ReactNode;
  locale?: Locale;
  headerAction?: ReactNode;
};

function AppHeader({ locale, headerAction }: { locale: Locale; headerAction?: ReactNode }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="group">
            <p className="font-display text-2xl font-semibold tracking-tight text-ink group-hover:text-teal">
              {t(locale, "brand")}
            </p>
            <p className="text-sm text-muted">{t(locale, "tagline")}</p>
          </Link>
          <nav
            aria-label="Main Navigation"
            className="hidden items-center gap-4 text-sm font-semibold sm:flex"
          >
            <Link href="/" className="text-ink hover:text-teal">
              {t(locale, "tabToday")}
            </Link>
            <Link href="/community" className="text-muted hover:text-teal">
              {t(locale, "communityActionPack")}
            </Link>
          </nav>
        </div>
        {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
      </div>
    </header>
  );
}

function AppFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-sm text-muted">
        <p>{t(locale, "notMedicalAdvice")}</p>
        <p>{t(locale, "dataAttribution")}</p>
      </div>
    </footer>
  );
}

/**
 * Accessible application chrome: skip link, landmark header/footer, main slot.
 */
export function AppShell({ children, locale = "en", headerAction }: Props) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-teal focus:px-4 focus:py-3 focus:text-paper"
      >
        {t(locale, "skipToContent")}
      </a>
      <AppHeader locale={locale} headerAction={headerAction} />
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <AppFooter locale={locale} />
    </>
  );
}

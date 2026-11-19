import { useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  locale?: Locale;
};

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function OfflineNotice({ locale = "en" }: Props) {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-control border border-saffron bg-saffron/10 px-3 py-2 text-xs font-medium text-saffron"
    >
      {t(locale, "offlineBanner")}
    </div>
  );
}

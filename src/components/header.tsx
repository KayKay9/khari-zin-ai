"use client";

import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";

export function Header() {
  const { locale, setLocale, t } = useLocale();
  const { attractions, hotels, buses } = useTrip();
  const count = attractions.length + hotels.length + buses.length;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 md:px-6">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-ivory/95 px-4 py-2 shadow-md ring-1 ring-maroon/10">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-sm font-semibold text-gold">
          မ
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-ink">{t("appName")}</p>
          <p className="hidden text-xs text-muted sm:block">{t("tagline")}</p>
        </div>
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        {count > 0 ? (
          <span className="rounded-full bg-gold px-3 py-1 text-sm font-medium text-ink">
            {count}
          </span>
        ) : null}
        <div className="flex overflow-hidden rounded-full bg-ivory/95 text-sm font-medium shadow-md ring-1 ring-maroon/10">
          <button
            type="button"
            onClick={() => setLocale("my")}
            className={`min-h-11 px-3 ${locale === "my" ? "bg-maroon text-ivory" : "text-muted"}`}
          >
            {t("languageMy")}
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`min-h-11 px-3 ${locale === "en" ? "bg-maroon text-ivory" : "text-muted"}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}

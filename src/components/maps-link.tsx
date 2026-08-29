"use client";

import { useLocale } from "@/context/locale-context";

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function MapsLink({
  href,
  compact = false,
  className = "",
}: {
  href: string;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const base = compact
    ? "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center self-center rounded-full text-maroon ring-1 ring-maroon/20"
    : "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-maroon ring-1 ring-maroon/20";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("viewOnMaps")}
      onClick={(event) => event.stopPropagation()}
      className={`${base} ${className}`.trim()}
    >
      <MapPinIcon />
      {compact ? null : <span>{t("viewOnMaps")}</span>}
    </a>
  );
}

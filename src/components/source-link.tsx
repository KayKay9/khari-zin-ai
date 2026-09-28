"use client";

import { useLocale } from "@/context/locale-context";

export function SourceLink({ url }: { url?: string }) {
  const { t } = useLocale();
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-maroon ring-1 ring-maroon/20"
    >
      {t("viewSource")}
    </a>
  );
}

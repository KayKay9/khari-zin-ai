"use client";

import Image from "next/image";
import { destinations } from "@/data/destinations";
import { useLocale } from "@/context/locale-context";
import { bi } from "@/i18n";

export function CityChips({
  visible,
  onPick,
}: {
  visible: boolean;
  onPick: (prompt: string) => void;
}) {
  const { locale } = useLocale();
  if (!visible) return null;

  return (
    <div className="pointer-events-auto mx-auto flex max-w-3xl flex-wrap justify-center gap-3 px-4">
      {destinations.map((city) => (
        <button
          key={city.slug}
          type="button"
          onClick={() => onPick(bi(locale, city.prompt))}
          className="group relative h-24 w-36 overflow-hidden rounded-2xl shadow-md ring-1 ring-maroon/20 sm:h-28 sm:w-40"
        >
          <Image
            src={city.image}
            alt={bi(locale, city.name)}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="160px"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <span className="absolute bottom-2 left-2 right-2 text-left text-sm font-semibold text-ivory drop-shadow">
            {bi(locale, city.name)}
          </span>
        </button>
      ))}
    </div>
  );
}

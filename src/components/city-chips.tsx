"use client";

import Image from "next/image";
import { useState } from "react";
import { destinations } from "@/data/destinations";
import { PHOTO } from "@/data/image-urls";
import { useLocale } from "@/context/locale-context";
import { bi } from "@/i18n";

function ChipImage({ src, alt }: { src: string; alt: string }) {
  const [url, setUrl] = useState(src);
  return (
    <Image
      src={url}
      alt={alt}
      fill
      className="object-cover transition group-hover:scale-105"
      sizes="160px"
      onError={() => {
        if (url !== PHOTO.bagan) setUrl(PHOTO.bagan);
      }}
    />
  );
}

export function CityChips({
  visible,
  title,
  excludeSlug,
  onPick,
}: {
  visible: boolean;
  title: string;
  excludeSlug?: string | null;
  onPick: (slug: string) => void;
}) {
  const { locale } = useLocale();
  if (!visible) return null;

  return (
    <div className="pointer-events-auto mx-auto max-w-3xl px-4">
      <p className="mb-2 text-center text-sm font-semibold">
        <span className="rounded-full bg-maroon/90 px-3 py-1 text-ivory">{title}</span>
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {destinations.map((city) => {
          const excluded = city.slug === excludeSlug;
          return (
            <button
              key={city.slug}
              type="button"
              disabled={excluded}
              onClick={() => onPick(city.slug)}
              className={`group relative h-24 w-36 overflow-hidden rounded-2xl shadow-md ring-1 ring-maroon/20 sm:h-28 sm:w-40 ${excluded ? "opacity-40" : ""}`}
            >
              <ChipImage src={city.image} alt={bi(locale, city.name)} />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-left text-sm font-semibold text-ivory drop-shadow">
                {bi(locale, city.name)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { ListingPhoto } from "@/components/listing-photo";
import type { PhotoKind } from "@/lib/photos";

export function MapPlacePopup({
  title,
  subtitle,
  imageUrl,
  kind,
  priceLabel,
}: {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  kind: PhotoKind;
  priceLabel?: string;
}) {
  return (
    <div className="map-popup-card text-ink">
      <ListingPhoto src={imageUrl} alt={title} kind={kind} variant="popup" />
      <div className="map-popup-body">
        <p className="text-[15px] font-semibold leading-snug">{title}</p>
        {subtitle ? <p className="mt-1 text-sm leading-snug text-muted">{subtitle}</p> : null}
        {priceLabel ? <p className="mt-2 text-sm font-medium leading-snug text-maroon">{priceLabel}</p> : null}
      </div>
    </div>
  );
}

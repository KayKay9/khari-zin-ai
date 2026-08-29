"use client";

import { useState } from "react";
import { placeholderPhoto, type PhotoKind } from "@/lib/photos";

export function ListingPhoto({
  src,
  alt,
  kind,
  variant = "wide",
}: {
  src?: string;
  alt: string;
  kind: PhotoKind;
  variant?: "wide" | "thumb";
}) {
  const [failed, setFailed] = useState(false);
  const url = !src || failed ? placeholderPhoto(kind) : src;
  const frame =
    variant === "thumb"
      ? "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand"
      : "relative mb-2 aspect-[16/10] w-full overflow-hidden rounded-xl bg-sand";

  return (
    <div className={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

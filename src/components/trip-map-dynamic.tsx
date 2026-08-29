"use client";

import dynamic from "next/dynamic";

export const TripMapDynamic = dynamic(() => import("@/components/trip-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#dce6d2]" />,
});

"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ChatPopup } from "@/components/chat-popup";
import { CityChips } from "@/components/city-chips";
import { ItineraryPanel } from "@/components/itinerary-panel";
import { TripMapDynamic } from "@/components/trip-map-dynamic";
import { useChat } from "@/context/chat-context";
import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";
import { destinations } from "@/data/destinations";

export function Workspace() {
  const { locale, t } = useLocale();
  const { send } = useChat();
  const trip = useTrip();
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<"chat" | "trip">("chat");
  const [sameCityHint, setSameCityHint] = useState(false);

  const pickingOrigin = !trip.originSlug;
  const chipsVisible = !trip.originSlug || !trip.destinationSlug;

  function planFromSlugs(originSlug: string, destinationSlug: string) {
    const origin = destinations.find((item) => item.slug === originSlug);
    const dest = destinations.find((item) => item.slug === destinationSlug);
    if (!origin || !dest) return;
    const message =
      locale === "my"
        ? `စတင်: ${origin.name.my}။ သွားမည့်နေရာ: ${dest.name.my}။ ဘတ်စ်နဲ့ခရီးစဉ် စီစဉ်ပေးပါ။`
        : `Start: ${origin.name.en}. Destination: ${dest.name.en}. Plan a trip by bus.`;
    void send(message);
  }

  function pickCity(slug: string) {
    setChatOpen(true);
    setMobileTab("chat");
    if (!trip.originSlug) {
      trip.setOriginSlug(slug);
      setSameCityHint(false);
      return;
    }
    if (slug === trip.originSlug) {
      setSameCityHint(true);
      return;
    }
    setSameCityHint(false);
    trip.setDestinationSlug(slug);
    planFromSlugs(trip.originSlug, slug);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <TripMapDynamic />
      </div>

      <Header />

      <div className="pointer-events-none absolute inset-x-0 top-20 z-20 hidden md:block">
        <CityChips
          visible={chipsVisible}
          title={pickingOrigin ? t("askOrigin") : t("askDestination")}
          excludeSlug={trip.originSlug}
          onPick={pickCity}
        />
        {sameCityHint ? (
          <p className="pointer-events-auto mt-2 text-center text-sm font-medium text-ivory drop-shadow">
            {t("sameCityHint")}
          </p>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 md:hidden">
        <CityChips
          visible={chipsVisible}
          title={pickingOrigin ? t("askOrigin") : t("askDestination")}
          excludeSlug={trip.originSlug}
          onPick={pickCity}
        />
        {sameCityHint ? (
          <p className="pointer-events-auto mt-2 text-center text-sm font-medium text-ivory drop-shadow">
            {t("sameCityHint")}
          </p>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-3 top-20 z-20 hidden md:flex">
        {chatOpen ? (
          <ChatPopup open onClose={() => setChatOpen(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="pointer-events-auto min-h-11 self-end rounded-full bg-maroon px-5 font-medium text-ivory shadow-lg"
          >
            {t("openChat")}
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-4 right-3 top-20 z-20 hidden md:flex md:justify-end">
        <ItineraryPanel />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 md:hidden">
        <div className="pointer-events-auto mx-3 mb-3 max-h-[52vh] overflow-hidden rounded-[20px] shadow-xl">
          {mobileTab === "chat" ? (
            <ChatPopup open onClose={() => setChatOpen(false)} showMinimize={false} />
          ) : (
            <ItineraryPanel />
          )}
        </div>
        <div className="pointer-events-auto flex justify-center gap-2 pb-[max(12px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setMobileTab("chat")}
            className={`min-h-11 rounded-full px-5 ${mobileTab === "chat" ? "bg-maroon text-ivory" : "bg-ivory text-maroon"}`}
          >
            {t("chat")}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("trip")}
            className={`min-h-11 rounded-full px-5 ${mobileTab === "trip" ? "bg-maroon text-ivory" : "bg-ivory text-maroon"}`}
          >
            {t("trip")}
          </button>
        </div>
      </div>
    </div>
  );
}

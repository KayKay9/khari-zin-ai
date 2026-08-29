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

export function Workspace() {
  const { t } = useLocale();
  const { send } = useChat();
  const { attractions, hotels, buses } = useTrip();
  const started = attractions.length + hotels.length + buses.length > 0;
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<"chat" | "trip">("chat");
  const [chipsVisible, setChipsVisible] = useState(true);

  function pickCity(prompt: string) {
    setChipsVisible(false);
    setChatOpen(true);
    setMobileTab("chat");
    void send(prompt);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <TripMapDynamic />
      </div>

      <Header />

      <div className="pointer-events-none absolute inset-x-0 top-20 z-20 hidden md:block">
        <CityChips visible={chipsVisible && !started} onPick={pickCity} />
      </div>

      <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 md:hidden">
        <CityChips visible={chipsVisible && !started} onPick={pickCity} />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-3 top-20 z-20 hidden md:flex">
        {chatOpen ? (
          <ChatPopup
            open
            onClose={() => setChatOpen(false)}
            onConversationStart={() => setChipsVisible(false)}
          />
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
            <ChatPopup
              open
              onClose={() => setChatOpen(false)}
              onConversationStart={() => setChipsVisible(false)}
              showMinimize={false}
            />
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

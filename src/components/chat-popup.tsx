"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/chat-context";
import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";
import { destinations } from "@/data/destinations";
import { bi } from "@/i18n";
import { ListingPhoto } from "@/components/listing-photo";
import { MapsLink } from "@/components/maps-link";
import type { Attraction, Bus, ChatPayload, Hotel } from "@/lib/types";
import { googleMapsDirectionsUrl, googleMapsPlaceUrl } from "@/lib/maps";

const STARTERS = [
  { key: "starterBagan" as const, textEn: "Bagan 3 days by bus from Yangon", textMy: "Bagan ၃ ရက်၊ ရန်ကုန်က ဘတ်စ်နဲ့သွားမယ်" },
  { key: "starterFamilyBeach" as const, textEn: "Family beach trip Ngapali or Chaung Tha", textMy: "ကမ်းခြေ မိသားစု ငပလီ သို့မဟုတ် ချောင်းသာ" },
  { key: "starterNightBus" as const, textEn: "Yangon to Mandalay night bus and hotels", textMy: "ရန်ကုန် → မန္တလေး ညဘတ်စ်နဲ့ ဟိုတယ်" },
];

function formatMmk(value: number) {
  return value.toLocaleString();
}

export function ChatPopup({
  open,
  onClose,
  showMinimize = true,
  onConversationStart,
}: {
  open: boolean;
  onClose: () => void;
  showMinimize?: boolean;
  onConversationStart?: () => void;
}) {
  const { locale, t } = useLocale();
  const { messages, loading, send, lastUser } = useChat();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function ask(text: string, retry = false) {
    onConversationStart?.();
    if (!retry) setInput("");
    void send(text, retry);
  }

  if (!open) return null;

  return (
    <aside className="pointer-events-auto flex h-full max-h-[min(78vh,720px)] w-[min(100%,400px)] flex-col overflow-hidden rounded-[20px] bg-ivory/95 shadow-xl ring-1 ring-maroon/15">
      <div className="flex items-center justify-between border-b border-maroon/10 px-4 py-3">
        <div>
          <p className="font-semibold text-maroon">{t("chat")}</p>
          <p className="text-xs text-muted">{t("tagline")}</p>
        </div>
        {showMinimize ? (
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-3 text-sm text-muted hover:bg-sand"
          >
            {t("minimizeChat")}
          </button>
        ) : null}
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {messages.length === 0 && !loading ? (
          <p className="px-1 text-sm text-muted">{t("emptyChat")}</p>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "space-y-3"}>
            <div
              className={
                msg.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-maroon px-3 py-2 text-ivory"
                  : "rounded-2xl bg-sand px-3 py-2 text-ink ring-1 ring-maroon/10"
              }
            >
              {msg.text}
            </div>
            {msg.payload?.demo ? (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-gold/20 px-3 py-2 text-sm">
                <span>
                  <strong>{t("demoBanner")}</strong> ·{" "}
                  {msg.payload.errorKind === "location"
                    ? t("demoHintLocation")
                    : msg.payload.errorKind === "no_key"
                      ? t("demoHintNoKey")
                      : msg.payload.errorKind === "model"
                        ? t("demoHintModel")
                        : t("demoHint")}
                </span>
                {lastUser ? (
                  <button
                    type="button"
                    className="min-h-11 shrink-0 rounded-full bg-maroon px-3 text-ivory"
                    onClick={() => ask(lastUser, true)}
                  >
                    {t("retry")}
                  </button>
                ) : null}
              </div>
            ) : null}
            {msg.payload ? <ResultCards payload={msg.payload} /> : null}
          </div>
        ))}

        {loading ? (
          <div className="space-y-2">
            <p className="text-sm text-muted">{t("searching")}</p>
            <div className="h-20 animate-pulse rounded-2xl bg-sand" />
            <div className="h-20 animate-pulse rounded-2xl bg-sand" />
          </div>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {STARTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={loading}
              onClick={() => ask(locale === "my" ? item.textMy : item.textEn)}
              className="min-h-11 rounded-full bg-sand px-3 text-sm text-maroon ring-1 ring-maroon/15"
            >
              {t(item.key)}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {destinations.slice(0, 4).map((city) => (
            <button
              key={city.slug}
              type="button"
              disabled={loading}
              onClick={() => ask(bi(locale, city.prompt))}
              className="min-h-11 rounded-full bg-sand px-3 text-sm text-maroon ring-1 ring-maroon/15"
            >
              {bi(locale, city.name)}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2 border-t border-maroon/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("askPlaceholder")}
          className="min-h-11 flex-1 rounded-full bg-sand px-4 text-[16px] outline-none ring-1 ring-maroon/10"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="min-h-11 rounded-full bg-maroon px-4 font-medium text-ivory disabled:opacity-50"
        >
          {t("send")}
        </button>
      </form>
    </aside>
  );
}

function ResultCards({ payload }: { payload: ChatPayload }) {
  const { locale, t } = useLocale();
  const trip = useTrip();

  return (
    <div className="space-y-3">
      {payload.itinerary && payload.itinerary.length > 0 ? (
        <button
          type="button"
          onClick={() => trip.applyItinerary(payload.itinerary ?? [], payload.attractions)}
          className="min-h-11 w-full rounded-full bg-maroon text-ivory"
        >
          {t("applyRoute")}
        </button>
      ) : null}

      {payload.attractions.length > 0 ? (
        <Rail title={t("attractions")}>
          {payload.attractions.map((item) => (
            <AttractionCard key={item.id} item={item} locale={locale} />
          ))}
        </Rail>
      ) : null}
      {payload.hotels.length > 0 ? (
        <Rail title={t("hotels")}>
          {payload.hotels.map((item) => (
            <HotelCard key={item.id} item={item} locale={locale} />
          ))}
        </Rail>
      ) : null}
      {payload.buses.length > 0 ? (
        <Rail title={t("buses")}>
          {payload.buses.map((item) => (
            <BusCard key={item.id} item={item} locale={locale} />
          ))}
        </Rail>
      ) : null}
    </div>
  );
}

function Rail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

function AttractionCard({ item, locale }: { item: Attraction; locale: "en" | "my" }) {
  const { t } = useLocale();
  const trip = useTrip();
  const added = trip.hasItem(item.id);
  return (
    <article className="w-56 shrink-0 rounded-2xl bg-ivory p-3 ring-1 ring-maroon/10">
      <ListingPhoto src={item.imageUrl} alt={bi(locale, item.name)} kind="attraction" />
      <p className="font-semibold leading-snug">{bi(locale, item.name)}</p>
      <p className="text-sm text-muted">
        {item.city} · {item.durationHours} {t("hours")}
      </p>
      <div className="mt-2">
        <MapsLink
          className="w-full"
          href={googleMapsPlaceUrl(`${item.name.en}, ${item.city}`)}
        />
      </div>
      <button
        type="button"
        onClick={() => trip.addAttraction(item)}
        disabled={added}
        className={`mt-2 min-h-11 w-full rounded-full text-sm ${added ? "bg-gold/30 text-ink" : "bg-maroon text-ivory"}`}
      >
        {added ? t("added") : t("addToTrip")}
      </button>
    </article>
  );
}

function HotelCard({ item, locale }: { item: Hotel; locale: "en" | "my" }) {
  const { t } = useLocale();
  const trip = useTrip();
  const added = trip.hasItem(item.id);
  return (
    <article className="w-56 shrink-0 rounded-2xl bg-ivory p-3 ring-1 ring-maroon/10">
      <ListingPhoto src={item.imageUrl} alt={bi(locale, item.name)} kind="hotel" />
      <p className="font-semibold leading-snug">{bi(locale, item.name)}</p>
      <p className="text-sm text-muted">{bi(locale, item.area)}</p>
      <p className="text-sm">
        {t("typicalPrice")} {formatMmk(item.priceMmkMin)}–{formatMmk(item.priceMmkMax)} {t("mmk")}
      </p>
      <div className="mt-2">
        <MapsLink
          className="w-full"
          href={googleMapsPlaceUrl(`${item.name.en}, ${item.area.en}, ${item.city}`)}
        />
      </div>
      <button
        type="button"
        onClick={() => trip.addHotel(item)}
        disabled={added}
        className={`mt-2 min-h-11 w-full rounded-full text-sm ${added ? "bg-gold/30 text-ink" : "bg-maroon text-ivory"}`}
      >
        {added ? t("added") : t("addToTrip")}
      </button>
    </article>
  );
}

function BusCard({ item, locale }: { item: Bus; locale: "en" | "my" }) {
  const { t } = useLocale();
  const trip = useTrip();
  const added = trip.hasItem(item.id);
  return (
    <article className="w-56 shrink-0 rounded-2xl bg-ivory p-3 ring-1 ring-maroon/10">
      <ListingPhoto
        src={item.imageUrl}
        alt={`${bi(locale, item.from)} ${bi(locale, item.to)}`}
        kind="bus"
      />
      <p className="font-semibold leading-snug">
        {bi(locale, item.from)} → {bi(locale, item.to)}
      </p>
      <p className="text-sm text-muted">
        {item.operator} · {formatMmk(item.fareMmk)} {t("mmk")}
      </p>
      <p className="text-sm">{bi(locale, item.departWindow)}</p>
      <div className="mt-2">
        <MapsLink className="w-full" href={googleMapsDirectionsUrl(item.from.en, item.to.en)} />
      </div>
      <button
        type="button"
        onClick={() => trip.addBus(item)}
        disabled={added}
        className={`mt-2 min-h-11 w-full rounded-full text-sm ${added ? "bg-gold/30 text-ink" : "bg-maroon text-ivory"}`}
      >
        {added ? t("added") : t("addToTrip")}
      </button>
    </article>
  );
}

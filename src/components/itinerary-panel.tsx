"use client";

import { ListingPhoto } from "@/components/listing-photo";
import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";
import { destinations } from "@/data/destinations";
import { bi } from "@/i18n";
import { estimateDaySchedule, formatClock } from "@/lib/timeline";
import type { Attraction } from "@/lib/types";

function formatMmk(value: number) {
  return value.toLocaleString();
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function ItineraryPanel() {
  const { locale, t } = useLocale();
  const trip = useTrip();
  const days = groupDays(trip.attractions);
  const empty = trip.attractions.length === 0 && trip.hotels.length === 0 && trip.buses.length === 0;
  const origin = destinations.find((item) => item.slug === trip.originSlug);
  const dest = destinations.find((item) => item.slug === trip.destinationSlug);
  const hasLodgingOrTransit = trip.hotels.length > 0 || trip.buses.length > 0;

  return (
    <aside
      data-testid="itinerary-panel"
      className="pointer-events-auto flex h-full max-h-[min(78vh,720px)] w-[min(100%,380px)] flex-col overflow-hidden rounded-[20px] bg-ivory/95 shadow-xl ring-1 ring-maroon/15"
    >
      <div className="border-b border-maroon/10 px-4 py-3">
        <p className="font-semibold text-maroon">{t("trip")}</p>
        {origin || dest ? (
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-sm text-ink">
              {origin ? bi(locale, origin.name) : "—"} → {dest ? bi(locale, dest.name) : "—"}
            </p>
            <button
              type="button"
              onClick={() => trip.resetRoute()}
              className="min-h-11 shrink-0 rounded-full px-3 text-sm text-maroon ring-1 ring-maroon/20"
            >
              {t("changeRoute")}
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted">{t("typicalPrice")}</p>
        )}
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {empty ? <p className="text-sm text-muted">{t("emptyTrip")}</p> : null}

        {days.map((group) => {
          const stops = estimateDaySchedule(group.items);
          return (
            <section key={group.day} className="relative">
              <div className="absolute bottom-2 left-[52px] top-3 w-px bg-gold" aria-hidden />
              <div className="relative mb-3 flex items-center gap-1">
                <div className="w-11 shrink-0" />
                <div className="relative z-10 flex w-3 shrink-0 justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-ivory" aria-hidden />
                </div>
                <h2 className="relative z-10 inline-flex rounded-full bg-maroon px-3 py-1 text-sm text-ivory">
                  {t("day")} {group.day}
                </h2>
              </div>
              <ol className="space-y-3">
                {stops.map((stop) => (
                  <li key={stop.item.id} className="relative flex items-start gap-1">
                    <div className="w-11 shrink-0 pt-0.5 text-right">
                      <p className="text-[10px] leading-none text-muted">{t("estTime")}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
                        {formatClock(stop.startMinutes)}
                      </p>
                      <p className="text-xs tabular-nums text-muted">{formatClock(stop.endMinutes)}</p>
                    </div>
                    <div className="relative z-10 flex w-3 shrink-0 justify-center pt-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-maroon ring-2 ring-ivory" aria-hidden />
                    </div>
                    <div className="flex min-w-0 flex-1 items-stretch gap-1 overflow-hidden rounded-2xl bg-sand ring-1 ring-maroon/10">
                      <button
                        type="button"
                        onClick={() => trip.setFocusId(stop.item.id)}
                        className="flex min-h-11 min-w-0 flex-1 items-center gap-2 p-1.5 text-left"
                      >
                        <ListingPhoto
                          src={stop.item.imageUrl}
                          alt={bi(locale, stop.item.name)}
                          kind="attraction"
                          variant="thumb"
                        />
                        <span className="min-w-0">
                          <span className="block font-medium leading-snug">{bi(locale, stop.item.name)}</span>
                          <span className="block text-sm text-muted">
                            {stop.item.city} · {stop.item.durationHours} {t("hours")}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => trip.removeAttraction(stop.item.id)}
                        aria-label={t("remove")}
                        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center self-center rounded-full text-maroon ring-1 ring-maroon/20"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}

        {hasLodgingOrTransit && days.length > 0 ? (
          <div className="border-t border-maroon/10" aria-hidden />
        ) : null}

        {trip.hotels.length > 0 ? (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted">{t("hotels")}</h2>
            <ul className="space-y-2">
              {trip.hotels.map((item) => (
                <li key={item.id} className="overflow-hidden rounded-2xl bg-sand ring-1 ring-maroon/10">
                  <ListingPhoto src={item.imageUrl} alt={bi(locale, item.name)} kind="hotel" />
                  <div className="p-2 pt-0">
                    <button type="button" className="w-full text-left" onClick={() => trip.setFocusId(item.id)}>
                      <p className="font-medium">{bi(locale, item.name)}</p>
                      <p className="text-sm text-muted">{bi(locale, item.area)}</p>
                      <p className="text-sm">
                        {t("typicalPrice")} {formatMmk(item.priceMmkMin)}–{formatMmk(item.priceMmkMax)} {t("mmk")}
                      </p>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex min-h-11 items-center rounded-full bg-maroon px-4 text-ivory"
                        >
                          {t("call")}
                        </a>
                      ) : (
                        <p className="self-center text-sm text-muted">{t("noPhone")}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => trip.removeHotel(item.id)}
                        aria-label={t("remove")}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-maroon ring-1 ring-maroon/20"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {trip.buses.length > 0 ? (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted">{t("buses")}</h2>
            <ul className="space-y-2">
              {trip.buses.map((item) => (
                <li key={item.id} className="overflow-hidden rounded-2xl bg-sand ring-1 ring-maroon/10">
                  <ListingPhoto
                    src={item.imageUrl}
                    alt={`${bi(locale, item.from)} ${bi(locale, item.to)}`}
                    kind="bus"
                  />
                  <div className="flex items-stretch gap-1 p-2 pt-0">
                    <div className="min-w-0 flex-1 px-2">
                      <p className="font-medium">
                        {bi(locale, item.from)} → {bi(locale, item.to)}
                      </p>
                      <p className="text-sm text-muted">
                        {item.operator} · {item.durationHours} {t("hours")}
                      </p>
                      <p className="text-sm">
                        {t("typicalPrice")} {formatMmk(item.fareMmk)} {t("mmk")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => trip.removeBus(item.id)}
                      aria-label={t("remove")}
                      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center self-start rounded-full text-maroon ring-1 ring-maroon/20"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}

function groupDays(items: Attraction[]) {
  const map = new Map<number, typeof items>();
  for (const item of items) {
    const day = item.day && item.day > 0 ? item.day : 1;
    const list = map.get(day) ?? [];
    list.push(item);
    map.set(day, list);
  }
  if (map.size === 0 && items.length) {
    return [{ day: 1, items }];
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, grouped]) => ({ day, items: grouped }));
}

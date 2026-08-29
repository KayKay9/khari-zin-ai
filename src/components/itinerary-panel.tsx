"use client";

import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";
import { bi } from "@/i18n";
import type { Attraction } from "@/lib/types";

function formatMmk(value: number) {
  return value.toLocaleString();
}

export function ItineraryPanel() {
  const { locale, t } = useLocale();
  const trip = useTrip();
  const days = groupDays(trip.attractions);
  const empty = trip.attractions.length === 0 && trip.hotels.length === 0 && trip.buses.length === 0;

  return (
    <aside className="pointer-events-auto flex h-full max-h-[min(78vh,720px)] w-[min(100%,380px)] flex-col overflow-hidden rounded-[20px] bg-ivory/95 shadow-xl ring-1 ring-maroon/15">
      <div className="border-b border-maroon/10 px-4 py-3">
        <p className="font-semibold text-maroon">{t("trip")}</p>
        <p className="text-xs text-muted">{t("typicalPrice")}</p>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {empty ? <p className="text-sm text-muted">{t("emptyTrip")}</p> : null}

        {days.map((group) => (
          <section key={group.day}>
            <h2 className="mb-2 inline-flex rounded-full bg-maroon px-3 py-1 text-sm text-ivory">
              {t("day")} {group.day}
            </h2>
            <ul className="space-y-2">
              {group.items.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => trip.setFocusId(item.id)}
                    className="w-full rounded-2xl bg-sand px-3 py-2 text-left ring-1 ring-maroon/10"
                  >
                    <p className="font-medium">
                      {index + 1}. {bi(locale, item.name)}
                    </p>
                    <p className="text-sm text-muted">{item.city}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => trip.removeAttraction(item.id)}
                    className="mt-1 text-sm text-maroon"
                  >
                    {t("remove")}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {trip.hotels.length > 0 ? (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted">{t("hotels")}</h2>
            <ul className="space-y-2">
              {trip.hotels.map((item) => (
                <li key={item.id} className="rounded-2xl bg-sand px-3 py-2 ring-1 ring-maroon/10">
                  <button type="button" className="w-full text-left" onClick={() => trip.setFocusId(item.id)}>
                    <p className="font-medium">{bi(locale, item.name)}</p>
                    <p className="text-sm text-muted">{bi(locale, item.area)}</p>
                    <p className="text-sm">
                      {t("typicalPrice")} {formatMmk(item.priceMmkMin)}–{formatMmk(item.priceMmkMax)} {t("mmk")}
                    </p>
                  </button>
                  {item.phone ? (
                    <a href={`tel:${item.phone}`} className="mt-2 inline-flex min-h-11 items-center rounded-full bg-maroon px-4 text-ivory">
                      {t("call")} · {item.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-muted">{t("noPhone")}</p>
                  )}
                  <button type="button" onClick={() => trip.removeHotel(item.id)} className="mt-1 block text-sm text-maroon">
                    {t("remove")}
                  </button>
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
                <li key={item.id} className="rounded-2xl bg-sand px-3 py-2 ring-1 ring-maroon/10">
                  <p className="font-medium">
                    {bi(locale, item.from)} → {bi(locale, item.to)}
                  </p>
                  <p className="text-sm text-muted">
                    {item.operator} · {item.durationHours} {t("hours")}
                  </p>
                  <p className="text-sm">
                    {t("typicalPrice")} {formatMmk(item.fareMmk)} {t("mmk")}
                  </p>
                  <p className="text-sm">{bi(locale, item.departWindow)}</p>
                  <button type="button" onClick={() => trip.removeBus(item.id)} className="mt-1 text-sm text-maroon">
                    {t("remove")}
                  </button>
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

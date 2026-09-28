import type { Attraction, Bus, Hotel } from "../../src/lib/types";
import { emptyBatch, type CrawlBatch } from "./batch";
import { fetchJson } from "./http";
import {
  cityName,
  citySlugFromText,
  hoursBetween,
  isPlannedRoute,
  pin,
  ROUTES,
  slugId,
  snapshotNote,
  stripHtml,
  USD_TO_MMK,
  usdToMmk,
  type CitySlug,
} from "./places";

const ENDPOINT = "https://v4-be.flymya.com/graphql/guest";
const SITE = "Flymya";

const BUS_NAMES: Record<CitySlug, string[]> = {
  yangon: ["Yangon"],
  mandalay: ["Mandalay"],
  bagan: ["Bagan/Nyaung-U", "Bagan"],
  inle: ["Inle", "Nyaung Shwe(Inle)", "HeHoe"],
  "hpa-an": ["Hpa-An"],
};

type Gql<T> = { data?: T; errors?: Array<{ message?: string }> };

async function guestQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  const body = await fetchJson<Gql<T>>(ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  });
  if (!body?.data) {
    console.log(`flymya graphql empty${body?.errors?.[0]?.message ? `: ${body.errors[0].message}` : ""}`);
    return null;
  }
  return body.data;
}

type BusHit = {
  operator_name_en?: string | null;
  departure_date_time?: string | null;
  est_arrival_date_time?: string | null;
  fare_breakdowns?: { sp?: number | string | null } | null;
};

async function busesFor(origin: CitySlug, dest: CitySlug, crawledAt: string, travelDate: string): Promise<Bus[]> {
  const query = `query($input:BusRouteInput!){
    busRoute(input:$input){
      operator_name_en
      departure_date_time
      est_arrival_date_time
      fare_breakdowns { sp }
    }
  }`;
  let hits: BusHit[] = [];
  for (const from of BUS_NAMES[origin]) {
    for (const to of BUS_NAMES[dest]) {
      const data = await guestQuery<{ busRoute?: BusHit[] }>(query, {
        input: {
          from,
          to,
          travel_date: travelDate,
          no_of_passengers: 1,
          foreigner: false,
          class_type_id: 1,
        },
      });
      hits = data?.busRoute ?? [];
      if (hits.length) break;
    }
    if (hits.length) break;
  }
  if (!hits.length) {
    console.log(`flymya no buses ${origin} -> ${dest}`);
    return [];
  }

  const cheapest = new Map<string, BusHit>();
  for (const hit of hits) {
    const operator = hit.operator_name_en?.trim();
    const fare = Number(hit.fare_breakdowns?.sp);
    if (!operator || !Number.isFinite(fare) || fare <= 0) continue;
    const prev = cheapest.get(operator);
    const prevFare = Number(prev?.fare_breakdowns?.sp);
    if (!prev || fare < prevFare) cheapest.set(operator, hit);
  }

  return [...cheapest.entries()]
    .sort((a, b) => Number(a[1].fare_breakdowns?.sp) - Number(b[1].fare_breakdowns?.sp))
    .slice(0, 4)
    .map(([operator, hit]) => {
      const depart = hit.departure_date_time ?? "";
      const clock = depart.slice(11, 16) || "Evening";
      const duration = hoursBetween(depart, hit.est_arrival_date_time ?? "") || 8;
      return {
        id: slugId(["flymya", "bus", origin, dest, operator]),
        from: cityName(origin),
        to: cityName(dest),
        operator,
        durationHours: duration,
        fareMmk: Math.round(Number(hit.fare_breakdowns?.sp)),
        departWindow: { en: clock, my: clock },
        notes: snapshotNote(SITE, crawledAt),
        photoQuery: `${operator} bus Myanmar`,
        sourceUrl: "https://flymya.com/en/bus",
        crawledAt,
      } satisfies Bus;
    });
}

type HotelHit = {
  hotel_name?: string | null;
  address?: string | null;
  price?: number | null;
  currency?: string | null;
};

async function hotels(crawledAt: string): Promise<Hotel[]> {
  const data = await guestQuery<{ longStayHotels?: HotelHit[] }>(
    `{ longStayHotels { hotel_name address price currency } }`,
  );
  const rows = data?.longStayHotels ?? [];
  const hotelsOut: Hotel[] = [];
  let index = 0;
  for (const row of rows) {
    const name = row.hotel_name?.trim();
    const address = row.address?.trim() || "";
    const slug = citySlugFromText(`${address} ${name ?? ""}`);
    const raw = Number(row.price);
    if (!name || !slug || !Number.isFinite(raw) || raw <= 0) continue;
    const listedUsd = /usd/i.test(row.currency ?? "");
    const mmk = listedUsd ? usdToMmk(raw) : Math.round(raw);
    if (mmk > 800_000) continue;
    const spot = pin(slug, index);
    index += 1;
    hotelsOut.push({
      id: slugId(["flymya", "hotel", slug, name]),
      name: { en: name, my: name },
      city: cityName(slug).en,
      area: { en: address || cityName(slug).en, my: address || cityName(slug).my },
      priceMmkMin: mmk,
      priceMmkMax: mmk,
      notes: {
        en: listedUsd
          ? `${snapshotNote(SITE, crawledAt).en} Listed in USD; converted at ${USD_TO_MMK.toLocaleString()} MMK per USD.`
          : snapshotNote(SITE, crawledAt).en,
        my: snapshotNote(SITE, crawledAt).my,
      },
      lat: spot.lat,
      lng: spot.lng,
      photoQuery: `${name} ${cityName(slug).en} hotel`,
      sourceUrl: "https://flymya.com/en",
      crawledAt,
    });
  }
  return hotelsOut;
}

type Promo = {
  id?: string | null;
  slug?: string | null;
  name_en?: string | null;
  active?: boolean | null;
  descriptions?: Array<{ translation_text?: string | null }> | null;
};

async function tours(crawledAt: string): Promise<Attraction[]> {
  const data = await guestQuery<{ clientPromotions?: Promo[] }>(
    `query($input:clientPromotionsInput!){
      clientPromotions(input:$input){ id slug name_en active descriptions { translation_text } }
    }`,
    { input: { client: "default", client_type: "default", page: 1 } },
  );
  const attractions: Attraction[] = [];
  let index = 0;
  for (const promo of data?.clientPromotions ?? []) {
    if (promo.active === false) continue;
    const title = stripHtml(promo.name_en ?? "").replace(/^["'\s]+|["'\s]+$/g, "");
    const blurb = stripHtml(promo.descriptions?.[0]?.translation_text ?? "").slice(0, 160);
    if (!title || /hanoi|halong|bangkok|phuket|bali|pattaya|singapore|hua hin/i.test(title)) continue;
    const slug = citySlugFromText(title);
    if (!slug) continue;
    const days = Number(title.match(/(\d+)\s*D/i)?.[1] ?? 0);
    const spot = pin(slug, index);
    index += 1;
    attractions.push({
      id: slugId(["flymya", "tour", promo.slug || title]),
      name: { en: title, my: title },
      city: cityName(slug).en,
      category: "tour",
      durationHours: days > 0 ? Math.min(days * 6, 12) : 4,
      tips: {
        en: blurb || snapshotNote(SITE, crawledAt).en,
        my: snapshotNote(SITE, crawledAt).my,
      },
      lat: spot.lat,
      lng: spot.lng,
      day: index <= 2 ? 1 : 2,
      photoQuery: `${title} Myanmar`,
      sourceUrl: promo.slug ? `https://flymya.com/tour-package/${promo.slug}` : "https://flymya.com/en/tour-packages",
      crawledAt,
    });
  }
  return attractions;
}

export async function crawlFlymya(crawledAt: string): Promise<CrawlBatch> {
  const batch = emptyBatch(SITE);
  const travelDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  for (const [origin, dest] of ROUTES) {
    if (!isPlannedRoute(origin, dest)) continue;
    const rows = await busesFor(origin, dest, crawledAt, travelDate);
    batch.buses.push(...rows);
  }
  batch.hotels.push(...(await hotels(crawledAt)));
  batch.attractions.push(...(await tours(crawledAt)));
  return batch;
}

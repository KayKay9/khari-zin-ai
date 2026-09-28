import { destinations } from "../../src/data/destinations";
import type { Bilingual } from "../../src/lib/types";

export const CITY_SLUGS = ["yangon", "mandalay", "bagan", "inle", "hpa-an"] as const;
export type CitySlug = (typeof CITY_SLUGS)[number];

const EXTRA_KEYS: Record<string, string[]> = {
  yangon: ["rangoon", "ရန်ကုန်"],
  mandalay: ["မန္တလေး"],
  bagan: ["nyaung u", "nyaung-u", "ညောင်ဦး", "ပုဂံ"],
  inle: ["heho", "nyaung shwe", "nyaungshwe", "အင်းလေး", "ညောင်ရွှေ", "ဟဲဟိုး"],
  "hpa-an": ["hpa an", "hpaan", "pa-an", "ဘားအံ"],
};

export const ROUTES: Array<[CitySlug, CitySlug]> = [
  ["yangon", "mandalay"],
  ["yangon", "bagan"],
  ["yangon", "inle"],
  ["yangon", "hpa-an"],
  ["mandalay", "bagan"],
  ["mandalay", "inle"],
];

export function cityBySlug(slug: string) {
  return destinations.find((item) => item.slug === slug);
}

export function cityName(slug: string): Bilingual {
  const city = cityBySlug(slug);
  return city?.name ?? { en: slug, my: slug };
}

export function citySlugFromText(text: string): CitySlug | null {
  const hay = text.toLowerCase();
  const ordered: CitySlug[] = ["hpa-an", "inle", "bagan", "mandalay", "yangon"];
  for (const slug of ordered) {
    const dest = cityBySlug(slug);
    const keys = [slug, dest?.name.en ?? "", dest?.name.my ?? "", ...(EXTRA_KEYS[slug] ?? [])];
    if (keys.some((key) => key && hay.includes(key.toLowerCase()))) return slug;
  }
  return null;
}

export function pin(slug: string, index: number) {
  const city = cityBySlug(slug);
  const lat = (city?.lat ?? 16.8) + index * 0.012;
  const lng = (city?.lng ?? 96.1) + (index % 3) * 0.01;
  return { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 };
}

export function slugId(parts: string[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function snapshotNote(site: string, crawledAt: string): Bilingual {
  const day = crawledAt.slice(0, 10);
  return {
    en: `Snapshot from ${site} on ${day}. Not a live ticket.`,
    my: `${site} မှ ${day} ဈေးနှုန်းမှတ်တမ်းပါ။ လက်မှတ်တိုက်ရိုက်မဟုတ်ပါ။`,
  };
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hoursBetween(start: string, end: string) {
  const from = Date.parse(start.replace(" ", "T"));
  const to = Date.parse(end.replace(" ", "T"));
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0;
  return Math.round(((to - from) / 36e5) * 10) / 10;
}

export const USD_TO_MMK = 2100;

export function usdToMmk(usd: number) {
  return Math.round(usd * USD_TO_MMK);
}

export function routeKey(from: string, to: string) {
  return `${from}|${to}`;
}

export function isPlannedRoute(from: string, to: string) {
  return ROUTES.some(([origin, dest]) => origin === from && dest === to);
}

const FLIGHT_HOURS: Record<string, number> = {
  "yangon|mandalay": 1.5,
  "yangon|bagan": 1.3,
  "yangon|inle": 1.2,
  "yangon|hpa-an": 1,
  "mandalay|bagan": 0.6,
  "mandalay|inle": 0.5,
  "bagan|inle": 0.4,
};

export function flightHours(from: string, to: string) {
  return FLIGHT_HOURS[routeKey(from, to)] ?? 1.5;
}

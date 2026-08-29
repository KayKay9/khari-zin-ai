import { defaultDemoTrip, demoByCity } from "@/data/demo";
import { destinations } from "@/data/destinations";
import { attachDemoPhotos } from "@/lib/photos";
import type { Bus, ChatPayload } from "@/lib/types";

const CITY_ALIASES: Record<string, string[]> = {
  yangon: ["yangon", "ရန်ကုန်", "rangoon"],
  mandalay: ["mandalay", "မန္တလေး"],
  bagan: ["bagan", "ပုဂံ", "nyaung-u", "ညောင်ဦး"],
  inle: ["inle", "အင်းလေး", "nyaungshwe", "ညောင်ရွှေ"],
  "hpa-an": ["hpa-an", "hpaan", "ဘားအံ", "pa-an"],
};

export function matchDemoCity(message: string): string | null {
  const lower = message.toLowerCase();
  for (const dest of destinations) {
    const aliases = CITY_ALIASES[dest.slug] ?? [dest.slug, dest.name.en, dest.name.my];
    if (aliases.some((alias) => lower.includes(alias.toLowerCase()))) {
      return dest.slug;
    }
  }
  return null;
}

function matchAllCities(message: string): string[] {
  const lower = message.toLowerCase();
  const found: string[] = [];
  for (const dest of destinations) {
    const aliases = CITY_ALIASES[dest.slug] ?? [dest.slug, dest.name.en, dest.name.my];
    if (aliases.some((alias) => lower.includes(alias.toLowerCase()))) {
      found.push(dest.slug);
    }
  }
  return found;
}

function allDemoBuses(): Bus[] {
  return Object.values(demoByCity).flatMap((city) => city.buses);
}

function busMatchesCity(text: { en: string; my: string }, slug: string) {
  const aliases = CITY_ALIASES[slug] ?? [slug];
  const hay = `${text.en} ${text.my}`.toLowerCase();
  return aliases.some((alias) => hay.includes(alias.toLowerCase()));
}

function busesForRoute(originSlug: string, destSlug: string): Bus[] {
  return allDemoBuses().filter(
    (bus) => busMatchesCity(bus.from, originSlug) && busMatchesCity(bus.to, destSlug),
  );
}

export function demoPayloadForMessage(
  message: string,
  originSlug?: string | null,
  destinationSlug?: string | null,
): ChatPayload {
  const fromMessage = matchAllCities(message);
  const origin = originSlug || fromMessage[0] || null;
  const destination =
    destinationSlug ||
    fromMessage.find((slug) => slug !== origin) ||
    (fromMessage.length === 1 && !originSlug ? fromMessage[0] : null);

  if (!destination || !demoByCity[destination]) {
    return attachDemoPhotos({ ...defaultDemoTrip, demo: true });
  }

  const city = demoByCity[destination];
  const dest = destinations.find((item) => item.slug === destination);
  const originDest = destinations.find((item) => item.slug === origin);
  const buses =
    origin && origin !== destination
      ? busesForRoute(origin, destination)
      : city.buses;

  const payload: ChatPayload = {
    reply: {
      en: originDest
        ? `Sample trip from ${originDest.name.en} to ${dest?.name.en ?? destination}.`
        : `Sample ${dest?.name.en ?? destination} listings while we reconnect to Gemini.`,
      my: originDest
        ? `${originDest.name.my} ကနေ ${dest?.name.my ?? destination} သွားတဲ့ နမူနာခရီးပါ။`
        : `${dest?.name.my ?? destination} နမူနာအချက်အလက်ပါ။ Gemini ပြန်ချိတ်ရင် ထပ်မေးနိုင်ပါတယ်။`,
    },
    attractions: city.attractions,
    hotels: city.hotels,
    buses: buses.length ? buses : city.buses,
    itinerary: [
      {
        day: 1,
        attractionIds: city.attractions.filter((a) => a.day === 1).map((a) => a.id),
      },
      {
        day: 2,
        attractionIds: city.attractions.filter((a) => a.day === 2).map((a) => a.id),
      },
    ].filter((day) => day.attractionIds.length > 0),
    demo: true,
  };

  return attachDemoPhotos(payload);
}

export function isUsablePayload(payload: ChatPayload | null | undefined): payload is ChatPayload {
  if (!payload) return false;
  const { attractions, hotels, buses } = payload;
  if (!attractions?.length && !hotels?.length && !buses?.length) return false;
  if (attractions?.length && attractions.some((item) => !Number.isFinite(item.lat) || !Number.isFinite(item.lng))) {
    return false;
  }
  return true;
}

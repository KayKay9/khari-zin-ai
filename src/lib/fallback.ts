import { defaultDemoTrip, demoByCity } from "@/data/demo";
import { destinations } from "@/data/destinations";
import type { ChatPayload } from "@/lib/types";

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

export function demoPayloadForMessage(message: string): ChatPayload {
  const slug = matchDemoCity(message);
  if (!slug) {
    return {
      ...defaultDemoTrip,
      demo: true,
    };
  }

  const city = demoByCity[slug];
  const dest = destinations.find((item) => item.slug === slug);
  return {
    reply: {
      en: `Sample ${dest?.name.en ?? slug} listings while we reconnect to Gemini.`,
      my: `${dest?.name.my ?? slug} နမူနာအချက်အလက်ပါ။ Gemini ပြန်ချိတ်ရင် ထပ်မေးနိုင်ပါတယ်။`,
    },
    attractions: city.attractions,
    hotels: city.hotels,
    buses: city.buses,
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

import { GoogleGenAI } from "@google/genai";
import { chatResponseSchema } from "@/lib/chat-schema";
import { attachListingPhotos } from "@/lib/photos";
import type { ChatPayload, Locale, TripSnapshot } from "@/lib/types";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

function compactTrip(trip?: TripSnapshot) {
  if (!trip) return { attractions: [], hotels: [], buses: [] };
  return {
    origin: trip.originSlug ?? null,
    destination: trip.destinationSlug ?? null,
    attractions: trip.attractions.map((item) => ({
      id: item.id,
      name: item.name.en,
      city: item.city,
    })),
    hotels: trip.hotels.map((item) => ({ id: item.id, name: item.name.en, city: item.city })),
    buses: trip.buses.map((item) => ({
      id: item.id,
      from: item.from.en,
      to: item.to.en,
    })),
    flights: (trip.flights ?? []).map((item) => ({
      id: item.id,
      from: item.from.en,
      to: item.to.en,
    })),
  };
}

function compactCatalog(catalog: ChatPayload) {
  return {
    attractions: catalog.attractions.map((item) => ({
      id: item.id,
      name: item.name.en,
      city: item.city,
    })),
    hotels: catalog.hotels.map((item) => ({
      id: item.id,
      name: item.name.en,
      city: item.city,
      priceMmkMin: item.priceMmkMin,
      priceMmkMax: item.priceMmkMax,
    })),
    buses: catalog.buses.map((item) => ({
      id: item.id,
      from: item.from.en,
      to: item.to.en,
      operator: item.operator,
      fareMmk: item.fareMmk,
    })),
    flights: (catalog.flights ?? []).map((item) => ({
      id: item.id,
      from: item.from.en,
      to: item.to.en,
      operator: item.operator,
      fareMmk: item.fareMmk,
    })),
  };
}

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function classifyGeminiError(err: unknown): "location" | "model" | "unavailable" {
  const msg = err instanceof Error ? err.message : String(err);
  if (/location is not supported/i.test(msg) || /FAILED_PRECONDITION/i.test(msg)) {
    return "location";
  }
  if (/no longer available/i.test(msg) || /NOT_FOUND/i.test(msg)) {
    return "model";
  }
  return "unavailable";
}

export async function generateChatPayload(input: {
  message: string;
  locale: Locale;
  trip?: TripSnapshot;
  originName?: string;
  destinationName?: string;
  catalog?: ChatPayload | null;
}): Promise<ChatPayload> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });
  const routeLine =
    input.originName && input.destinationName
      ? `The traveler STARTS in ${input.originName} and wants to GO to ${input.destinationName}. Buses must be FROM the start city TO the destination. Attractions and hotels should be mainly in the destination.`
      : "Infer start city and destination from the user message if possible.";

  const catalogLine = input.catalog
    ? `CRAWLED CATALOG (the only listings you may mention): ${JSON.stringify(compactCatalog(input.catalog))}
Do not invent attractions, hotels, buses, or flights. Return empty arrays for those lists.
Write the reply yourself. If they ask for a route, fill itinerary using only attraction ids from the catalog.`
    : `Only suggest real, well-known places inside Myanmar.
Prices and bus times are TYPICAL ranges in MMK, not live tickets.
Include usable map coordinates (lat/lng).
Each attraction, hotel, and bus MUST include photoQuery: the exact English place name plus Myanmar (e.g. "Ngwe Saung Beach Myanmar", "Shwedagon Pagoda Yangon"). Never a generic word like "beach" or "temple" alone.
Return attractions, hotels, and buses the user can add to a trip.
If they ask for a route, fill itinerary with day numbers and attraction ids.`;

  const prompt = `You are a travel planner for people who live in Myanmar (not foreign tourists).
Reply in both Burmese (my) and English.
${routeLine}
${catalogLine}
Match the user's language preference: ${input.locale}.
User message: ${input.message}
Current trip JSON: ${JSON.stringify(compactTrip(input.trip))}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: chatResponseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty Gemini response");
  }
  const parsed = JSON.parse(text) as ChatPayload;
  if (input.catalog) return { ...parsed, demo: false };
  return attachListingPhotos({ ...parsed, demo: false });
}

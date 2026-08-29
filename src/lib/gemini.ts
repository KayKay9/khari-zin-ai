import { GoogleGenAI } from "@google/genai";
import { chatResponseSchema } from "@/lib/chat-schema";
import type { ChatPayload, Locale, TripSnapshot } from "@/lib/types";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

function compactTrip(trip?: TripSnapshot) {
  if (!trip) return { attractions: [], hotels: [], buses: [] };
  return {
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
  };
}

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateChatPayload(input: {
  message: string;
  locale: Locale;
  trip?: TripSnapshot;
}): Promise<ChatPayload> {
  const ai = new GoogleGenAI({});
  const prompt = `You are a travel planner for people who live in Myanmar (not foreign tourists).
Reply in both Burmese (my) and English.
Only suggest real, well-known places inside Myanmar.
Prices and bus times are TYPICAL ranges in MMK, not live tickets.
Include usable map coordinates (lat/lng).
Match the user's language preference: ${input.locale}.
User message: ${input.message}
Current trip JSON: ${JSON.stringify(compactTrip(input.trip))}
Return attractions, hotels, and buses the user can add to a trip.
If they ask for a route, fill itinerary with day numbers and attraction ids.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: chatResponseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty Gemini response");
  }
  const parsed = JSON.parse(text) as ChatPayload;
  return { ...parsed, demo: false };
}

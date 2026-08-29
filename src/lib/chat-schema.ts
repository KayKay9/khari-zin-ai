import { Type } from "@google/genai";

const bilingual = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING },
    my: { type: Type.STRING },
  },
  required: ["en", "my"],
};

export const chatResponseSchema = {
  type: Type.OBJECT,
  properties: {
    reply: bilingual,
    attractions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: bilingual,
          city: { type: Type.STRING },
          category: { type: Type.STRING },
          durationHours: { type: Type.NUMBER },
          tips: bilingual,
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
          day: { type: Type.NUMBER },
          photoQuery: { type: Type.STRING },
        },
        required: ["id", "name", "city", "category", "durationHours", "tips", "lat", "lng", "photoQuery"],
      },
    },
    hotels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: bilingual,
          city: { type: Type.STRING },
          area: bilingual,
          priceMmkMin: { type: Type.NUMBER },
          priceMmkMax: { type: Type.NUMBER },
          phone: { type: Type.STRING },
          notes: bilingual,
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
          photoQuery: { type: Type.STRING },
        },
        required: ["id", "name", "city", "area", "priceMmkMin", "priceMmkMax", "notes", "photoQuery"],
      },
    },
    buses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          from: bilingual,
          to: bilingual,
          operator: { type: Type.STRING },
          durationHours: { type: Type.NUMBER },
          fareMmk: { type: Type.NUMBER },
          departWindow: bilingual,
          notes: bilingual,
          photoQuery: { type: Type.STRING },
        },
        required: ["id", "from", "to", "operator", "durationHours", "fareMmk", "departWindow", "photoQuery"],
      },
    },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          attractionIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["day", "attractionIds"],
      },
    },
  },
  required: ["reply", "attractions", "hotels", "buses"],
};

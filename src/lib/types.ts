export type Locale = "en" | "my";

export type Bilingual = {
  en: string;
  my: string;
};

export type Attraction = {
  id: string;
  name: Bilingual;
  city: string;
  category: string;
  durationHours: number;
  tips: Bilingual;
  lat: number;
  lng: number;
  day?: number;
};

export type Hotel = {
  id: string;
  name: Bilingual;
  city: string;
  area: Bilingual;
  priceMmkMin: number;
  priceMmkMax: number;
  phone?: string;
  notes: Bilingual;
  lat?: number;
  lng?: number;
};

export type Bus = {
  id: string;
  from: Bilingual;
  to: Bilingual;
  operator: string;
  durationHours: number;
  fareMmk: number;
  departWindow: Bilingual;
  notes?: Bilingual;
};

export type ItineraryDay = {
  day: number;
  attractionIds: string[];
};

export type ChatPayload = {
  reply: Bilingual;
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
  itinerary?: ItineraryDay[];
  demo?: boolean;
};

export type TripSnapshot = {
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
};

export type DestinationChip = {
  slug: string;
  name: Bilingual;
  lat: number;
  lng: number;
  image: string;
  prompt: Bilingual;
};

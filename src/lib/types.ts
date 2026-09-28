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
  photoQuery?: string;
  imageUrl?: string;
  sourceUrl?: string;
  crawledAt?: string;
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
  photoQuery?: string;
  imageUrl?: string;
  sourceUrl?: string;
  crawledAt?: string;
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
  photoQuery?: string;
  imageUrl?: string;
  sourceUrl?: string;
  crawledAt?: string;
};

export type Flight = {
  id: string;
  from: Bilingual;
  to: Bilingual;
  operator: string;
  durationHours: number;
  fareMmk: number;
  departWindow: Bilingual;
  notes?: Bilingual;
  photoQuery?: string;
  imageUrl?: string;
  sourceUrl?: string;
  crawledAt?: string;
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
  flights?: Flight[];
  itinerary?: ItineraryDay[];
  demo?: boolean;
  errorKind?: "no_key" | "location" | "model" | "unavailable";
};

export type TripSnapshot = {
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
  flights?: Flight[];
  originSlug?: string | null;
  destinationSlug?: string | null;
};

export type CatalogCity = {
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
  flights: Flight[];
};

export type CrawledCatalog = {
  crawledAt: string;
  cities: Record<string, CatalogCity>;
};

export type DestinationChip = {
  slug: string;
  name: Bilingual;
  lat: number;
  lng: number;
  image: string;
  prompt: Bilingual;
};

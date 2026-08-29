"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Attraction, Bus, Hotel, ItineraryDay, TripSnapshot } from "@/lib/types";

const STORAGE_KEY = "myanmar-trip-v1";

type TripContextValue = {
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
  focusId: string | null;
  addAttraction: (item: Attraction) => void;
  removeAttraction: (id: string) => void;
  addHotel: (item: Hotel) => void;
  removeHotel: (id: string) => void;
  addBus: (item: Bus) => void;
  removeBus: (id: string) => void;
  applyItinerary: (days: ItineraryDay[], catalog: Attraction[]) => void;
  setFocusId: (id: string | null) => void;
  hasItem: (id: string) => boolean;
  snapshot: TripSnapshot;
};

const TripContext = createContext<TripContextValue | null>(null);

function loadTrip(): Pick<TripContextValue, "attractions" | "hotels" | "buses"> {
  if (typeof window === "undefined") {
    return { attractions: [], hotels: [], buses: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attractions: [], hotels: [], buses: [] };
    const parsed = JSON.parse(raw) as TripSnapshot;
    return {
      attractions: parsed.attractions ?? [],
      hotels: parsed.hotels ?? [],
      buses: parsed.buses ?? [],
    };
  } catch {
    return { attractions: [], hotels: [], buses: [] };
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadTrip();
    setAttractions(loaded.attractions);
    setHotels(loaded.hotels);
    setBuses(loaded.buses);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ attractions, hotels, buses } satisfies TripSnapshot),
    );
  }, [attractions, hotels, buses, hydrated]);

  const addAttraction = useCallback((item: Attraction) => {
    setAttractions((prev) => (prev.some((row) => row.id === item.id) ? prev : [...prev, item]));
  }, []);

  const removeAttraction = useCallback((id: string) => {
    setAttractions((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const addHotel = useCallback((item: Hotel) => {
    setHotels((prev) => (prev.some((row) => row.id === item.id) ? prev : [...prev, item]));
  }, []);

  const removeHotel = useCallback((id: string) => {
    setHotels((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const addBus = useCallback((item: Bus) => {
    setBuses((prev) => (prev.some((row) => row.id === item.id) ? prev : [...prev, item]));
  }, []);

  const removeBus = useCallback((id: string) => {
    setBuses((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const applyItinerary = useCallback((days: ItineraryDay[], catalog: Attraction[]) => {
    const byId = new Map(catalog.map((item) => [item.id, item]));
    const ordered: Attraction[] = [];
    for (const day of [...days].sort((a, b) => a.day - b.day)) {
      for (const id of day.attractionIds) {
        const found = byId.get(id);
        if (found) ordered.push({ ...found, day: day.day });
      }
    }
    setAttractions((prev) => {
      const leftover = prev.filter((item) => !ordered.some((row) => row.id === item.id));
      return [...ordered, ...leftover];
    });
  }, []);

  const hasItem = useCallback(
    (id: string) =>
      attractions.some((item) => item.id === id) ||
      hotels.some((item) => item.id === id) ||
      buses.some((item) => item.id === id),
    [attractions, hotels, buses],
  );

  const snapshot = useMemo(
    () => ({ attractions, hotels, buses }),
    [attractions, hotels, buses],
  );

  const value = useMemo(
    () => ({
      attractions,
      hotels,
      buses,
      focusId,
      addAttraction,
      removeAttraction,
      addHotel,
      removeHotel,
      addBus,
      removeBus,
      applyItinerary,
      setFocusId,
      hasItem,
      snapshot,
    }),
    [
      attractions,
      hotels,
      buses,
      focusId,
      addAttraction,
      removeAttraction,
      addHotel,
      removeHotel,
      addBus,
      removeBus,
      applyItinerary,
      hasItem,
      snapshot,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}

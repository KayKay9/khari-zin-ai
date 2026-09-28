import type { Attraction, Bus, Flight, Hotel } from "../../src/lib/types";

export type CrawlBatch = {
  site: string;
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
  flights: Flight[];
};

export function emptyBatch(site: string): CrawlBatch {
  return { site, attractions: [], hotels: [], buses: [], flights: [] };
}

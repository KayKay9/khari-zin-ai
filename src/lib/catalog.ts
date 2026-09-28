import raw from "@/data/crawled/catalog.json";
import type { Bus, CrawledCatalog, Flight } from "@/lib/types";

export function loadCrawledCatalog(): CrawledCatalog | null {
  const data = raw as CrawledCatalog;
  if (!data?.crawledAt || !data.cities) return null;
  const filled = Object.values(data.cities).some(
    (city) =>
      (city.attractions?.length ?? 0) > 0 ||
      (city.hotels?.length ?? 0) > 0 ||
      (city.buses?.length ?? 0) > 0 ||
      (city.flights?.length ?? 0) > 0,
  );
  return filled ? data : null;
}

export function allCrawledBuses(catalog: CrawledCatalog): Bus[] {
  return Object.values(catalog.cities).flatMap((city) => city.buses ?? []);
}

export function allCrawledFlights(catalog: CrawledCatalog): Flight[] {
  return Object.values(catalog.cities).flatMap((city) => city.flights ?? []);
}

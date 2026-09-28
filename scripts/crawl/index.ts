import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Attraction, Bus, CatalogCity, CrawledCatalog, Flight, Hotel } from "../../src/lib/types";
import { crawlAirfares } from "./airfares";
import type { CrawlBatch } from "./batch";
import { crawlFlymya } from "./flymya";
import { crawlMzMall } from "./mzmall";
import { crawlEasybook, crawlMai, crawlMmBus, crawlOway, crawlTravelmm } from "./other-sites";
import { citySlugFromText, CITY_SLUGS } from "./places";

function emptyCity(): CatalogCity {
  return { attractions: [], hotels: [], buses: [], flights: [] };
}

function hotelKey(hotel: Hotel) {
  return `${hotel.city}|${hotel.name.en.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
}

function pushUnique<T extends { id: string }>(list: T[], item: T) {
  if (!list.some((row) => row.id === item.id)) list.push(item);
}

function placeHotel(cities: Record<string, CatalogCity>, hotel: Hotel) {
  const slug = citySlugFromText(hotel.city) ?? citySlugFromText(hotel.area.en);
  if (!slug) return;
  const city = cities[slug];
  if (city.hotels.some((row) => hotelKey(row) === hotelKey(hotel))) return;
  pushUnique(city.hotels, hotel);
}

function placeAttraction(cities: Record<string, CatalogCity>, item: Attraction) {
  const slug = citySlugFromText(item.city);
  if (!slug) return;
  pushUnique(cities[slug].attractions, item);
}

function placeRide(cities: Record<string, CatalogCity>, item: Bus | Flight, key: "buses" | "flights") {
  const dest = citySlugFromText(item.to.en);
  if (!dest) return;
  const list = cities[dest][key] as Array<Bus | Flight>;
  if (!list.some((row) => row.id === item.id)) list.push(item);
}

function merge(cities: Record<string, CatalogCity>, batch: CrawlBatch) {
  for (const item of batch.attractions) placeAttraction(cities, item);
  for (const item of batch.hotels) placeHotel(cities, item);
  for (const item of batch.buses) placeRide(cities, item, "buses");
  for (const item of batch.flights) placeRide(cities, item, "flights");
  console.log(
    `${batch.site}: ${batch.attractions.length} places, ${batch.hotels.length} hotels, ${batch.buses.length} buses, ${batch.flights.length} flights`,
  );
}

async function main() {
  const crawledAt = new Date().toISOString();
  const cities: Record<string, CatalogCity> = {};
  for (const slug of CITY_SLUGS) cities[slug] = emptyCity();

  const adapters = [
    () => crawlMzMall(crawledAt),
    () => crawlAirfares(crawledAt),
    () => crawlFlymya(crawledAt),
    () => crawlTravelmm(),
    () => crawlOway(),
    () => crawlMmBus(),
    () => crawlEasybook(),
    () => crawlMai(),
  ];

  for (const run of adapters) {
    try {
      merge(cities, await run());
    } catch (err) {
      console.log(`adapter failed ${err instanceof Error ? err.message : err}`);
    }
  }

  const catalog: CrawledCatalog = { crawledAt, cities };
  const out = path.join(process.cwd(), "src/data/crawled/catalog.json");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(catalog, null, 2)}\n`);
  const totals = Object.values(cities).reduce(
    (sum, city) => {
      sum.attractions += city.attractions.length;
      sum.hotels += city.hotels.length;
      sum.buses += city.buses.length;
      sum.flights += city.flights.length;
      return sum;
    },
    { attractions: 0, hotels: 0, buses: 0, flights: 0 },
  );
  console.log(`wrote ${out}`, totals);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import * as cheerio from "cheerio";
import type { Attraction, Hotel } from "../../src/lib/types";
import { emptyBatch, type CrawlBatch } from "./batch";
import { fetchText } from "./http";
import { cityName, pin, slugId, snapshotNote, type CitySlug } from "./places";

const SITE = "MZ Mall Travel";

const HOTEL_PAGES: Array<[CitySlug, string]> = [
  ["yangon", "https://mzmalltravel.com/yangon-hotels"],
  ["mandalay", "https://mzmalltravel.com/mandalay-hotels"],
  ["bagan", "https://mzmalltravel.com/bagan-hotels"],
  ["inle", "https://mzmalltravel.com/inle-lake-hotels"],
];

function mmk(text: string) {
  const match = text.replace(/,/g, "").match(/(\d{4,})/);
  return match ? Number(match[1]) : 0;
}

export async function crawlMzMall(crawledAt: string): Promise<CrawlBatch> {
  const batch = emptyBatch(SITE);
  let pinIndex = 0;
  for (const [slug, url] of HOTEL_PAGES) {
    const html = await fetchText(url);
    if (!html) continue;
    const $ = cheerio.load(html);
    const cards = $(".hotel-card");
    if (!cards.length) {
      console.log(`mzmall no hotel cards ${url}`);
      continue;
    }
    cards.each((_, el) => {
      const name = $(el).find("h3").first().text().replace(/\s+/g, " ").trim();
      const area = $(el).find(".meta").first().text().replace(/\s+/g, " ").trim();
      const price = mmk($(el).find(".price").text());
      if (!name || price <= 0) return;
      const spot = pin(slug, pinIndex);
      pinIndex += 1;
      const hotel: Hotel = {
        id: slugId(["mzmall", "hotel", slug, name]),
        name: { en: name, my: name },
        city: cityName(slug).en,
        area: { en: area || cityName(slug).en, my: area || cityName(slug).my },
        priceMmkMin: price,
        priceMmkMax: price,
        notes: snapshotNote(SITE, crawledAt),
        lat: spot.lat,
        lng: spot.lng,
        photoQuery: `${name} ${cityName(slug).en}`,
        sourceUrl: url,
        crawledAt,
      };
      batch.hotels.push(hotel);
    });
  }

  const tourUrl = "https://mzmalltravel.com/bagan-tour-package";
  const tourHtml = await fetchText(tourUrl);
  if (tourHtml) {
    const $ = cheerio.load(tourHtml);
    let index = 0;
    $("h3").each((_, el) => {
      const title = $(el).text().replace(/\s+/g, " ").trim();
      if (!/tour/i.test(title) || title.endsWith("?")) return;
      const slug: CitySlug = /mandalay/i.test(title) && !/bagan/i.test(title) ? "mandalay" : "bagan";
      const spot = pin(slug, index);
      index += 1;
      const attraction: Attraction = {
        id: slugId(["mzmall", "tour", title]),
        name: { en: title, my: title },
        city: cityName(slug).en,
        category: "tour",
        durationHours: /2d/i.test(title) ? 8 : /5d/i.test(title) ? 12 : 10,
        tips: snapshotNote(SITE, crawledAt),
        lat: spot.lat,
        lng: spot.lng,
        day: index,
        photoQuery: `${title} Myanmar`,
        sourceUrl: tourUrl,
        crawledAt,
      };
      batch.attractions.push(attraction);
    });
  }
  return batch;
}

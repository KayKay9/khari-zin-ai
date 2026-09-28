import * as cheerio from "cheerio";
import type { Attraction, Flight, Hotel } from "../../src/lib/types";
import { emptyBatch, type CrawlBatch } from "./batch";
import { fetchText } from "./http";
import {
  cityName,
  citySlugFromText,
  flightHours,
  isPlannedRoute,
  pin,
  slugId,
  snapshotNote,
  usdToMmk,
} from "./places";

const SITE = "Myanmar Airfares";
const HOME = "https://myanmarairfares.com/";

const ATTRACTION_PAGES = [
  "https://mail.myanmarairfares.com/things-to-do-in-yangon",
  "https://mail.myanmarairfares.com/things-to-do-in-mandalay",
  "https://mail.myanmarairfares.com/things-to-do-in-bagan",
  "https://mail.myanmarairfares.com/best-places-to-visit-in-myanmar",
];

const HOTEL_PAGES = [
  "https://myanmarairfares.com/hotels-in-yangon",
  "https://myanmarairfares.com/hotels-in-mandalay",
  "https://myanmarairfares.com/hotels-in-bagan",
  "https://myanmarairfares.com/hotels-in-inle-lake",
];

function money(text: string) {
  const usd = text.match(/\$\s*([0-9][0-9,]*)/);
  if (usd) return usdToMmk(Number(usd[1].replace(/,/g, "")));
  const mmk = text.replace(/,/g, "").match(/(\d{4,})\s*MMK|MMK\s*(\d{4,})/i);
  if (mmk) return Number(mmk[1] || mmk[2]);
  return 0;
}

export async function crawlAirfares(crawledAt: string): Promise<CrawlBatch> {
  const batch = emptyBatch(SITE);
  const home = await fetchText(HOME);
  if (!home) return batch;
  const $ = cheerio.load(home);
  const seen = new Set<string>();
  $("table.slider-flight-table").each((_, table) => {
    const fromSlug = citySlugFromText($(table).find("tr").first().text());
    if (!fromSlug) return;
    $(table)
      .find("tr")
      .slice(1)
      .each((__, row) => {
        const toSlug = citySlugFromText($(row).find(".slider-flight-from-title").text());
        const operator = $(row).find(".slider-flight-airline-title").text().replace(/\s+/g, " ").trim();
        const fare = money($(row).find(".slider-flight-price").text());
        if (!toSlug || !operator || fare <= 0 || !isPlannedRoute(fromSlug, toSlug)) return;
        const key = `${fromSlug}|${toSlug}|${operator.toLowerCase()}`;
        if (seen.has(key)) return;
        seen.add(key);
        const onclick = $(row).attr("onclick") ?? "";
        const href = onclick.match(/https?:\/\/[^']+/)?.[0];
        const flight: Flight = {
          id: slugId(["airfares", "flight", fromSlug, toSlug, operator]),
          from: cityName(fromSlug),
          to: cityName(toSlug),
          operator,
          durationHours: flightHours(fromSlug, toSlug),
          fareMmk: fare,
          departWindow: {
            en: "See the airline schedule",
            my: "လေကြောင်းအချိန်ဇယားကို ကြည့်ပါ",
          },
          notes: {
            en: `${snapshotNote(SITE, crawledAt).en} USD fare converted at 2,100 MMK.`,
            my: snapshotNote(SITE, crawledAt).my,
          },
          photoQuery: `${operator} flight Myanmar`,
          sourceUrl: href && !/payment|login|captcha/i.test(href) ? href : HOME,
          crawledAt,
        };
        batch.flights.push(flight);
      });
  });

  let pinIndex = 0;
  for (const url of ATTRACTION_PAGES) {
    const html = await fetchText(url);
    if (!html) continue;
    const page = cheerio.load(html);
    const pageCity = citySlugFromText(url);
    page("h2, h3").each((_, el) => {
      const raw = page(el).text().replace(/\s+/g, " ").trim();
      const title = raw.replace(/^\d+\.\s*/, "").replace(/^["'\s]+|["'\s]+$/g, "");
      if (title.length < 8 || title.length > 90 || title.endsWith("?")) return;
      if (/how to|best time|visa|hotel|swimming|nightlife|best things to do|popular /i.test(title)) return;
      if (/hanoi|halong|bangkok|phuket|bali|pattaya/i.test(title)) return;
      const namedCity = citySlugFromText(title);
      if (namedCity && cityName(namedCity).en.toLowerCase() === title.toLowerCase()) return;
      if (/^inle lake$/i.test(title)) return;
      const slug = namedCity || pageCity;
      if (!slug) return;
      const spot = pin(slug, pinIndex);
      pinIndex += 1;
      const attraction: Attraction = {
        id: slugId(["airfares", "place", slug, title]),
        name: { en: title, my: title },
        city: cityName(slug).en,
        category: /market|food|tea|beer/i.test(title) ? "food" : "sight",
        durationHours: /day trip/i.test(title) ? 6 : /pagoda|paya/i.test(title) ? 2 : 1.5,
        tips: snapshotNote(SITE, crawledAt),
        lat: spot.lat,
        lng: spot.lng,
        day: pinIndex <= 4 ? 1 : 2,
        photoQuery: `${title} Myanmar`,
        sourceUrl: url,
        crawledAt,
      };
      batch.attractions.push(attraction);
    });
  }

  for (const url of HOTEL_PAGES) {
    const html = await fetchText(url);
    if (!html) continue;
    const page = cheerio.load(html);
    const pageCity = citySlugFromText(url);
    if (!pageCity) continue;
    let found = 0;
    page("h2, h3").each((_, el) => {
      const name = page(el).text().replace(/\s+/g, " ").trim();
      if (!/hotel|inn|resort|guest/i.test(name) || name.endsWith("?") || name.length > 80) return;
      const around = `${name} ${page(el).next().text()} ${page(el).parent().text()}`.slice(0, 400);
      const price = money(around);
      if (price <= 0) return;
      const spot = pin(pageCity, found);
      found += 1;
      const hotel: Hotel = {
        id: slugId(["airfares", "hotel", pageCity, name]),
        name: { en: name, my: name },
        city: cityName(pageCity).en,
        area: cityName(pageCity),
        priceMmkMin: price,
        priceMmkMax: price,
        notes: snapshotNote(SITE, crawledAt),
        lat: spot.lat,
        lng: spot.lng,
        photoQuery: `${name} hotel`,
        sourceUrl: url,
        crawledAt,
      };
      batch.hotels.push(hotel);
    });
    if (!found) console.log(`airfares no priced hotels ${url}`);
  }

  return batch;
}

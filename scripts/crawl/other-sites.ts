import * as cheerio from "cheerio";
import { emptyBatch, type CrawlBatch } from "./batch";
import { collectionAllowed, fetchText } from "./http";
import { citySlugFromText, isPlannedRoute } from "./places";

function hasFare(html: string) {
  return /(?:MMK|USD|US\s*\$|\$\s*\d)/i.test(html);
}

export async function crawlTravelmm(): Promise<CrawlBatch> {
  const batch = emptyBatch("TravelMM");
  const html = await fetchText("https://travelmm.com/");
  if (!html) return batch;
  const $ = cheerio.load(html);
  const priced = $(".price, .hotel-card, .tour-card").length;
  if (!priced && !hasFare(html)) {
    console.log("travelmm public homepage has destination names but no fare table; skipped");
    return batch;
  }
  console.log("travelmm markup found but no parser match; skipped");
  return batch;
}

export async function crawlOway(): Promise<CrawlBatch> {
  const batch = emptyBatch("Oway");
  const html = await fetchText("https://www.oway.com.mm/");
  if (!html) return batch;
  const $ = cheerio.load(html);
  const listing = $(".hotel-card, .bus-card").length;
  const api = html.match(/https?:\/\/[^"' ]+\/(?:api|graphql)[^"' ]*/i);
  if (!listing && !api) {
    console.log("oway is a JavaScript shell with no public listing HTML; skipped");
    return batch;
  }
  console.log("oway returned a shell without a public catalog document; skipped");
  return batch;
}

export async function crawlMmBus(): Promise<CrawlBatch> {
  const batch = emptyBatch("MM Bus Ticket");
  const allowed = await collectionAllowed("https://www.mmbusticket.com/robots.txt");
  if (!allowed) {
    console.log("mmbusticket robots disallows collection; skipped");
    return batch;
  }
  const html = await fetchText("https://www.mmbusticket.com/");
  if (!html || !hasFare(html)) {
    console.log("mmbusticket homepage lists cities but no public fares; skipped");
    return batch;
  }
  return batch;
}

export async function crawlEasybook(): Promise<CrawlBatch> {
  const batch = emptyBatch("Easybook");
  const html = await fetchText("https://www.easybook.com/en-mm/bus");
  if (!html || !hasFare(html)) {
    console.log("easybook Myanmar bus page has no public fare table; skipped");
    return batch;
  }
  const $ = cheerio.load(html);
  let paired = 0;
  $("a").each((_, el) => {
    const text = $(el).text();
    const from = citySlugFromText(text);
    const to = citySlugFromText(text.replace(from ?? "", ""));
    if (from && to && isPlannedRoute(from, to) && hasFare(text)) paired += 1;
  });
  if (!paired) console.log("easybook fares were not tied to the planned city pairs; skipped");
  return batch;
}

export async function crawlMai(): Promise<CrawlBatch> {
  const batch = emptyBatch("MAI");
  const destinations = await fetchText("https://www.maiair.com/mai-experience/about-mai/our-destinations");
  if (!destinations) console.log("mai destinations page blocked; skipped that URL");
  const timetable = await fetchText("https://book-myanmar.crane.aero/ibe/timetable");
  if (!timetable || !hasFare(timetable)) {
    console.log("mai public timetable has airport choices but no fares; skipped");
    return batch;
  }
  return batch;
}

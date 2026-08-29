import { PHOTO } from "@/data/image-urls";
import type { ChatPayload } from "@/lib/types";

export type PhotoKind = "attraction" | "hotel" | "bus";

const UA = "MyanmarTripPlanner/1.0 (educational MVP)";

const PLACEHOLDERS: Record<PhotoKind, string> = {
  attraction: PHOTO.bagan,
  hotel: PHOTO.hotel,
  bus: PHOTO.bus,
};

const DEMO_IMAGES: Record<string, string> = {
  "demo-shwedagon": PHOTO.yangon,
  "demo-sule": PHOTO.temple,
  "demo-kandawgyi": PHOTO.nature,
  "demo-palace": PHOTO.mandalay,
  "demo-ubein": PHOTO.inle,
  "demo-mahamuni": PHOTO.temple,
  "demo-ananda": PHOTO.bagan,
  "demo-shwezigon": PHOTO.bagan,
  "demo-dhamma": PHOTO.temple,
  "demo-sunset-bu": PHOTO.bagan,
  "demo-phaung": PHOTO.inle,
  "demo-innpaw": PHOTO.inle,
  "demo-nyaungshwe": PHOTO.inle,
  "demo-zwegabin": PHOTO.hpaAn,
  "demo-kawgun": PHOTO.hpaAn,
  "demo-kyaukkalat": PHOTO.hpaAn,
};

export function placeholderPhoto(kind: PhotoKind) {
  return PLACEHOLDERS[kind];
}

function uniqueQueries(...parts: Array<string | undefined>) {
  const queries: string[] = [];
  for (const part of parts) {
    const text = part?.trim();
    if (!text) continue;
    queries.push(text);
    if (!/myanmar|burma/i.test(text)) queries.push(`${text} Myanmar`);
  }
  return [...new Set(queries)];
}

function httpsUrl(value?: string) {
  if (!value || !/^https:\/\//i.test(value)) return null;
  return value;
}

async function openversePhoto(query: string): Promise<string | null> {
  try {
    const url = `https://api.openverse.org/v1/images/?${new URLSearchParams({
      q: query,
      page_size: "5",
    })}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ url?: string; thumbnail?: string }>;
    };
    for (const hit of data.results ?? []) {
      const src = httpsUrl(hit.url) ?? httpsUrl(hit.thumbnail);
      if (src) return src;
    }
    return null;
  } catch {
    return null;
  }
}

async function wikiThumbnail(query: string): Promise<string | null> {
  const title = query.trim().replace(/\s+/g, "_");
  if (!title) return null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail?: { source?: string }; type?: string };
    if (data.type === "disambiguation") return null;
    return httpsUrl(data.thumbnail?.source);
  } catch {
    return null;
  }
}

export async function resolvePhoto(query: string | undefined, kind: PhotoKind, extra?: string): Promise<string> {
  for (const term of uniqueQueries(query, extra)) {
    const openverse = await openversePhoto(term);
    if (openverse) return openverse;
    const wiki = await wikiThumbnail(term);
    if (wiki) return wiki;
  }
  return placeholderPhoto(kind);
}

async function withPhoto<T extends { id: string; photoQuery?: string; imageUrl?: string }>(
  item: T,
  kind: PhotoKind,
  fallbackQuery?: string,
): Promise<T> {
  if (item.imageUrl) return item;
  const demo = DEMO_IMAGES[item.id];
  if (demo) return { ...item, imageUrl: demo, photoQuery: item.photoQuery };
  const query = item.photoQuery || fallbackQuery;
  const imageUrl = await resolvePhoto(query, kind, fallbackQuery);
  return { ...item, imageUrl, photoQuery: query };
}

export async function attachListingPhotos(payload: ChatPayload): Promise<ChatPayload> {
  const [attractions, hotels, buses] = await Promise.all([
    Promise.all(
      payload.attractions.map((item) => withPhoto(item, "attraction", `${item.name.en} ${item.city}`)),
    ),
    Promise.all(
      payload.hotels.map((item) => withPhoto(item, "hotel", `${item.name.en} ${item.city} hotel`)),
    ),
    Promise.all(
      payload.buses.map((item) =>
        withPhoto(item, "bus", `${item.operator} ${item.from.en} ${item.to.en} bus Myanmar`),
      ),
    ),
  ]);
  return { ...payload, attractions, hotels, buses };
}

export function attachDemoPhotos(payload: ChatPayload): ChatPayload {
  return {
    ...payload,
    attractions: payload.attractions.map((item) => ({
      ...item,
      photoQuery: item.photoQuery || item.name.en,
      imageUrl: item.imageUrl || DEMO_IMAGES[item.id] || placeholderPhoto("attraction"),
    })),
    hotels: payload.hotels.map((item) => ({
      ...item,
      photoQuery: item.photoQuery || item.name.en,
      imageUrl: item.imageUrl || DEMO_IMAGES[item.id] || placeholderPhoto("hotel"),
    })),
    buses: payload.buses.map((item) => ({
      ...item,
      photoQuery: item.photoQuery || `${item.operator} bus Myanmar`,
      imageUrl: item.imageUrl || placeholderPhoto("bus"),
    })),
  };
}

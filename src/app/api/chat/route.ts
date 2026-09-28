import { NextResponse } from "next/server";
import { destinations } from "@/data/destinations";
import { cacheGet, cacheSet, makeCacheKey, tripHash } from "@/lib/chat-cache";
import { isUsablePayload, payloadForMessage } from "@/lib/fallback";
import { classifyGeminiError, generateChatPayload, hasGeminiKey } from "@/lib/gemini";
import { attachListingPhotos } from "@/lib/photos";
import type { ChatPayload, ItineraryDay, Locale, TripSnapshot } from "@/lib/types";

function keepItinerary(
  days: ItineraryDay[] | undefined,
  attractionIds: Set<string>,
  backup: ItineraryDay[] | undefined,
) {
  const cleaned = (days ?? [])
    .map((day) => ({
      day: day.day,
      attractionIds: day.attractionIds.filter((id) => attractionIds.has(id)),
    }))
    .filter((day) => day.attractionIds.length > 0);
  return cleaned.length ? cleaned : backup;
}

function mergeCatalogReply(base: ChatPayload, generated: ChatPayload): ChatPayload {
  const ids = new Set(base.attractions.map((item) => item.id));
  return {
    ...base,
    reply: generated.reply?.en && generated.reply?.my ? generated.reply : base.reply,
    itinerary: keepItinerary(generated.itinerary, ids, base.itinerary),
    demo: false,
  };
}

export async function POST(request: Request) {
  let body: {
    message?: string;
    locale?: Locale;
    trip?: TripSnapshot;
    retry?: boolean;
    originSlug?: string | null;
    destinationSlug?: string | null;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const message = body.message?.trim() || "";
  const locale: Locale = body.locale === "en" ? "en" : "my";
  const originSlug = body.originSlug || body.trip?.originSlug || null;
  const destinationSlug = body.destinationSlug || body.trip?.destinationSlug || null;
  const fallback = payloadForMessage(message || "yangon bagan", originSlug, destinationSlug);
  const usingCatalog = !fallback.demo;

  if (!message) {
    const payload = usingCatalog ? await attachListingPhotos(fallback) : { ...fallback, demo: true };
    return NextResponse.json(payload);
  }

  const key = makeCacheKey(
    locale,
    message,
    tripHash({ originSlug, destinationSlug, trip: body.trip }),
  );
  if (!body.retry) {
    const cached = cacheGet<ChatPayload>(key);
    if (cached && isUsablePayload(cached)) {
      return NextResponse.json(cached);
    }
  }

  if (!hasGeminiKey()) {
    const payload = usingCatalog
      ? await attachListingPhotos(fallback)
      : { ...fallback, demo: true, errorKind: "no_key" as const };
    return NextResponse.json(payload);
  }

  const originName = destinations.find((item) => item.slug === originSlug)?.name.en;
  const destinationName = destinations.find((item) => item.slug === destinationSlug)?.name.en;

  try {
    const generated = await generateChatPayload({
      message,
      locale,
      trip: body.trip,
      originName,
      destinationName,
      catalog: usingCatalog ? fallback : null,
    });
    const payload = usingCatalog
      ? await attachListingPhotos(mergeCatalogReply(fallback, generated))
      : generated;
    if (!isUsablePayload(payload)) {
      return NextResponse.json({ ...fallback, demo: true, errorKind: "unavailable" });
    }
    cacheSet(key, payload);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Gemini chat failed:", err instanceof Error ? err.message : err);
    if (usingCatalog) {
      const payload = await attachListingPhotos(fallback);
      cacheSet(key, payload);
      return NextResponse.json(payload);
    }
    return NextResponse.json({
      ...fallback,
      demo: true,
      errorKind: classifyGeminiError(err),
    });
  }
}

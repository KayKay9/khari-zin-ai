import { NextResponse } from "next/server";
import { destinations } from "@/data/destinations";
import { cacheGet, cacheSet, makeCacheKey, tripHash } from "@/lib/chat-cache";
import { demoPayloadForMessage, isUsablePayload } from "@/lib/fallback";
import { classifyGeminiError, generateChatPayload, hasGeminiKey } from "@/lib/gemini";
import type { ChatPayload, Locale, TripSnapshot } from "@/lib/types";

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
  const fallback = demoPayloadForMessage(message || "yangon bagan", originSlug, destinationSlug);

  if (!message) {
    return NextResponse.json({ ...fallback, demo: true });
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
    return NextResponse.json({ ...fallback, demo: true, errorKind: "no_key" });
  }

  const originName = destinations.find((item) => item.slug === originSlug)?.name.en;
  const destinationName = destinations.find((item) => item.slug === destinationSlug)?.name.en;

  try {
    const payload = await generateChatPayload({
      message,
      locale,
      trip: body.trip,
      originName,
      destinationName,
    });
    if (!isUsablePayload(payload)) {
      return NextResponse.json({ ...fallback, demo: true, errorKind: "unavailable" });
    }
    cacheSet(key, payload);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Gemini chat failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({
      ...fallback,
      demo: true,
      errorKind: classifyGeminiError(err),
    });
  }
}

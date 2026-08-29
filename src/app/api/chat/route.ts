import { NextResponse } from "next/server";
import { cacheGet, cacheSet, makeCacheKey, tripHash } from "@/lib/chat-cache";
import { demoPayloadForMessage, isUsablePayload } from "@/lib/fallback";
import { generateChatPayload, hasGeminiKey } from "@/lib/gemini";
import type { ChatPayload, Locale, TripSnapshot } from "@/lib/types";

export async function POST(request: Request) {
  let body: { message?: string; locale?: Locale; trip?: TripSnapshot; retry?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const message = body.message?.trim() || "";
  const locale: Locale = body.locale === "en" ? "en" : "my";
  const fallback = demoPayloadForMessage(message || "yangon bagan");

  if (!message) {
    return NextResponse.json({ ...fallback, demo: true });
  }

  const key = makeCacheKey(locale, message, tripHash(body.trip));
  if (!body.retry) {
    const cached = cacheGet<ChatPayload>(key);
    if (cached && isUsablePayload(cached)) {
      return NextResponse.json(cached);
    }
  }

  if (!hasGeminiKey()) {
    return NextResponse.json({ ...fallback, demo: true });
  }

  try {
    const payload = await generateChatPayload({
      message,
      locale,
      trip: body.trip,
    });
    if (!isUsablePayload(payload)) {
      return NextResponse.json({ ...fallback, demo: true });
    }
    cacheSet(key, payload);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ ...fallback, demo: true });
  }
}

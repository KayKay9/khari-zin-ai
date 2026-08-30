# Khayi Zin AI (ခရီးစဥ် AI)

A bilingual (မြန်မာ / English) travel planner for trips **inside Myanmar**. Chat for places, hotels, and buses; keep a day-by-day itinerary; see it on a map. Built for locals — no accounts and no payments.

The UI uses a Pagoda dusk palette (maroon, gold, sand) with Noto Sans Myanmar and Geist.

## What it does

- **Chat** — Ask in Myanmar or English (for example, Yangon → Bagan by bus). Suggestions come from Gemini when a key is available.
- **Itinerary** — Add attractions, hotels, and buses. Attractions group into a day timeline with estimated clock times (09:00 start, duration plus a 30-minute transfer).
- **Map** — Leaflet map with numbered pins, hotel markers, a route line, and an info window (photo + duration or typical price). **Show on map** flies to that pin. **Google Maps** opens a name search or transit directions in a new tab.
- **Hotels** — Typical MMK range and `tel:` call when a number is listed. Nothing is booked in-app.
- **Language** — Toggle မြန်မာ / EN. Trip data stays in the browser (`localStorage`).

Supported demo cities: Yangon, Mandalay, Bagan, Inle Lake, Hpa-An.

## Stack

- Next.js 16.3, React 19, Tailwind CSS 4
- `@google/genai` for structured chat JSON
- Leaflet + react-leaflet for the map
- Unsplash (and Wikimedia when photos resolve) for listing images

## Setup

```bash
npm install
cp .env.example .env.local
```

In `.env.local`:

```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
```

`GEMINI_API_KEY` is optional. Without it, or if Gemini is blocked for your region / model, chat falls back to sample listings and shows a demo notice.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
npm run lint
```

## How chat works

`POST /api/chat` sends the message, locale, and current trip snapshot. Gemini returns bilingual copy plus attractions, hotels, buses, and an optional day itinerary. Photos are attached from Wikipedia thumbnails when possible, otherwise placeholders.

If the response is unusable, the API returns demo data from `src/data/demo.ts` (`errorKind`: `no_key`, `location`, `model`, or `unavailable`). Successful replies are cached in memory for repeat questions.

## Project layout

| Path | Role |
|------|------|
| `src/app/page.tsx` | Map workspace shell |
| `src/app/api/chat/route.ts` | Chat API |
| `src/components/workspace.tsx` | Chat + itinerary + map layout |
| `src/components/itinerary-panel.tsx` | Day timeline and trip items |
| `src/components/trip-map.tsx` | Leaflet map and pin popups |
| `src/context/` | Locale, trip, and chat state |
| `src/data/` | Destinations, demo catalog, image URLs |
| `src/i18n/` | English and Myanmar strings |

Trip state is stored as `myanmar-trip-v2` in `localStorage`.

## Out of scope

Live booking, payments, user accounts, and Google Maps as the base map (external links only).

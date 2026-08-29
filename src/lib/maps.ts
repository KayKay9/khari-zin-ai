function hasCoords(lat?: number, lng?: number) {
  return lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
}

export function googleMapsPlaceUrl(opts: { query: string; lat?: number; lng?: number }) {
  if (hasCoords(opts.lat, opts.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.lat},${opts.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opts.query)}`;
}

export function googleMapsDirectionsUrl(origin: string, destination: string) {
  const params = new URLSearchParams({
    origin,
    destination,
    travelmode: "transit",
  });
  return `https://www.google.com/maps/dir/?api=1&${params.toString()}`;
}

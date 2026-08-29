export function googleMapsPlaceUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function googleMapsDirectionsUrl(origin: string, destination: string) {
  const params = new URLSearchParams({
    origin,
    destination,
    travelmode: "transit",
  });
  return `https://www.google.com/maps/dir/?api=1&${params.toString()}`;
}

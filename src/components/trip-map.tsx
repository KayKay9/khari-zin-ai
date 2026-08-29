"use client";

import { useEffect, useRef, type ReactNode } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, ZoomControl } from "react-leaflet";
import { MapPlacePopup } from "@/components/map-popup-card";
import { destinations } from "@/data/destinations";
import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";
import { bi } from "@/i18n";
import "leaflet/dist/leaflet.css";

const MYANMAR: [number, number] = [19.75, 96.1];

function formatMmk(value: number) {
  return value.toLocaleString();
}

function pinIcon(label: string, gold = false) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -24],
    html: `<div style="width:28px;height:28px;border-radius:999px;background:${gold ? "#C9A227" : "#7A1F2B"};color:${gold ? "#1C1410" : "#FFFBF4"};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #FFFBF4;box-shadow:0 2px 6px rgba(28,20,16,.35)">${label}</div>`,
  });
}

function popupPan() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return {
    autoPanPaddingTopLeft: L.point(24, 88),
    autoPanPaddingBottomRight: mobile ? L.point(24, 280) : L.point(400, 24),
  };
}

function FocusableMarker({
  id,
  position,
  icon,
  children,
}: {
  id: string;
  position: [number, number];
  icon: L.DivIcon;
  children: ReactNode;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const { focusId } = useTrip();

  useEffect(() => {
    if (focusId !== id) return;
    const marker = markerRef.current;
    if (!marker) return;
    const timer = window.setTimeout(() => marker.openPopup(), 80);
    return () => window.clearTimeout(timer);
  }, [focusId, id]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      {children}
    </Marker>
  );
}

function FitBounds() {
  const map = useMap();
  const { attractions, hotels, focusId, originSlug } = useTrip();
  const origin = destinations.find((item) => item.slug === originSlug);

  useEffect(() => {
    const points: [number, number][] = [
      ...(origin ? [[origin.lat, origin.lng] as [number, number]] : []),
      ...attractions.map((item) => [item.lat, item.lng] as [number, number]),
      ...hotels
        .filter((item) => item.lat != null && item.lng != null)
        .map((item) => [item.lat as number, item.lng as number] as [number, number]),
    ];
    if (points.length === 0) {
      map.setView(MYANMAR, 6);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(points, { padding: [80, 80], maxZoom: 12 });
  }, [attractions, hotels, origin, map]);

  useEffect(() => {
    if (!focusId) return;
    const attraction = attractions.find((item) => item.id === focusId);
    const hotel = hotels.find((item) => item.id === focusId);
    const lat = attraction?.lat ?? hotel?.lat;
    const lng = attraction?.lng ?? hotel?.lng;
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 13, { duration: 0.6 });
    }
  }, [focusId, attractions, hotels, map]);

  return null;
}

export default function TripMap() {
  const { locale, t } = useLocale();
  const { attractions, hotels, originSlug } = useTrip();
  const origin = destinations.find((item) => item.slug === originSlug);
  const line = [
    ...(origin ? [[origin.lat, origin.lng] as [number, number]] : []),
    ...attractions.map((item) => [item.lat, item.lng] as [number, number]),
  ];
  const pan = popupPan();

  return (
    <MapContainer
      center={MYANMAR}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
      attributionControl
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds />
      {line.length > 1 ? (
        <Polyline positions={line} pathOptions={{ color: "#7A1F2B", weight: 3, opacity: 0.85 }} />
      ) : null}
      {origin ? (
        <Marker position={[origin.lat, origin.lng]} icon={pinIcon("စ", true)}>
          <Popup className="trip-popup" minWidth={240} maxWidth={260} {...pan}>
            <MapPlacePopup title={bi(locale, origin.name)} imageUrl={origin.image} kind="attraction" />
          </Popup>
        </Marker>
      ) : null}
      {attractions.map((item, index) => (
        <FocusableMarker
          key={item.id}
          id={item.id}
          position={[item.lat, item.lng]}
          icon={pinIcon(String(index + 1))}
        >
          <Popup className="trip-popup" minWidth={240} maxWidth={260} {...pan}>
            <MapPlacePopup
              title={bi(locale, item.name)}
              subtitle={item.city}
              imageUrl={item.imageUrl}
              kind="attraction"
              priceLabel={`${t("duration")} ${item.durationHours} ${t("hours")}`}
            />
          </Popup>
        </FocusableMarker>
      ))}
      {hotels.map((item) =>
        item.lat != null && item.lng != null ? (
          <FocusableMarker
            key={item.id}
            id={item.id}
            position={[item.lat, item.lng]}
            icon={pinIcon("ဟ", true)}
          >
            <Popup className="trip-popup" minWidth={240} maxWidth={260} {...pan}>
              <MapPlacePopup
                title={bi(locale, item.name)}
                subtitle={bi(locale, item.area)}
                imageUrl={item.imageUrl}
                kind="hotel"
                priceLabel={`${t("typicalPrice")} ${formatMmk(item.priceMmkMin)}–${formatMmk(item.priceMmkMax)} ${t("mmk")}`}
              />
            </Popup>
          </FocusableMarker>
        ) : null,
      )}
    </MapContainer>
  );
}

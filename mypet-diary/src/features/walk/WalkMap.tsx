import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Coords } from '@/hooks/useGeolocation';
import { PLACE_META, type Place, type PlaceCategory } from './usePlaces';

function emojiIcon(emoji: string, ring: string) {
  return L.divIcon({
    className: 'mypet-marker',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#fff;box-shadow:0 2px 8px rgba(0,27,55,0.18);border:2px solid ${ring};font-size:18px;">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const meIcon = L.divIcon({
  className: 'mypet-marker-me',
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#3182F6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(49,130,246,0.20);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const RING: Record<PlaceCategory, string> = {
  vet: '#F04452',
  cafe: '#FF9F1C',
  park: '#00C896',
};

function Recenter({ center }: { center: Coords | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center?.lat, center?.lng]);
  return null;
}

interface Props {
  center: Coords | null;
  route: Coords[];
  places: Place[];
}

export function WalkMap({ center, route, places }: Props) {
  const fallback: [number, number] = [37.5663, 126.9779]; // 서울시청
  const start: [number, number] = center ? [center.lat, center.lng] : fallback;

  const line = useMemo(
    () => route.map((p) => [p.lat, p.lng] as [number, number]),
    [route],
  );

  return (
    <MapContainer
      center={start}
      zoom={16}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: '#E5E8EB' }}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      <Recenter center={center} />
      {center && <Marker position={[center.lat, center.lng]} icon={meIcon} />}
      {line.length > 1 && (
        <Polyline positions={line} pathOptions={{ color: '#3182F6', weight: 5, opacity: 0.9 }} />
      )}
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={emojiIcon(PLACE_META[p.category].emoji, RING[p.category])}
        />
      ))}
    </MapContainer>
  );
}

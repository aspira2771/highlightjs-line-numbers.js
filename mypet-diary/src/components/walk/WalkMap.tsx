import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoPoint } from '@/types';

// Default view when there are no points yet (Seoul City Hall).
const DEFAULT_CENTER: [number, number] = [37.5665, 126.978];

interface Props {
  path: GeoPoint[];
  /** Keep the map centered on the latest point (live tracking). */
  follow?: boolean;
  className?: string;
}

function toLatLng(p: GeoPoint): [number, number] {
  return [p.lat, p.lng];
}

/** Keeps the Leaflet view in sync with the path as it grows. */
function ViewController({ path, follow }: { path: GeoPoint[]; follow?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (path.length === 0) return;
    if (follow) {
      const last = path[path.length - 1];
      map.setView(toLatLng(last), Math.max(map.getZoom(), 16), {
        animate: true,
      });
    } else if (path.length === 1) {
      map.setView(toLatLng(path[0]), 16);
    } else {
      map.fitBounds(L.latLngBounds(path.map(toLatLng)), {
        padding: [24, 24],
      });
    }
  }, [path, follow, map]);
  return null;
}

export function WalkMap({ path, follow, className }: Props) {
  const center = path.length > 0 ? toLatLng(path[path.length - 1]) : DEFAULT_CENTER;
  const current = path.length > 0 ? path[path.length - 1] : null;

  return (
    // `isolate` contains Leaflet's high internal z-indexes so they don't render
    // above modals/overlays elsewhere on the page.
    <div
      className={`isolate ${className ?? 'h-64 w-full overflow-hidden rounded-soft'}`}
    >
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {path.length > 1 && (
          <Polyline
            positions={path.map(toLatLng)}
            pathOptions={{ color: '#FFB088', weight: 5, opacity: 0.9 }}
          />
        )}
        {current && (
          <CircleMarker
            center={toLatLng(current)}
            radius={8}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: '#FFB088',
              fillOpacity: 1,
            }}
          />
        )}
        <ViewController path={path} follow={follow} />
      </MapContainer>
    </div>
  );
}

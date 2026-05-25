import { useCallback, useEffect, useState } from 'react';
import type { Coords } from '@/hooks/useGeolocation';

export type PlaceCategory = 'vet' | 'cafe' | 'park';

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
}

export const PLACE_META: Record<
  PlaceCategory,
  { label: string; emoji: string; tint: string }
> = {
  vet: { label: '동물병원', emoji: '🏥', tint: 'bg-[#FFE6E9]' },
  cafe: { label: '카페', emoji: '☕', tint: 'bg-[#FFF1E0]' },
  park: { label: '공원', emoji: '🌳', tint: 'bg-[#E7F6EC]' },
};

const OVERPASS = 'https://overpass-api.de/api/interpreter';

function buildQuery(c: Coords, radiusM = 1500): string {
  const r = radiusM;
  const { lat, lng } = c;
  return `[out:json][timeout:20];
(
  node["amenity"="veterinary"](around:${r},${lat},${lng});
  node["amenity"="cafe"](around:${r},${lat},${lng});
  node["leisure"="park"](around:${r},${lat},${lng});
  way["leisure"="park"](around:${r},${lat},${lng});
);
out center 40;`;
}

function categorize(tags: Record<string, string> = {}): PlaceCategory | null {
  if (tags.amenity === 'veterinary') return 'vet';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.leisure === 'park') return 'park';
  return null;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function usePlaces(center: Coords | null) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async (c: Coords) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(OVERPASS, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(buildQuery(c)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error('overpass ' + res.status);
      const json = (await res.json()) as { elements: OverpassElement[] };
      const seen = new Set<string>();
      const result: Place[] = [];
      for (const el of json.elements) {
        const cat = categorize(el.tags);
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        const name = el.tags?.name;
        if (!cat || lat == null || lng == null || !name) continue;
        const key = `${el.type}/${el.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ id: key, name, lat, lng, category: cat });
      }
      setPlaces(result);
    } catch (e) {
      setError((e as Error).message);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (center) fetchPlaces(center);
  }, [center?.lat, center?.lng, fetchPlaces]);

  return { places, loading, error, refetch: fetchPlaces };
}

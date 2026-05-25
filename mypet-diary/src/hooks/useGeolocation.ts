import { Geolocation, type Position } from '@capacitor/geolocation';

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
}

function toCoords(p: Position): Coords {
  return {
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    accuracy: p.coords.accuracy,
  };
}

/** Thin wrapper over @capacitor/geolocation (works on web + native). */
export const geo = {
  async requestPermission(): Promise<boolean> {
    try {
      const status = await Geolocation.requestPermissions();
      return status.location === 'granted' || status.coarseLocation === 'granted';
    } catch {
      // Web fallback: permission is requested implicitly on first getCurrentPosition
      return true;
    }
  },

  async getCurrent(): Promise<Coords> {
    const p = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return toCoords(p);
  },

  async watch(cb: (c: Coords) => void): Promise<string> {
    return Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      (pos, err) => {
        if (err || !pos) return;
        cb(toCoords(pos));
      },
    );
  },

  async clear(id: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id });
    } catch {
      /* noop */
    }
  },
};

/** Haversine distance in kilometers between two coordinates. */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

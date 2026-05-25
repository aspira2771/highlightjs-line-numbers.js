import { useCallback, useEffect, useRef, useState } from 'react';
import { geo, haversineKm, type Coords } from './useGeolocation';

export interface WalkSummary {
  startedAt: string;
  durationSec: number;
  distanceKm: number;
  route: Coords[];
}

interface TrackerState {
  tracking: boolean;
  startedAt: number | null;
  elapsedSec: number;
  distanceKm: number;
  points: Coords[];
}

const MIN_MOVE_KM = 0.003; // ignore <3m GPS jitter

export function useWalkTracker() {
  const [state, setState] = useState<TrackerState>({
    tracking: false,
    startedAt: null,
    elapsedSec: 0,
    distanceKm: 0,
    points: [],
  });

  const watchId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPoint = useRef<Coords | null>(null);

  const cleanup = useCallback(() => {
    if (watchId.current) {
      geo.clear(watchId.current);
      watchId.current = null;
    }
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    await geo.requestPermission();
    lastPoint.current = null;
    const startedAt = Date.now();
    setState({
      tracking: true,
      startedAt,
      elapsedSec: 0,
      distanceKm: 0,
      points: [],
    });

    timer.current = setInterval(() => {
      setState((s) =>
        s.tracking
          ? { ...s, elapsedSec: Math.round((Date.now() - (s.startedAt ?? Date.now())) / 1000) }
          : s,
      );
    }, 1000);

    watchId.current = await geo.watch((c) => {
      setState((s) => {
        const prev = lastPoint.current;
        let added = 0;
        if (prev) {
          const d = haversineKm(prev, c);
          if (d >= MIN_MOVE_KM) added = d;
          else return s; // jitter — skip
        }
        lastPoint.current = c;
        return {
          ...s,
          distanceKm: s.distanceKm + added,
          points: [...s.points, c],
        };
      });
    });
  }, []);

  const stop = useCallback((): WalkSummary | null => {
    cleanup();
    let summary: WalkSummary | null = null;
    setState((s) => {
      summary = {
        startedAt: new Date(s.startedAt ?? Date.now()).toISOString(),
        durationSec: s.elapsedSec,
        distanceKm: s.distanceKm,
        route: s.points,
      };
      return { tracking: false, startedAt: null, elapsedSec: 0, distanceKm: 0, points: [] };
    });
    return summary;
  }, [cleanup]);

  return { ...state, start, stop };
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoPoint } from '@/types';
import { haversineMeters, pathDistanceMeters } from '@/utils/geo';

export type TrackerStatus = 'idle' | 'tracking' | 'error';

export interface WalkTracker {
  status: TrackerStatus;
  path: GeoPoint[];
  current: GeoPoint | null;
  distanceMeters: number;
  elapsedSeconds: number;
  error: string | null;
  start: () => void;
  stop: () => GeoPoint[];
  reset: () => void;
}

// Drop samples this inaccurate (meters) once tracking has started — they smear the line.
const ACCURACY_LIMIT_M = 50;
// Ignore micro-jitter while standing still (meters).
const MIN_STEP_M = 2;

/**
 * Tracks a live walk via the Geolocation API. Accumulates a GPS path,
 * derives total distance, and ticks an elapsed timer once per second.
 * Works in both the browser and the Capacitor webview.
 */
export function useWalkTracker(): WalkTracker {
  const [status, setStatus] = useState<TrackerStatus>('idle');
  const [path, setPath] = useState<GeoPoint[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Mirror of `path` so stop() can return the latest value synchronously.
  const pathRef = useRef<GeoPoint[]>([]);
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  const clearWatchers = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up if the component unmounts mid-walk.
  useEffect(() => clearWatchers, [clearWatchers]);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('이 기기에서는 위치 기능을 쓸 수 없어요.');
      setStatus('error');
      return;
    }
    setPath([]);
    setElapsedSeconds(0);
    setError(null);
    setStatus('tracking');
    startedAtRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const point: GeoPoint = { lat: latitude, lng: longitude, t: pos.timestamp };
        setPath((prev) => {
          const last = prev[prev.length - 1];
          if (last) {
            if (accuracy != null && accuracy > ACCURACY_LIMIT_M) return prev;
            if (haversineMeters(last, point) < MIN_STEP_M) return prev;
          }
          return [...prev, point];
        });
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? '위치 권한이 거부됐어요. 설정에서 허용해주세요.'
            : '위치를 가져오지 못했어요. 잠시 후 다시 시도해주세요.',
        );
        setStatus('error');
        clearWatchers();
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
  }, [clearWatchers]);

  const stop = useCallback(() => {
    clearWatchers();
    startedAtRef.current = null;
    setStatus('idle');
    return pathRef.current;
  }, [clearWatchers]);

  const reset = useCallback(() => {
    clearWatchers();
    startedAtRef.current = null;
    setStatus('idle');
    setPath([]);
    setElapsedSeconds(0);
    setError(null);
  }, [clearWatchers]);

  return {
    status,
    path,
    current: path.length > 0 ? path[path.length - 1] : null,
    distanceMeters: pathDistanceMeters(path),
    elapsedSeconds,
    error,
    start,
    stop,
    reset,
  };
}

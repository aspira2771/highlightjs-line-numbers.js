import { useEffect, useMemo, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { WalkMap } from '@/features/walk/WalkMap';
import { RegisterPetSheet } from '@/features/walk/RegisterPetSheet';
import { SaveWalkModal } from '@/features/walk/SaveWalkModal';
import { usePlaces, PLACE_META, type PlaceCategory } from '@/features/walk/usePlaces';
import { useWalkTracker, formatDuration, type WalkSummary } from '@/hooks/useWalkTracker';
import { geo, type Coords } from '@/hooks/useGeolocation';
import { usePetStore } from '@/stores/petStore';
import { cn } from '@/utils/cn';

type Filter = 'all' | PlaceCategory;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'vet', label: '동물병원' },
  { id: 'cafe', label: '카페' },
  { id: 'park', label: '공원' },
];

export function WalkPage() {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );

  const [coords, setCoords] = useState<Coords | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [summary, setSummary] = useState<WalkSummary | null>(null);

  const tracker = useWalkTracker();
  const { places } = usePlaces(coords);

  useEffect(() => {
    if (!activePet) setSheetOpen(true);
  }, [activePet]);

  useEffect(() => {
    let alive = true;
    geo
      .getCurrent()
      .then((c) => alive && setCoords(c))
      .catch(() => {
        /* keep fallback (서울시청) in WalkMap */
      });
    return () => {
      alive = false;
    };
  }, []);

  const liveCenter =
    tracker.tracking && tracker.points.length
      ? tracker.points[tracker.points.length - 1]
      : coords;

  const filtered = useMemo(
    () => (filter === 'all' ? places : places.filter((p) => p.category === filter)),
    [places, filter],
  );

  const handleStart = async () => {
    if (!activePet) {
      setSheetOpen(true);
      return;
    }
    await tracker.start();
  };

  const handleStop = () => {
    const s = tracker.stop();
    if (s) setSummary(s);
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* Map area (grows); its bottom slides under the sheet) */}
      <div className="relative flex-1">
        <div className="absolute inset-0">
          <WalkMap center={liveCenter} route={tracker.points} places={filtered} />
        </div>

        {/* Category filter chips */}
        <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'shrink-0 rounded-pill px-4 py-2 text-[14px] font-bold shadow-card transition active:scale-95',
                  filter === f.id ? 'bg-gray-900 text-white' : 'bg-surface text-gray-700',
                )}
              >
                {f.id !== 'all' && (
                  <span className="mr-1">{PLACE_META[f.id as PlaceCategory].emoji}</span>
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live tracking pill */}
        {tracker.tracking && (
          <div className="absolute right-4 top-20 z-20">
            <div className="rounded-2xl bg-primary px-4 py-2 text-center text-white shadow-float">
              <p className="text-[11px] font-medium opacity-90">🐾 산책 중</p>
              <p className="text-[20px] font-bold tabular-nums">
                {formatDuration(tracker.elapsedSec)}
              </p>
              <p className="text-[12px] font-semibold opacity-90">
                {tracker.distanceKm.toFixed(2)}km
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom sheet floating over the map, above the fixed tab bar */}
      <div className="relative z-20 -mt-5 mb-[62px] rounded-t-3xl bg-surface px-5 pb-3 pt-4 shadow-float">
        <p className="mb-3 text-[15px] font-bold text-ink">
          {activePet ? `${activePet.name}님을 위한 추천 장소예요` : '주변 추천 장소예요'}
        </p>
        {filtered.length === 0 ? (
          <p className="pb-3 text-[13px] text-muted">
            주변 추천 장소를 불러오는 중이거나, 가까운 곳이 없어요.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3">
            {filtered.slice(0, 12).map((p) => (
              <div key={p.id} className="w-28 shrink-0">
                <div
                  className={cn(
                    'flex h-20 items-center justify-center rounded-2xl text-3xl',
                    PLACE_META[p.category].tint,
                  )}
                >
                  {PLACE_META[p.category].emoji}
                </div>
                <p className="mt-1.5 truncate text-[14px] font-bold text-ink">{p.name}</p>
                <p className="text-[12px] text-muted">{PLACE_META[p.category].label}</p>
              </div>
            ))}
          </div>
        )}

        {tracker.tracking ? (
          <button
            onClick={handleStop}
            className="flex w-full items-center justify-center gap-2 rounded-card bg-negative py-4 text-[16px] font-bold text-white transition active:scale-[0.99]"
          >
            <Square size={18} fill="white" /> 산책 종료
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="flex w-full items-center justify-center gap-2 rounded-card bg-primary py-4 text-[16px] font-bold text-white transition active:scale-[0.99]"
          >
            <Play size={18} fill="white" /> 산책 시작
          </button>
        )}
      </div>

      <RegisterPetSheet
        open={sheetOpen && !activePet}
        onClose={() => setSheetOpen(false)}
        onRegistered={() => setSheetOpen(false)}
      />

      <SaveWalkModal
        petId={activePet?.id ?? ''}
        summary={summary}
        onClose={() => setSummary(null)}
        onSaved={() => setSummary(null)}
      />
    </div>
  );
}

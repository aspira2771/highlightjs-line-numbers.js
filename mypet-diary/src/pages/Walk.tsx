import { useEffect, useRef, useState } from 'react';
import { Footprints, PawPrint, Play, Route, Square } from 'lucide-react';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { AddWalkForm } from '@/features/walk/AddWalkForm';
import { WalkMap } from '@/components/walk/WalkMap';
import { useWalkTracker } from '@/hooks/useWalkTracker';
import { usePetStore } from '@/stores/petStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { formatKoreanDate, formatKoreanTime } from '@/utils/date';
import { formatDistance, formatDuration, pathDistanceMeters } from '@/utils/geo';
import type { GeoPoint, WalkRecord } from '@/types';

export function WalkPage() {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const records = useRecordsStore();
  const addWalk = useRecordsStore((s) => s.addWalk);
  const tracker = useWalkTracker();
  const startedAtRef = useRef<string | null>(null);

  const [editing, setEditing] = useState<WalkRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [viewingPath, setViewingPath] = useState<GeoPoint[] | null>(null);
  const [idleCenter, setIdleCenter] = useState<GeoPoint | null>(null);

  // Center the idle map on the current location as soon as the page opens.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setIdleCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          t: pos.timestamp,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  if (!activePet) {
    return (
      <div className="page">
        <PageHeader title="산책" />
        <EmptyState
          icon={<PawPrint size={26} />}
          title="등록된 반려동물이 없어요"
          description="마이펫 탭에서 먼저 등록해주세요."
        />
      </div>
    );
  }

  const petId = activePet.id;
  const walks = records.walks.filter((w) => w.petId === petId);
  const totalKm =
    walks.reduce((sum, w) => sum + (w.distanceMeters ?? 0), 0) / 1000;

  const isTracking = tracker.status === 'tracking';
  const hasFix = tracker.path.length > 0;

  const begin = () => {
    startedAtRef.current = new Date().toISOString();
    tracker.start();
  };

  const finish = () => {
    const path = tracker.stop();
    addWalk({
      petId,
      startedAt: startedAtRef.current ?? new Date().toISOString(),
      durationMinutes: Math.max(0, Math.round(tracker.elapsedSeconds / 60)),
      path: path.length > 0 ? path : undefined,
      distanceMeters: path.length > 1 ? pathDistanceMeters(path) : undefined,
    });
    tracker.reset();
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="page">
      <PageHeader title="산책" subtitle={`${activePet.name}와의 산책`} />
      <PetSwitcher />

      {/* Live map — current location shown immediately, route while tracking */}
      <div className="relative">
        <WalkMap
          path={isTracking ? tracker.path : idleCenter ? [idleCenter] : []}
          follow={isTracking}
          className="h-72 w-full overflow-hidden rounded-card"
        />
        {isTracking && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-pill bg-black/65 px-3 py-1.5 text-xs font-bold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            기록 중 · {formatDuration(tracker.elapsedSeconds)} ·{' '}
            {formatDistance(tracker.distanceMeters)}
          </div>
        )}
        {isTracking && !hasFix && (
          <div className="absolute inset-0 flex items-center justify-center rounded-card bg-black/30 text-sm font-semibold text-white">
            위치를 찾는 중이에요…
          </div>
        )}
      </div>

      {tracker.error && (
        <p className="mt-3 rounded-soft border border-red-200 bg-red-50 p-3 text-sm text-red-500">
          {tracker.error}
        </p>
      )}

      {/* Idle stats summary */}
      {!isTracking && (
        <Card className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">총 산책</p>
            <p className="text-lg font-bold">{walks.length}회</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">누적 거리</p>
            <p className="text-lg font-bold">{totalKm.toFixed(2)}km</p>
          </div>
        </Card>
      )}

      {/* History */}
      <p className="section-title mt-5">산책 기록</p>
      <ul className="space-y-2">
        {walks.length === 0 && (
          <EmptyState
            icon={<Footprints size={26} />}
            title="산책 기록이 없어요"
            description="아래 시작 버튼을 눌러 첫 산책을 기록해보세요."
          />
        )}
        {walks
          .slice()
          .reverse()
          .map((w) => (
            <li key={w.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {w.durationMinutes}분
                    {typeof w.distanceMeters === 'number' &&
                      ` · ${formatDistance(w.distanceMeters)}`}
                  </p>
                  <p className="text-xs text-muted">
                    {formatKoreanDate(w.startedAt)} ·{' '}
                    {formatKoreanTime(w.startedAt)}
                    {w.weather && ` · ${w.weather}`}
                    {w.hadBowelMovement && ' · 배변 있음'}
                  </p>
                  {w.note && <p className="mt-1 text-sm">{w.note}</p>}
                  {w.path && w.path.length > 1 && (
                    <button
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-500"
                      onClick={() => setViewingPath(w.path ?? null)}
                    >
                      <Route size={14} />
                      지도 보기
                    </button>
                  )}
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button
                    className="text-muted"
                    onClick={() => {
                      setEditing(w);
                      setOpen(true);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => records.removeWalk(w.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
      </ul>

      {/* Recording controls — stay on screen like a recorder */}
      {!isTracking ? (
        <button
          onClick={begin}
          className="fixed bottom-24 right-4 z-20 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-red-500 text-white shadow-float transition hover:scale-105"
          aria-label="산책 시작"
        >
          <Play size={20} fill="white" />
          <span className="text-[10px] font-bold">시작</span>
        </button>
      ) : (
        <div className="fixed inset-x-0 bottom-20 z-20 flex justify-center px-4">
          <button
            onClick={finish}
            className="pointer-events-auto flex w-full max-w-md items-center justify-center gap-2 rounded-pill bg-ink py-4 text-base font-bold text-white shadow-float transition active:scale-[0.99]"
          >
            <Square size={18} fill="white" />
            산책 종료
          </button>
        </div>
      )}

      {/* Manual add / edit */}
      <Modal
        open={open}
        onClose={closeModal}
        title={`산책 기록 ${editing ? '수정' : '추가'}`}
      >
        <AddWalkForm
          key={editing?.id ?? 'new'}
          petId={petId}
          editing={editing}
          onClose={closeModal}
        />
      </Modal>

      <Modal
        open={viewingPath !== null}
        onClose={() => setViewingPath(null)}
        title="산책 경로"
      >
        {viewingPath && <WalkMap path={viewingPath} />}
      </Modal>
    </div>
  );
}

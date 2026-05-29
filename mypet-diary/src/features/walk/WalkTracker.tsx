import { useRef, useState } from 'react';
import { MapPin, Play, Square } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { WalkMap } from '@/components/walk/WalkMap';
import { useWalkTracker } from '@/hooks/useWalkTracker';
import { useRecordsStore } from '@/stores/recordsStore';
import { formatDistance, formatDuration, pathDistanceMeters } from '@/utils/geo';

interface Props {
  petId: string;
  onClose?: () => void;
}

/**
 * Live GPS walk tracking. Start → the map follows the route as it's drawn →
 * 종료 saves a WalkRecord with the captured path. Notes/weather can be added
 * afterward via the record's 수정 button.
 */
export function WalkTracker({ petId, onClose }: Props) {
  const tracker = useWalkTracker();
  const addWalk = useRecordsStore((s) => s.addWalk);
  const startedAtRef = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);

  const begin = () => {
    startedAtRef.current = new Date().toISOString();
    tracker.start();
  };

  const finish = () => {
    setSaving(true);
    const path = tracker.stop();
    addWalk({
      petId,
      startedAt: startedAtRef.current ?? new Date().toISOString(),
      durationMinutes: Math.max(0, Math.round(tracker.elapsedSeconds / 60)),
      path: path.length > 0 ? path : undefined,
      distanceMeters: path.length > 1 ? pathDistanceMeters(path) : undefined,
    });
    onClose?.();
  };

  const isTracking = tracker.status === 'tracking';
  const hasFix = tracker.path.length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <WalkMap path={tracker.path} follow={isTracking} />
        {isTracking && !hasFix && (
          <div className="absolute inset-0 flex items-center justify-center rounded-soft bg-black/30 text-sm text-white">
            위치를 찾는 중이에요…
          </div>
        )}
      </div>

      {tracker.error && (
        <p className="rounded-soft border border-red-200 bg-red-50 p-3 text-sm text-red-500">
          {tracker.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-xs text-muted">거리</p>
          <p className="text-xl font-bold">
            {formatDistance(tracker.distanceMeters)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-muted">시간</p>
          <p className="text-xl font-bold">
            {formatDuration(tracker.elapsedSeconds)}
          </p>
        </div>
      </div>

      {!isTracking ? (
        <Button block leftIcon={<Play size={18} />} onClick={begin}>
          산책 시작
        </Button>
      ) : (
        <Button
          block
          variant="primary"
          leftIcon={<Square size={18} />}
          onClick={finish}
          disabled={saving}
        >
          산책 종료하고 저장
        </Button>
      )}

      {!isTracking && (
        <p className="flex items-center justify-center gap-1 text-center text-xs text-muted">
          <MapPin size={12} />
          위치 권한을 허용하면 경로가 지도에 기록돼요.
        </p>
      )}
    </div>
  );
}

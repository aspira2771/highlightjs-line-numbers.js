import { useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { useRecordsStore } from '@/stores/recordsStore';
import { fileToDataUrl, downscaleImage } from '@/utils/image';
import { formatKoreanDate } from '@/utils/date';
import type { PhotoMemory } from '@/types';

interface Props {
  petId: string;
  /** Selected calendar day — new photos are filed under this date. */
  date: Date;
}

export function PhotoAlbum({ petId, date }: Props) {
  const photos = useRecordsStore((s) => s.photos);
  const addPhoto = useRecordsStore((s) => s.addPhoto);
  const removePhoto = useRecordsStore((s) => s.removePhoto);
  const updatePhoto = useRecordsStore((s) => s.updatePhoto);
  const [viewing, setViewing] = useState<PhotoMemory | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = photos
    .filter((p) => p.petId === petId)
    .slice()
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));

  const onPick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const raw = await fileToDataUrl(file);
      const small = await downscaleImage(raw, 1024, 'image/jpeg', 0.85);
      const taken = new Date(date);
      taken.setHours(12, 0, 0, 0);
      addPhoto({ petId, photoUrl: small, takenAt: taken.toISOString() });
    } catch {
      alert('사진을 추가하지 못했어요. 저장 공간이 가득 찼을 수 있어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      className="mt-4"
      title="사진첩"
      action={
        <label className="cursor-pointer rounded-pill bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-500">
          {busy ? '추가 중…' : '사진 추가'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </label>
      }
    >
      {mine.length === 0 ? (
        <EmptyState
          icon={<Camera size={26} />}
          title="사진이 없어요"
          description="선택한 날짜로 추억 사진을 남겨보세요."
        />
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {mine.map((p) => (
            <button
              key={p.id}
              onClick={() => setViewing(p)}
              className="aspect-square overflow-hidden rounded-soft bg-gray-100"
            >
              <img
                src={p.photoUrl}
                alt={p.caption ?? '추억 사진'}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="추억 사진"
      >
        {viewing && (
          <div className="space-y-3">
            <img
              src={viewing.photoUrl}
              alt={viewing.caption ?? ''}
              className="w-full rounded-soft"
            />
            <p className="text-xs text-muted">
              {formatKoreanDate(viewing.takenAt)}
            </p>
            <input
              defaultValue={viewing.caption ?? ''}
              placeholder="한 줄 메모"
              onBlur={(e) =>
                updatePhoto(viewing.id, {
                  caption: e.target.value.trim() || undefined,
                })
              }
              className="w-full rounded-soft border border-line bg-surface px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                removePhoto(viewing.id);
                setViewing(null);
              }}
              className="flex items-center gap-1 text-sm text-red-500"
            >
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        )}
      </Modal>
    </Card>
  );
}

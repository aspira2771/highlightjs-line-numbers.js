import { useState, type FormEvent } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input, Select, Textarea } from '@/components/common/Input';
import {
  CHARACTER_TEMPLATES,
  Character,
} from '@/components/character/Character';
import { SPECIES_LABELS } from '@/utils/careLabels';
import { cutoutImage } from '@/utils/background';
import type {
  CharacterTemplate,
  Pet,
  PetSpecies,
} from '@/types';

interface Props {
  initial?: Partial<Pet>;
  onSubmit: (values: {
    name: string;
    species: PetSpecies;
    breed?: string;
    birthDate?: string;
    weight?: number;
    photoUrl: string;
    characterUrl?: string;
    characterTemplate: CharacterTemplate;
    notes?: string;
  }) => void;
  submitLabel?: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PetForm({ initial, onSubmit, submitLabel = '저장하기' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [species, setSpecies] = useState<PetSpecies>(
    (initial?.species as PetSpecies) ?? 'dog',
  );
  const [breed, setBreed] = useState(initial?.breed ?? '');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [weight, setWeight] = useState(
    initial?.weight ? String(initial.weight) : '',
  );
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [characterUrl, setCharacterUrl] = useState(initial?.characterUrl ?? '');
  const [characterTemplate, setCharacterTemplate] = useState<CharacterTemplate>(
    (initial?.characterTemplate as CharacterTemplate) ?? 'classic',
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cutoutFailed, setCutoutFailed] = useState(false);

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPhotoUrl(dataUrl);
    setCharacterUrl('');
    setCutoutFailed(false);
    setProcessing(true);
    try {
      const cutout = await cutoutImage(dataUrl);
      setCharacterUrl(cutout);
    } catch {
      // Network/model unavailable → keep the original photo as a fallback.
      setCutoutFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  const retryCutout = async () => {
    if (!photoUrl || processing) return;
    setCutoutFailed(false);
    setProcessing(true);
    try {
      setCharacterUrl(await cutoutImage(photoUrl));
    } catch {
      setCutoutFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    onSubmit({
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      birthDate: birthDate || undefined,
      weight: weight ? Number(weight) : undefined,
      photoUrl,
      characterUrl: characterUrl || undefined,
      characterTemplate,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Character
            photoUrl={photoUrl}
            characterUrl={characterUrl}
            species={species}
            template={characterTemplate}
            mood="happy"
            size="md"
            animated={false}
          />
          {processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-ink/45 text-white">
              <Loader2 size={22} className="animate-spin" />
              <span className="mt-1 text-[10px] font-semibold">캐릭터 변환 중</span>
            </div>
          )}
          {characterUrl && !processing && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-soft">
              <Sparkles size={13} />
            </span>
          )}
        </div>

        <label className="cursor-pointer rounded-soft border border-line bg-surface px-4 py-2 text-[12px] font-medium text-ink-soft transition hover:border-primary-200 hover:text-primary">
          {photoUrl ? '사진 변경' : '사진 업로드'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </label>

        {processing && (
          <p className="text-[11px] text-muted">
            사진 속 아이를 캐릭터로 만드는 중이에요…
          </p>
        )}
        {cutoutFailed && !processing && (
          <button
            type="button"
            onClick={retryCutout}
            className="text-[11px] font-semibold text-primary"
          >
            캐릭터 변환에 실패했어요. 다시 시도
          </button>
        )}
      </div>

      <Input
        label="이름"
        name="name"
        value={name}
        placeholder="콩이"
        onChange={(e) => setName(e.target.value)}
        error={error ?? undefined}
      />

      <Select
        label="종"
        name="species"
        value={species}
        onChange={(e) => setSpecies(e.target.value as PetSpecies)}
        options={Object.entries(SPECIES_LABELS).map(([value, label]) => ({
          value,
          label,
        }))}
      />

      <Input
        label="품종"
        name="breed"
        placeholder="시바견, 코숏 등"
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="생일"
          name="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        <Input
          label="체중 (kg)"
          name="weight"
          type="number"
          step="0.1"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      <div>
        <span className="mb-2 block text-[12px] font-medium uppercase tracking-wide text-muted">
          캐릭터 스타일
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CHARACTER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCharacterTemplate(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-soft border px-3 py-2 text-[11px] transition ${
                characterTemplate === t.id
                  ? 'border-primary bg-primary-50 text-primary-500'
                  : 'border-line bg-surface text-muted hover:border-primary-200'
              }`}
            >
              <Character
                photoUrl={photoUrl}
                characterUrl={characterUrl}
                species={species}
                template={t.id}
                size="sm"
                animated={false}
              />
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="특이사항"
        name="notes"
        placeholder="알레르기·질병·먹으면 안 되는 음식"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button type="submit" block size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}

import type { PetSpecies } from '@/types';

/**
 * Ask the backend proxy to turn a pet photo into a 2D cartoon character.
 * The OpenAI key lives only on the server — see vite.character-proxy.ts.
 *
 * @param image  data URL of the source photo
 * @param species used to tune the prompt
 * @returns data URL of the generated character image
 */
export async function generateCharacter(
  image: string,
  species: PetSpecies,
): Promise<string> {
  const res = await fetch('/api/generate-character', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, species }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    image?: string;
    error?: string;
  };

  if (!res.ok || !data.image) {
    throw new Error(data.error ?? 'AI 캐릭터 생성에 실패했어요.');
  }
  return data.image;
}

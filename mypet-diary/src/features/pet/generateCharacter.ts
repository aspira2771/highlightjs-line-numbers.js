import type { PetSpecies } from '@/types';

/**
 * Re-encode an image data URL to a clean PNG capped at `max` px on the long
 * edge. Normalizes phone formats (incl. HEIC the browser can decode) and
 * shrinks large photos so the image API accepts them. Falls back to the
 * original on decode failure.
 */
function normalizeImage(dataUrl: string, max = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

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
  const normalized = await normalizeImage(image);
  const res = await fetch('/api/generate-character', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: normalized, species }),
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

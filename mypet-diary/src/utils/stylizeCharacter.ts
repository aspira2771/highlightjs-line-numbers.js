/**
 * Turn a pet photo into a cute 2D flat-illustration character via OpenAI
 * gpt-image-1 image edits. Returns a transparent PNG data URL.
 *
 * SECURITY: this calls the OpenAI API directly from the client using a key in
 * import.meta.env.VITE_OPENAI_API_KEY. That key is embedded in the bundle and
 * therefore exposed — fine for local testing, but a real release must route the
 * call through a backend/serverless proxy that holds the key.
 */

const ENDPOINT = 'https://api.openai.com/v1/images/edits';

const PROMPT =
  'Redesign this pet as a simple, iconic 2D mascot in the minimalist flat style ' +
  'of Korean city mascots (Seoul "Soul Friends" / Haechi). Heavily simplify and ' +
  'abstract it into a few clean rounded geometric shapes — it should look like a ' +
  'designed character, NOT a realistic drawing of the photo. Rules: flat solid ' +
  'pastel colors only; NO outline or only an ultra-thin subtle line; very small ' +
  'minimal dot or short-line eyes; tiny simple mouth; lots of negative space; ' +
  'exaggerate just one or two cute signature traits of the animal (ears, tail, ' +
  'spots, fang…) for personality. Charming, friendly, playful. Strictly flat 2D ' +
  'vector art — no gradients, no shading, no texture, no drop shadow, no 3D. ' +
  'Keep the species and main color recognizable but stylized. Single character, ' +
  'centered, full body, generous margin, transparent background.';

export function hasOpenAIKey(): boolean {
  return Boolean(import.meta.env.VITE_OPENAI_API_KEY);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(head)?.[1] ?? 'image/png';
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function stylizeCharacter(photoDataUrl: string): Promise<string> {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!key) {
    throw new Error('OpenAI API 키가 설정되지 않았어요 (VITE_OPENAI_API_KEY).');
  }

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('image', dataUrlToBlob(photoDataUrl), 'pet.png');
  form.append('prompt', PROMPT);
  form.append('size', '1024x1024');
  form.append('quality', 'medium');
  form.append('background', 'transparent');
  form.append('n', '1');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`이미지 생성 실패 (${res.status}): ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = json.data?.[0];
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  if (first?.url) return first.url;
  throw new Error('이미지 생성 응답이 비어 있어요.');
}

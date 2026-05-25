/**
 * Turn a pet photo into an iconic 3D-character version via OpenAI gpt-image-1
 * image edits. Returns a transparent PNG data URL.
 *
 * SECURITY: this calls the OpenAI API directly from the client using a key in
 * import.meta.env.VITE_OPENAI_API_KEY. That key is embedded in the bundle and
 * therefore exposed — fine for local testing, but a real release must route the
 * call through a backend/serverless proxy that holds the key.
 */

const ENDPOINT = 'https://api.openai.com/v1/images/edits';

const PROMPT =
  'Transform this pet into a cute, iconic 3D-rendered mascot character in a ' +
  'Pixar / Disney animation style: big expressive friendly eyes, soft rounded ' +
  'shapes, smooth glossy fur, gentle studio lighting, vibrant but warm colors. ' +
  'Keep the animal’s species, breed, fur color and markings recognizable. ' +
  'Centered, full body or head-and-shoulders, facing forward, transparent background.';

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

export async function stylize3dCharacter(photoDataUrl: string): Promise<string> {
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

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

/**
 * Dev-only serverless-style proxy for AI character generation.
 *
 * The OpenAI key NEVER reaches the browser — it lives only in this Node
 * middleware, read from `OPENAI_API_KEY` (loaded from `.env`, which is
 * gitignored). The frontend POSTs an image to `/api/generate-character`
 * and gets back a stylized 2D character as a data URL.
 *
 * For production (the built app / Capacitor), port this same logic to a
 * hosted serverless function (Vercel/Netlify/Cloudflare) — the browser
 * must never hold the key.
 */

const SPECIES_NOUN: Record<string, string> = {
  dog: 'dog',
  cat: 'cat',
  reptile: 'reptile (lizard/gecko)',
  hamster: 'hamster',
  rabbit: 'rabbit',
  other: 'pet animal',
};

function buildPrompt(species: string): string {
  const noun = SPECIES_NOUN[species] ?? 'pet animal';
  return [
    `Turn this photo of a ${noun} into an adorable 2D cartoon mascot character.`,
    'Flat vector sticker illustration, soft warm pastel colors, rounded friendly shapes,',
    'big expressive eyes, gentle smile, clean plain light background.',
    "Keep the animal's distinctive fur color, markings, and features recognizable.",
    'Cute and heart-warming, suitable for a pet-care diary app.',
  ].join(' ');
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

export function characterProxy(apiKey?: string): Plugin {
  return {
    name: 'mypet-character-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/generate-character',
        async (req, res) => {
          if (req.method !== 'POST') {
            return sendJson(res, 405, { error: 'POST만 허용돼요.' });
          }
          if (!apiKey) {
            return sendJson(res, 501, {
              error:
                'OPENAI_API_KEY가 설정되지 않았어요. mypet-diary/.env 에 키를 넣고 dev 서버를 재시작해주세요.',
            });
          }

          try {
            const body = await readJsonBody(req);
            const image = typeof body.image === 'string' ? body.image : '';
            const species =
              typeof body.species === 'string' ? body.species : 'other';

            const match = /^data:(image\/[\w.+-]+);base64,([\s\S]+)$/.exec(image);
            if (!match) {
              return sendJson(res, 400, {
                error: '이미지 형식이 올바르지 않아요.',
              });
            }
            const mime = match[1];
            const buffer = Buffer.from(match[2], 'base64');
            const ext = mime.split('/')[1]?.split('+')[0] ?? 'png';

            const form = new FormData();
            form.append('model', 'gpt-image-1');
            form.append('prompt', buildPrompt(species));
            form.append('size', '1024x1024');
            form.append(
              'image',
              new Blob([buffer], { type: mime }),
              `pet.${ext}`,
            );

            const openaiRes = await fetch(
              'https://api.openai.com/v1/images/edits',
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}` },
                body: form,
              },
            );

            if (!openaiRes.ok) {
              const detail = await openaiRes.text();
              return sendJson(res, 502, {
                error: 'AI 캐릭터 생성에 실패했어요. 잠시 후 다시 시도해주세요.',
                detail: detail.slice(0, 500),
              });
            }

            const json = (await openaiRes.json()) as {
              data?: Array<{ b64_json?: string }>;
            };
            const b64 = json.data?.[0]?.b64_json;
            if (!b64) {
              return sendJson(res, 502, {
                error: 'AI 응답에 이미지가 없어요.',
              });
            }
            return sendJson(res, 200, { image: `data:image/png;base64,${b64}` });
          } catch (err) {
            return sendJson(res, 500, {
              error: '서버 처리 중 오류가 났어요.',
              detail: err instanceof Error ? err.message : String(err),
            });
          }
        },
      );
    },
  };
}

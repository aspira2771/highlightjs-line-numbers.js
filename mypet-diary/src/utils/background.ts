import type { Config } from '@imgly/background-removal';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Cut the pet out of a photo (remove background) entirely in-browser via ML.
 * Returns a transparent PNG data URL. The model assets (~tens of MB) are
 * downloaded from the library CDN on first use, so this needs network and
 * takes a few seconds. Throws on failure so callers can fall back to the
 * original photo.
 */
export async function cutoutImage(
  src: string,
  onProgress?: (ratio: number) => void,
): Promise<string> {
  // Lazy-load so the heavy ONNX runtime is only fetched when a photo is added.
  const { removeBackground } = await import('@imgly/background-removal');
  const config: Config = {
    model: 'isnet_quint8', // smallest/fastest model — good for mobile
    output: { format: 'image/png' },
    progress: (_key, current, total) => {
      if (onProgress && total > 0) onProgress(current / total);
    },
  };
  const blob = await removeBackground(src, config);
  return blobToDataUrl(blob);
}

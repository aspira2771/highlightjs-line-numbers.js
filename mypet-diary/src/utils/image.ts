/** Read a File into a data URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Re-encode a data URL to a smaller image, capped at `max` px on the long edge.
 * Keeps localStorage from bloating and normalizes phone formats. Falls back to
 * the original on decode failure.
 */
export function downscaleImage(
  dataUrl: string,
  max = 1024,
  type: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality = 0.85,
): Promise<string> {
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
      resolve(canvas.toDataURL(type, quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const MAX_EDGE = 960;
const JPEG_Q = 0.72;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export async function toCompressedDataUrl(src: string): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_Q);
}

export async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  return toCompressedDataUrl(raw);
}

export function captureVideoFrame(video: HTMLVideoElement): string {
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 360;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_Q);
}

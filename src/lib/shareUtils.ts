export interface ShareableBirthdayData {
  name: string;
  age: number;
  message: string;
  photoUrl: string | null;
  memoryPhotos: string[];
  wishText: string;
  bgmUrl?: string | null;
}

const toBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const fromBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
};

export const compressImage = (
  file: File,
  maxWidth = 200,
  quality = 0.5,
  format: "image/jpeg" | "image/webp" = "image/webp",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas not supported");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(format, quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const encodeBirthdayData = (data: ShareableBirthdayData): string => {
  const json = JSON.stringify(data);
  const utf8 = encodeURIComponent(json);
  return toBase64Url(utf8);
};

export const decodeBirthdayData = (encoded: string): ShareableBirthdayData | null => {
  try {
    const decoded = fromBase64Url(encoded);
    const json = decodeURIComponent(decoded);
    const parsed = JSON.parse(json);
    return {
      ...parsed,
      memoryPhotos: parsed.memoryPhotos || [],
      wishText: parsed.wishText || parsed.message || "",
    };
  } catch {
    try {
      // Legacy format fallback
      const json = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(json);
      return {
        ...parsed,
        memoryPhotos: parsed.memoryPhotos || [],
        wishText: parsed.wishText || parsed.message || "",
      };
    } catch {
      return null;
    }
  }
};

export const buildShareUrl = (data: ShareableBirthdayData): string => {
  const encoded = encodeBirthdayData(data);
  const base = window.location.origin;
  return `${base}/#/celebrate?d=${encoded}`;
};

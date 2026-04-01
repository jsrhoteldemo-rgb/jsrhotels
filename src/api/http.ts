import { API_BASE_URL } from '../config/api';

export const ADMIN_TOKEN_KEY = 'jsr_admin_token';
export const ADMIN_LAST_ACTIVITY_KEY = 'jsr_admin_last_activity_at';
export const ADMIN_SESSION_STARTED_KEY = 'jsr_admin_session_started_at';
export const ADMIN_IDLE_TIMEOUT_MS = 1000 * 60 * 60; // 60 minutes

export function touchAdminSession() {
  if (!getAdminToken()) return;
  localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    localStorage.removeItem(ADMIN_SESSION_STARTED_KEY);
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_SESSION_STARTED_KEY, String(Date.now()));
  touchAdminSession();
}

async function parseJsonPayload<T>(response: Response): Promise<T> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    const snippet = text.slice(0, 140).trim();
    throw new Error(
      `API returned non-JSON response. Check API URL/deployment.${snippet ? ` Received: ${snippet}` : ''}`,
    );
  }

  return response.json() as Promise<T>;
}

function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export type MediaAssetUploadResponse = {
  id: string;
  url: string;
  [key: string]: unknown;
};

const MAX_UPLOAD_BYTES = 3.8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2200;
const MIN_IMAGE_DIMENSION = 720;
const QUALITY_STEPS = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];

function withChangedExtension(filename: string, extension: string) {
  const dot = filename.lastIndexOf('.');
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.${extension}`;
}

function readImageSize(file: File): Promise<{ width: number; height: number; image: CanvasImageSource; revoke?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then((bitmap) => ({
      width: bitmap.width,
      height: bitmap.height,
      image: bitmap,
      revoke: () => bitmap.close(),
    }));
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        image,
        revoke: () => URL.revokeObjectURL(url),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml') return file;
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  let imageMeta: { width: number; height: number; image: CanvasImageSource; revoke?: () => void } | null = null;

  try {
    imageMeta = await readImageSize(file);

    const maxOriginalEdge = Math.max(imageMeta.width, imageMeta.height);
    let targetEdge = Math.min(maxOriginalEdge, MAX_IMAGE_DIMENSION);
    const outputType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
    const outputExtension = outputType === 'image/webp' ? 'webp' : 'jpg';
    let bestBlob: Blob | null = null;

    while (targetEdge >= MIN_IMAGE_DIMENSION) {
      const scale = targetEdge / maxOriginalEdge;
      const targetWidth = Math.max(1, Math.round(imageMeta.width * scale));
      const targetHeight = Math.max(1, Math.round(imageMeta.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.drawImage(imageMeta.image, 0, 0, targetWidth, targetHeight);

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, outputType, quality);
        if (!blob) continue;
        bestBlob = !bestBlob || blob.size < bestBlob.size ? blob : bestBlob;

        if (blob.size <= MAX_UPLOAD_BYTES) {
          return new File([blob], withChangedExtension(file.name, outputExtension), {
            type: outputType,
            lastModified: Date.now(),
          });
        }
      }

      targetEdge = Math.floor(targetEdge * 0.82);
    }

    if (bestBlob) {
      return new File([bestBlob], withChangedExtension(file.name, outputExtension), {
        type: outputType,
        lastModified: Date.now(),
      });
    }

    return file;
  } catch {
    return file;
  } finally {
    imageMeta?.revoke?.();
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await parseJsonPayload<{ message?: string }>(response).catch(() => null);
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return parseJsonPayload<T>(response);
}

export async function apiRequestFormData<T>(path: string, formData: FormData, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    body: formData,
    headers,
  });

  if (!response.ok) {
    const payload = await parseJsonPayload<{ message?: string }>(response).catch(() => null);
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return parseJsonPayload<T>(response);
}

export async function uploadFile(file: File): Promise<MediaAssetUploadResponse> {
  const token = getAdminToken();
  const preparedFile = await prepareImageForUpload(file);
  const formData = new FormData();
  formData.append('file', preparedFile);

  const response = await fetch(buildApiUrl('/api/admin/uploads'), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Image is too large. Please upload an image under 4 MB.');
    }
    const payload = await parseJsonPayload<{ message?: string }>(response).catch(() => null);
    throw new Error(payload?.message || 'Upload failed');
  }

  return parseJsonPayload<MediaAssetUploadResponse>(response);
}

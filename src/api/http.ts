import { API_BASE_URL } from '../config/api';

export const ADMIN_TOKEN_KEY = 'jsr_admin_token';

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
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
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(buildApiUrl('/api/admin/uploads'), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const payload = await parseJsonPayload<{ message?: string }>(response).catch(() => null);
    throw new Error(payload?.message || 'Upload failed');
  }

  return parseJsonPayload<MediaAssetUploadResponse>(response);
}

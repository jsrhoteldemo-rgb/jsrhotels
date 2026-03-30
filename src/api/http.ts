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

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiRequestFormData<T>(path: string, formData: FormData, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: formData,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function uploadFile(file: File) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/admin/uploads`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Upload failed');
  }

  return response.json();
}

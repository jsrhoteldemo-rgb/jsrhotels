export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function resolveAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
  return url;
}

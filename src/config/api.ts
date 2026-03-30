// In production (Vercel), the API is served from the same origin so we use relative paths.
// In local development, VITE_API_BASE_URL points to the local Express server (e.g. http://localhost:4000).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function resolveAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
  return url;
}

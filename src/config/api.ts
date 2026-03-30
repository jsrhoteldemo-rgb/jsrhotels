// In production (Vercel), the API is on the same domain — use relative paths.
// In local dev, VITE_API_BASE_URL points to the Express server (http://localhost:4000).
// Guard: if the bundle was built with a localhost URL but is running on a real domain, ignore it.
const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const isRunningOnRealHost =
  typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const isLocalhostUrl = rawBase.includes('localhost') || rawBase.includes('127.0.0.1');

export const API_BASE_URL = isRunningOnRealHost && isLocalhostUrl ? '' : rawBase;

export function resolveAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
  return url;
}

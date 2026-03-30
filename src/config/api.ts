// In production (Vercel), the API is on the same domain — use relative paths.
// In local dev, default to local API when VITE_API_BASE_URL is not set.
// Guard: if a production build was pointed at localhost, ignore that at runtime.
const rawBase = String(import.meta.env.VITE_API_BASE_URL || '').trim();
const isDev = Boolean(import.meta.env.DEV);
const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : '';
const isRunningOnLocalhost = /^(localhost|127\.0\.0\.1|::1)$/.test(host);
const isLocalhostUrl = /^https?:\/\/(localhost|127\.0\.0\.1|::1)(:\d+)?$/i.test(rawBase);

const normalizedBase = rawBase.replace(/\/+$/, '');

export const API_BASE_URL =
  normalizedBase
    ? isBrowser && !isRunningOnLocalhost && isLocalhostUrl
      ? ''
      : normalizedBase
    : isDev
      ? 'http://localhost:4000'
      : '';

export function resolveAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
  return url;
}

import { useEffect } from 'react';
import { apiRequest } from '../api/http';

const SESSION_KEY = 'jsr_visitor_session';

function getSessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

interface ViewTrackOptions {
  path: string;
  sectionKey?: string;
  portfolioPropertyId?: string;
}

export function useViewTracker({ path, sectionKey, portfolioPropertyId }: ViewTrackOptions) {
  useEffect(() => {
    const sessionId = getSessionId();
    const resolvedSectionKey = sectionKey || path;

    apiRequest('/api/public/view-events', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        path,
        sectionKey: resolvedSectionKey,
        portfolioPropertyId,
      }),
    }).catch(() => {
      // Silent fail: analytics should never block UX.
    });
  }, [path, sectionKey, portfolioPropertyId]);
}

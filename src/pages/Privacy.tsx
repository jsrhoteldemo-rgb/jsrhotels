import { motion } from 'framer-motion';
import { fallbackLegalDocuments } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { LegalDocument } from '../types/content';

const Privacy = () => {
  const { data: doc } = usePublicData<LegalDocument>({
    path: '/api/public/legal/privacy',
    fallbackData: fallbackLegalDocuments.PRIVACY,
  });
  const title = doc?.title || 'Privacy Policy';
  const updatedAt = doc?.updatedAt || null;
  const content = doc?.content || '';

  useViewTracker({ path: '/privacy-policy' });

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>{title}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Last Updated: {updatedAt ? new Date(updatedAt).toLocaleDateString() : '-'}
          </p>
        </motion.div>
        <div style={{ color: 'var(--color-text-main)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default Privacy;

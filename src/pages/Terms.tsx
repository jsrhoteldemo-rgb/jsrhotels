import { motion } from 'framer-motion';
import { fallbackLegalDocuments } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { LegalDocument } from '../types/content';

const Terms = () => {
  const { data: doc } = usePublicData<LegalDocument>({
    path: '/api/public/legal/terms',
    fallbackData: fallbackLegalDocuments.TERMS,
  });

  useViewTracker({ path: '/terms' });

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>{doc.title}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Last Updated: {new Date(doc.updatedAt).toLocaleDateString()}</p>
        </motion.div>
        <div style={{ color: 'var(--color-text-main)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {doc.content}
        </div>
      </div>
    </div>
  );
};

export default Terms;

import { motion } from 'framer-motion';
import { fallbackLegalDocuments } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { LegalDocument } from '../types/content';
import './Terms.css';

const Terms = () => {
  const { data: doc } = usePublicData<LegalDocument>({
    path: '/api/public/legal/terms',
    fallbackData: fallbackLegalDocuments.TERMS,
  });
  const title = doc?.title || 'Terms & Conditions';
  const updatedAt = doc?.updatedAt || null;
  const content = doc?.content || '';

  useViewTracker({ path: '/terms' });

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          className="terms-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="terms-title">{title}</h1>
          <p className="terms-updated-at">
            Last Updated: {updatedAt ? new Date(updatedAt).toLocaleDateString() : '-'}
          </p>
        </motion.div>
        <div className="terms-content">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Terms;

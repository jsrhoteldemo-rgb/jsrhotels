import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../config/api';
import { fallbackAwardSections } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { ContentPageSection } from '../types/content';

const Awards = () => {
  const { data: sections } = usePublicData<ContentPageSection[]>({
    path: '/api/public/awards',
    fallbackData: fallbackAwardSections,
  });
  useViewTracker({ path: '/awards' });

  const visibleSections = (sections || []).filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const intro = visibleSections[0]?.body || '';

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Awards & Accolades</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            {intro}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
          {visibleSections.map((section, index) => (
            <motion.div
              key={section.id}
              className="glass-effect"
              style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              {section.imageAsset?.url ? (
                <img
                  src={resolveAssetUrl(section.imageAsset.url)}
                  alt={section.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', marginBottom: '1rem' }}
                />
              ) : (
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>
                  {section.icon || '🏆'}
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>{section.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{section.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Awards;

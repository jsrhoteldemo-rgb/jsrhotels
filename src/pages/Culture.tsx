import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../config/api';
import { fallbackCultureSections } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { ContentPageSection } from '../types/content';

const Culture = () => {
  const { data: sections } = usePublicData<ContentPageSection[]>({
    path: '/api/public/culture',
    fallbackData: fallbackCultureSections,
  });
  useViewTracker({ path: '/culture' });

  const visibleSections = sections.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const intro = visibleSections[0]?.body || 'At JSR Hotels, our people are our greatest asset.';

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Our Culture</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            {intro}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
          {visibleSections.map((section, index) => (
            <motion.div
              key={section.id}
              className="glass-effect"
              style={{ padding: '3rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
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
              ) : section.icon ? (
                <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{section.icon}</div>
              ) : null}
              <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>{section.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{section.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Culture;

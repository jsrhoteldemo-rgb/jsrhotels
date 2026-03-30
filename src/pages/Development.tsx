import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../config/api';
import { fallbackDevelopmentSections } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { ContentPageSection } from '../types/content';
import './Development.css';

const Development = () => {
  const { data: sections } = usePublicData<ContentPageSection[]>({
    path: '/api/public/development',
    fallbackData: fallbackDevelopmentSections,
  });
  useViewTracker({ path: '/development' });

  const visibleSections = sections.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const intro =
    visibleSections[0]?.body ||
    'From revolutionary concepts to magnificent physical creations, JSR Hotels manages premium developments.';

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Property Development</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            {intro}
          </p>
        </motion.div>

        <div className="development-grid">
          {visibleSections.map((section, index) => (
            <motion.div
              key={section.id}
              className="development-card glass-effect"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              {section.imageAsset?.url ? (
                <img
                  className="development-card-image"
                  src={resolveAssetUrl(section.imageAsset.url)}
                  alt={section.title}
                />
              ) : section.icon ? (
                <div className="development-card-icon">{section.icon}</div>
              ) : null}
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Development;

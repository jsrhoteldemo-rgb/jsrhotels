import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fallbackAboutSections } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import { resolveAssetUrl } from '../config/api';
import type { AboutSection } from '../types/content';

function getSectionImage(section: AboutSection, fallback = '/about-demo.png') {
  if (section.imageAsset?.url) return resolveAssetUrl(section.imageAsset.url);
  return fallback;
}

const About = () => {
  const { data: sections } = usePublicData<AboutSection[]>({
    path: '/api/public/about',
    fallbackData: fallbackAboutSections,
  });

  useViewTracker({ path: '/about' });

  const visibleSections = sections.filter((section) => section.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = visibleSections[0];

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>About JSR Hotels</h1>
          <p style={{ maxWidth: '700px', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
            A legacy of luxury, comfort, and uncompromising service.
          </p>
        </motion.div>

        {primary && (
          <div className="intro-grid" style={{ alignItems: 'flex-start' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{primary.title}</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.8 }}>
                {primary.body}
              </p>
              <Link to="/portfolio" className="btn-primary">
                View Our Portfolio
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="img-hover-scale"
            >
              <img
                src={getSectionImage(primary)}
                alt={primary.title}
                style={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;

import { motion } from 'framer-motion';
import { fallbackServices } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { ServiceItem } from '../types/content';
import './Services.css';

const Services = () => {
  const { data: servicesList } = usePublicData<ServiceItem[]>({
    path: '/api/public/services',
    fallbackData: fallbackServices,
  });

  useViewTracker({ path: '/services' });

  const visibleServices = servicesList.filter((service) => service.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Our Capabilities</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            Transforming visionary concepts into award-winning reality through strategic investment, development,
            and exceptional management.
          </p>
        </motion.div>

        <div className="services-grid">
          {visibleServices.map((service, index) => (
            <motion.div
              key={service.id}
              className="service-card glass-effect"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="service-icon">{service.icon || '•'}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="services-cta"
        >
          <h2>Ready to elevate your hospitality portfolio?</h2>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }}>
            Inquire Now
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;

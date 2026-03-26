import { motion } from 'framer-motion';
import './Services.css';

const servicesList = [
  {
    title: 'Hospitality Investment',
    description: 'Identifying high-yield opportunities and managing investments thoughtfully with dedicated capital markets guidance and asset management.',
    icon: '📈',
  },
  {
    title: 'Property Development',
    description: 'End-to-end architectural execution, project management, and premium interior design for ground-up developments and renovations.',
    icon: '🏗️',
  },
  {
    title: 'Operations & Management',
    description: 'Comprehensive, award-winning operational leadership ensuring uncompromised guest experiences and maximized property profitability.',
    icon: '🤝',
  },
  {
    title: 'Brand Strategy',
    description: 'Strategic partnerships with leading global hospitality flags to secure premium market positioning and long-term brand equity.',
    icon: '💎',
  }
];

const Services = () => {
  return (
    <div className="page-wrapper" style={{ paddingTop: '80px', backgroundColor: 'var(--color-bg)' }}>
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Our Capabilities</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            Transforming visionary concepts into award-winning reality through strategic investment, development, and exceptional management.
          </p>
        </motion.div>

        <div className="services-grid">
          {servicesList.map((service, index) => (
            <motion.div 
              key={index}
              className="service-card glass-effect"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="service-icon">{service.icon}</div>
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
            <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Inquire Now</button>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;

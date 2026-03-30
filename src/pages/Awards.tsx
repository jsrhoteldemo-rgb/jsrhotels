import { motion } from 'framer-motion';

const Awards = () => {
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
            Recognized globally for unparalleled service, exquisite design, and visionary hospitality management.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>🏆</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>2025 Best of The Best Award</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Awarded for achieving top-tier guest satisfaction scores and flawless operational excellence across all major properties.</p>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>🌟</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Global Hospitality Platinum</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Recognizing JSR Hotels among the top 1% worldwide for luxury accommodations and premium curated resort experiences.</p>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>🏛️</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Excellence in Architecture</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Honoring industry-leading property development, sustainable materials usage, and magnificent interior design execution.</p>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Awards;

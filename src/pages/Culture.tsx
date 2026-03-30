import { motion } from 'framer-motion';

const Culture = () => {
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
            At JSR Hotels, our people are our greatest asset. We cultivate a dynamic environment of excellence, integrity, and warmth.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Excellence</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  We never settle for average. From the meticulously curated details of our rooms to the proactive nature of our staff, we believe true luxury is born out of an obsession with continuous improvement and setting new industry benchmarks.
                </p>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Integrity</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  Transparency and trust are the cornerstones of our operational philosophy. We foster honest relationships with our guests, partners, and investors, knowing that long-term value is built through unwavering corporate responsibility.
                </p>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Guest-Centricity</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  Every decision we make is viewed through the lens of the guest experience. We empower our teams to anticipate needs, resolve challenges intuitively, and craft deeply personalized memories that turn first-time visitors into lifelong advocates.
                </p>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Culture;

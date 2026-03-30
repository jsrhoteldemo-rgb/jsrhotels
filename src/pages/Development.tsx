import { motion } from 'framer-motion';

const Development = () => {
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
            From revolutionary concepts to magnificent physical creations, JSR Hotels manages premium ground-up developments and extensive renovations.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', marginTop: '2rem' }}>
            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Vision & Site Selection</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  Our development journey begins with identifying locations that hold the potential to become landmark destinations. Through meticulous market research and environmental assessment, we secure properties that align perfectly with the JSR luxury brand standard. We evaluate community impact, accessibility, and long-term asset appreciation.
                </p>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Architectural Excellence</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  Partnering with world-renowned architects, we design spaces that captivate the imagination and stand the test of time. Our architectural philosophy balances bold modern aesthetics with classic principles of form and function. Every JSR property is crafted to be a visually striking icon within its surrounding landscape.
                </p>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Construction & Integration</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  We execute construction with zero compromises on quality, ensuring that premium materials and sustainable practices are implemented throughout. Our development timeline integrates advanced technology and smart-hotel infrastructure, resulting in a flawless transition from development to active hospitality management.
                </p>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Development;

import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>Terms & Conditions</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Last Updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
        <div style={{ color: 'var(--color-text-main)', lineHeight: 1.8 }}>
            <p>These Terms and Conditions constitute a legally binding agreement made between you and JSR Hotels concerning your access to and use of this website.</p>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)' }}>1. Agreement to Terms</h3>
            <p>By accessing the site, you agree that you have read, understood, and agreed to be bound by all of these Terms and Conditions.</p>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)' }}>2. Intellectual Property Rights</h3>
            <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site are owned or controlled by us.</p>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)' }}>3. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws, and you irrevocably submit to the exclusive jurisdiction of the courts.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;

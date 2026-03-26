import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Last Updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
        <div style={{ color: 'var(--color-text-main)', lineHeight: 1.8 }}>
            <p>At JSR Hotels, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.</p>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)' }}>1. Information We Collect</h3>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes personal data, such as name, email address, physical address, and telephone number.</p>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)' }}>2. Use of Your Information</h3>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We may use information collected about you to respond to inquiries, send you administrative information, or improve our services.</p>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)' }}>3. Contact Us</h3>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: info@jsrhotels.com</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

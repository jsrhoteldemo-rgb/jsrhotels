import { motion } from 'framer-motion';
import './Contact.css';

const Contact = () => {
  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Contact Us</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            We're here to assist you with any inquiries or investment opportunities. Please feel free to reach out.
          </p>
        </motion.div>

        <div className="contact-grid">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="contact-info"
          >
            <h2>Get in Touch</h2>
            <div className="info-item">
              <h4>Address</h4>
              <p>123 Luxury Avenue, Beverly Hills, CA 90210</p>
            </div>
            <div className="info-item">
              <h4>Investment Inquiries</h4>
              <p>Email: invest@jsrhotels.com</p>
              <p>Phone: +1 (555) 987-6543</p>
            </div>
            <div className="info-item">
              <h4>General Inquiries</h4>
              <p>Email: info@jsrhotels.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="contact-form-wrapper glass-effect"
          >
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="contact-name">Name</label>
                <input id="contact-name" type="text" placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input id="contact-email" type="email" placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" type="text" placeholder="General Inquiry" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" rows={5} placeholder="How can we help you?"></textarea>
              </div>
              <button className="btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

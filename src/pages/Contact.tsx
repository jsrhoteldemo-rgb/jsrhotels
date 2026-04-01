import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../api/http';
import { fallbackContact } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { ContactInfo } from '../types/content';
import { isValidEmail, isValidUsPhone, normalizeEmail } from '../utils/validation';
import './Contact.css';

const Contact = () => {
  const { data: contact } = usePublicData<ContactInfo>({
    path: '/api/public/contact',
    fallbackData: fallbackContact,
  });
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const heading = contact?.heading || 'Contact';
  const introText = contact?.introText || '';
  const address = contact?.address || '-';
  const investmentEmail = contact?.investmentEmail || '-';
  const investmentPhone = contact?.investmentPhone || '-';
  const generalEmail = contact?.generalEmail || '-';
  const generalPhone = contact?.generalPhone || '-';

  useViewTracker({ path: '/contact' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus(null);
    setIsSubmitting(true);
    const email = normalizeEmail(form.email);
    const phone = String(form.phone || '').trim();

    if (!isValidEmail(email)) {
      setSubmitStatus({ type: 'error', text: 'Please enter a valid email address.' });
      setIsSubmitting(false);
      return;
    }

    if (phone && !isValidUsPhone(phone)) {
      setSubmitStatus({ type: 'error', text: 'Please enter a valid US phone number.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await apiRequest<{ success: true; id: string }>('/api/public/contact-messages', {
        method: 'POST',
        body: JSON.stringify({ ...form, email }),
      });

      setForm({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setSubmitStatus({ type: 'success', text: 'Thanks. Your message has been sent successfully.' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        text: (error as Error).message || 'Unable to send your message right now. Please try again shortly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>{heading}</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{introText}</p>
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
              <p>{address}</p>
            </div>
            <div className="info-item">
              <h4>Investment Inquiries</h4>
              <p>Email: {investmentEmail}</p>
              <p>Phone: {investmentPhone}</p>
            </div>
            <div className="info-item">
              <h4>General Inquiries</h4>
              <p>Email: {generalEmail}</p>
              <p>Phone: {generalPhone}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="contact-form-wrapper glass-effect"
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  required
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  required
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-phone">Phone Number (Optional)</label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="General Inquiry"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="How can we help you?"
                  value={form.message}
                  required
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                ></textarea>
              </div>
              {submitStatus && (
                <p className={`form-feedback ${submitStatus.type}`}>{submitStatus.text}</p>
              )}
              <button className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

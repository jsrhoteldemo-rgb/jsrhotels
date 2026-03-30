import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { apiRequestFormData } from '../api/http';
import { useViewTracker } from '../hooks/useViewTracker';
import './Careers.css';

interface CareerApplyResponse {
  success: boolean;
  id: string;
}

const Careers = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experienceYears: '',
    city: '',
    state: '',
    coverLetter: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useViewTracker({ path: '/careers' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resume) {
      setFeedback({ type: 'error', text: 'Please upload your resume before submitting.' });
      return;
    }

    const payload = new FormData();
    payload.append('fullName', form.fullName.trim());
    payload.append('email', form.email.trim());
    payload.append('phone', form.phone.trim());
    payload.append('position', form.position.trim());
    payload.append('city', form.city.trim());
    payload.append('state', form.state.trim());
    payload.append('coverLetter', form.coverLetter.trim());

    if (form.experienceYears.trim()) {
      payload.append('experienceYears', form.experienceYears.trim());
    }

    payload.append('resume', resume);

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await apiRequestFormData<CareerApplyResponse>('/api/public/careers/apply', payload, { method: 'POST' });
      setForm({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experienceYears: '',
        city: '',
        state: '',
        coverLetter: '',
      });
      setResume(null);
      setFeedback({ type: 'success', text: 'Application submitted successfully. Our team will review it shortly.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: (error as Error).message || 'Unable to submit your application right now. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding careers-page">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="careers-hero"
        >
          <h1>Careers at JSR Hotels</h1>
          <p>
            Join our team and help shape premium hospitality experiences across the United States.
            Submit your details below and we will connect if your profile matches current openings.
          </p>
        </motion.div>

        <div className="careers-grid">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="careers-panel"
          >
            <h2>Why Work With Us</h2>
            <ul>
              <li>Growth opportunities across hotel operations and development.</li>
              <li>Collaborative teams with a strong guest-first culture.</li>
              <li>Projects with leading hospitality brands in the U.S.</li>
            </ul>
            <p>Accepted resume formats: PDF, DOC, DOCX (max 10MB).</p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="careers-form-wrap glass-effect"
          >
            <form className="careers-form" onSubmit={handleSubmit}>
              <div className="careers-form-grid">
                <label>
                  <span>Full Name</span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555 123 4567"
                  />
                </label>
                <label>
                  <span>Position Applying For</span>
                  <input
                    required
                    value={form.position}
                    onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                    placeholder="Front Desk Manager"
                  />
                </label>
                <label>
                  <span>Experience (Years)</span>
                  <input
                    min={0}
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) => setForm((prev) => ({ ...prev, experienceYears: e.target.value }))}
                    placeholder="3"
                  />
                </label>
                <label>
                  <span>City</span>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Los Angeles"
                  />
                </label>
                <label>
                  <span>State</span>
                  <input
                    value={form.state}
                    onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="CA"
                  />
                </label>
                <label>
                  <span>Resume</span>
                  <input
                    required
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <label>
                <span>Cover Letter (Optional)</span>
                <textarea
                  rows={6}
                  value={form.coverLetter}
                  onChange={(e) => setForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                  placeholder="Tell us about your background and interest in this role."
                />
              </label>

              {feedback && (
                <p className={`careers-feedback ${feedback.type}`}>{feedback.text}</p>
              )}

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Careers;

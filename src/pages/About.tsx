import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>About JSR Hotels</h1>
          <p style={{ maxWidth: '700px', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
            A legacy of luxury, comfort, and uncompromising service.
          </p>
        </motion.div>

        <div className="intro-grid" style={{ alignItems: 'flex-start' }}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Our Heritage</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.8 }}>
              Founded with a vision to redefine excellence in the hospitality group sector, JSR Hotels has consistently set the benchmark for luxury and elegance. Our properties are more than just places to stay; they are destinations designed to immerse guests in an atmosphere of tranquility and grandeur.
            </p>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.8 }}>
              Drawing inspiration from visionary hospitality leaders, we blend architectural mastery with intuitive service. Every detail is curated to engage the senses, from the plush furnishings to the exquisite culinary offerings.
            </p>
            <Link to="/portfolio" className="btn-primary">View Our Suites</Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="img-hover-scale"
          >
            <img 
              src="/about-demo.png" 
              alt="Hotel Heritage Lounge" 
              style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
          </motion.div>
        </div>

        {/* NEW: Leadership Section */}
        <div style={{ marginTop: '8rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h5 style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '0.5rem' }}>The Visionaries</h5>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-text-main)' }}>Our Leadership Team</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
              <img src="/nilesh.jpeg" alt="Nilesh Patel" style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', margin: '0 auto 1.5rem auto', border: '3px solid var(--color-accent)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Nilesh Patel</h3>
              <p style={{ color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', marginBottom: '1rem' }}>CEO & Founder | JSR Hotels | Hospitality & Real Estate Growth</p>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, flexGrow: 1 }}>The driving force behind JSR Hotels' strategic expansion, mastering real estate investments and visionary architectural capabilities to deliver robust property growth and uncompromising luxury.</p>
              <a href="https://www.linkedin.com/in/nilesh-patel-3aa24040/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Connect on LinkedIn &rarr;</a>
            </motion.div>

            <motion.div 
                className="glass-effect" 
                style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
            >
              <img src="/aadi.png" alt="Aadi Patel" style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', margin: '0 auto 1.5rem auto', border: '3px solid var(--color-accent)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Aadi Patel</h3>
              <p style={{ color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '1rem' }}>CE of JSR Hotels</p>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, flexGrow: 1 }}>Spearheading operational excellence and brand standards to ensure every JSR property remains the pinnacle of seamless guest experiences and elite hospitality management.</p>
              <a href="https://www.linkedin.com/in/aadi-patel-52388023b/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Connect on LinkedIn &rarr;</a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

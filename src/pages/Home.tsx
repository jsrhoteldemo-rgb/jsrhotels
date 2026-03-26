import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, Users, ArrowRight } from 'lucide-react';
import heroBg from '../assets/hero.png';
import './Home.css';

const pillars = [
  {
    icon: <TrendingUp size={36} strokeWidth={1.5} />,
    title: 'Investment',
    desc: 'Identifying sound opportunities and managing hospitality investments strategically for maximized ROI and sustainable growth.'
  },
  {
    icon: <Building2 size={36} strokeWidth={1.5} />,
    title: 'Development',
    desc: 'From architectural design to construction, executing premium concepts perfectly at every phase of the pipeline.'
  },
  {
    icon: <Users size={36} strokeWidth={1.5} />,
    title: 'Management',
    desc: 'Operating with excellence through strategic brand partnerships and uncompromised, award-winning luxury service.'
  }
];

const news = [
  {
    date: 'Oct 24, 2025',
    title: 'JSR Breaks Ground on New Development',
    desc: 'Our latest coastal resort project officially begins construction, expanding our luxury footprint globally.'
  },
  {
    date: 'Sep 15, 2025',
    title: 'Industry Leaders Seminar 2025',
    desc: 'CEO Nilesh Patel speaks on the resilience and future of the American hospitality spirit.'
  }
];

const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <img 
          src={heroBg} 
          alt="JSR Hotels Main Exterior" 
          className="hero-img"
        />
        <div className="hero-content container">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            A Standard of Excellence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Immerse yourself in unparalleled luxury and world-class hospitality at JSR Hotels.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Link to="/portfolio" className="btn-primary">Explore Our Suites</Link>
          </motion.div>
        </div>
      </section>

      {/* NEW: Core Pillars Section */}
      <section className="pillars-section section-padding">
        <div className="container text-center">
            <motion.h5 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="section-subtitle"
            >
                What We Do
            </motion.h5>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="section-title"
            >
                Our Core Pillars
            </motion.h2>
            <div className="pillars-grid">
              {pillars.map((pillar, index) => (
                <motion.div 
                    key={index}
                    className="pillar-card glass-effect"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="pillar-icon">{pillar.icon}</div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro-section section-padding container" style={{ paddingTop: '2rem' }}>
        <div className="intro-grid">
          <motion.div 
            className="intro-text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h5>Welcome to JSR Hotels</h5>
            <h2>Redefining Luxury</h2>
            <p>From the moment you arrive, you'll experience a blend of timeless elegance and modern sophistication. Our property is designed to provide an oasis of comfort, offering personalized services, exquisite dining, and breathtaking views.</p>
            <Link to="/about" className="link-accent">Our Heritage &#8594;</Link>
          </motion.div>
          <motion.div 
            className="intro-image img-hover-scale"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="/lobby-demo.png" 
              alt="Luxury Lobby" 
            />
          </motion.div>
        </div>
      </section>

      {/* NEW: By The Numbers */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="container stats-grid">
            <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2>12</h2>
                <p>Hotels</p>
            </motion.div>
            <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <h2>4</h2>
                <p>States</p>
            </motion.div>
            <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <h2>2,500+</h2>
                <p>Rooms</p>
            </motion.div>
            <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                <h2>15+</h2>
                <p>Awards</p>
            </motion.div>
        </div>
      </section>

      {/* Featured Experience */}
      <section className="featured-experience">
        <div className="container fe-container">
            <div className="fe-image img-hover-scale">
                <img src="/featured-suite.png" alt="Premium Executive Suite" />
            </div>
            <motion.div 
                className="fe-content glass-effect"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{ padding: '1.5rem' }}
            >
                <div style={{ border: '1px solid rgba(158, 127, 34, 0.4)', padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h5>Featured Experience</h5>
                    <h2>The Executive Suite</h2>
                    <p style={{ marginBottom: '1.5rem' }}>Wake up to panoramic views and unmatched comfort. Designed for those who demand the finest in luxury travel.</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: 'var(--color-text-main)', fontSize: '1.05rem', fontWeight: 500 }}>
                        <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{color: 'var(--color-accent)'}}>✦</span> Panoramic City Views</li>
                        <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{color: 'var(--color-accent)'}}>✦</span> 24/7 Dedicated Butler</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{color: 'var(--color-accent)'}}>✦</span> Exclusive Lounge Access</li>
                    </ul>
                    <div style={{ marginTop: 'auto' }}>
                        <Link to="/portfolio" className="btn-primary">View Details</Link>
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* NEW: Leadership & News */}
      <section className="news-section section-padding">
        <div className="container">
            <div className="news-layout">
                <motion.div 
                    className="leadership-panel"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="quote-badge img-hover-scale" style={{ width: '120px', height: '120px' }}>
                        <img src="/nilesh.jpeg" alt="Nilesh Patel, Chairman & Founder" style={{ objectPosition: 'center top' }} />
                    </div>
                    <h3>"Like a well-planned hotel, solid investments in hospitality today are the bedrock of a prosperous future, offering a promising path to financial success and unmatched luxury."</h3>
                    <p className="quote-author">- Nilesh Patel, CEO & Founder | JSR Hotels | Hospitality & Real Estate Growth</p>
                </motion.div>
                
                <motion.div 
                    className="news-feed"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="feed-title">Latest Updates</h3>
                    {news.map((item, index) => (
                        <div className="news-card" key={index}>
                            <span className="news-date">{item.date}</span>
                            <h4>{item.title}</h4>
                            <p>{item.desc}</p>
                            <button className="link-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Read Article <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
      </section>

      {/* Accolades Section */}
      <section className="accolades-section section-padding" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container text-center">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text-main)' }}
            >
                Recent Accolades
            </motion.h2>
            <div className="accolades-grid">
                <motion.div 
                    className="accolade-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <span className="stars">★★★★★</span>
                    <h4>2025 Best of The Best Award</h4>
                    <p>Recognized for unparalleled service excellence</p>
                </motion.div>
                <motion.div 
                    className="accolade-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <span className="stars">★★★★★</span>
                    <h4>2024 Global Hospitality</h4>
                    <p>Top 1% worldwide for luxury accommodations</p>
                </motion.div>
                <motion.div 
                    className="accolade-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <span className="stars">★★★★★</span>
                    <h4>2023 Business Of The Year</h4>
                    <p>City wide recognition for premium experiences</p>
                </motion.div>
            </div>
        </div>
      </section>

      {/* NEW: Newsletter Section */}
      <section className="newsletter-section section-padding">
        <div className="container">
            <motion.div 
                className="newsletter-box glass-effect"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="nl-content">
                    <h2>Stay Connected</h2>
                    <p>Sign up for our newsletter to receive updates and exclusive investment opportunities.</p>
                </div>
                <div className="nl-form">
                    <input type="email" placeholder="Your Email Address" />
                    <button className="btn-primary">Subscribe</button>
                </div>
            </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

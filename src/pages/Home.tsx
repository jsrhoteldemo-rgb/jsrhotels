import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight, Building2, TrendingUp, Users } from 'lucide-react';
import { resolveAssetUrl } from '../config/api';
import { fallbackHomeBlocks } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { HomeBlock } from '../types/content';
import './Home.css';

function getBlockImage(block?: HomeBlock | null) {
  if (!block) return '';
  if (block.imageAsset?.url) return resolveAssetUrl(block.imageAsset.url);

  const payload = block.payload as { imageUrl?: string } | null;
  return payload?.imageUrl || '';
}

function getPayload<T>(block?: HomeBlock | null): T {
  return ((block?.payload || {}) as T) || ({} as T);
}

const iconMap: Record<string, ReactNode> = {
  TrendingUp: <TrendingUp size={36} strokeWidth={1.5} />,
  Building2: <Building2 size={36} strokeWidth={1.5} />,
  Users: <Users size={36} strokeWidth={1.5} />,
};

const Home = () => {
  const { data: blocks } = usePublicData<HomeBlock[]>({
    path: '/api/public/home',
    fallbackData: fallbackHomeBlocks,
  });

  useViewTracker({ path: '/' });

  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  const getBlock = (type: string) => sortedBlocks.find((block) => block.type === type && block.isVisible);

  const hero = getBlock('hero');
  const pillars = getBlock('pillars');
  const intro = getBlock('intro');
  const stats = getBlock('stats');
  const featured = getBlock('featured');
  const leadership = getBlock('leadership');
  const news = getBlock('news');
  const accolades = getBlock('accolades');
  const newsletter = getBlock('newsletter');

  const pillarsItems = getPayload<{ items?: Array<{ icon: string; title: string; desc: string }> }>(pillars).items || [];
  const statItems = getPayload<{ items?: Array<{ label: string; value: string }> }>(stats).items || [];
  const featureItems = getPayload<{ features?: string[] }>(featured).features || [];
  const newsItems = getPayload<{ items?: Array<{ date: string; title: string; desc: string }> }>(news).items || [];
  const accoladeItems =
    getPayload<{ items?: Array<{ title: string; desc: string }> }>(accolades).items || [];

  return (
    <div className="home-wrapper">
      {hero && (
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <img src={getBlockImage(hero)} alt="Luxury Hotel Exterior" className="hero-img" />
          <div className="hero-content container">
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
              {hero.heading}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
              {hero.description}
            </motion.p>
            {hero.ctaText && hero.ctaUrl && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}>
                <Link to={hero.ctaUrl} className="btn-primary">
                  {hero.ctaText}
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {pillars && (
        <section className="pillars-section section-padding">
          <div className="container text-center">
            <motion.h5 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-subtitle">
              {pillars.subheading}
            </motion.h5>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title">
              {pillars.heading}
            </motion.h2>
            <div className="pillars-grid">
              {pillarsItems.map((pillar, index) => (
                <motion.div
                  key={`${pillar.title}-${index}`}
                  className="pillar-card glass-effect"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="pillar-icon">{iconMap[pillar.icon] || iconMap.Users}</div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {intro && (
        <section className="intro-section section-padding container" style={{ paddingTop: '2rem' }}>
          <div className="intro-grid">
            <motion.div className="intro-text" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <h5>{intro.subheading}</h5>
              <h2>{intro.heading}</h2>
              <p>{intro.description}</p>
              {intro.ctaText && intro.ctaUrl && (
                <Link to={intro.ctaUrl} className="link-accent">
                  {intro.ctaText} &#8594;
                </Link>
              )}
            </motion.div>
            <motion.div className="intro-image img-hover-scale" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <img src={getBlockImage(intro)} alt="Luxury Lobby" />
            </motion.div>
          </div>
        </section>
      )}

      {stats && (
        <section className="stats-section">
          <div className="stats-overlay"></div>
          <div className="container stats-grid">
            {statItems.map((item, index) => (
              <motion.div
                className="stat-item"
                key={`${item.label}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h2>{item.value}</h2>
                <p>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {featured && (
        <section className="featured-experience">
          <div className="container fe-container">
            <div className="fe-image img-hover-scale">
              <img src={getBlockImage(featured)} alt={featured.heading || 'Featured Suite'} />
            </div>
            <motion.div
              className="fe-content glass-effect"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ padding: '1.5rem' }}
            >
              <div
                style={{
                  border: '1px solid rgba(158, 127, 34, 0.4)',
                  padding: '3rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <h5>{featured.subheading}</h5>
                <h2>{featured.heading}</h2>
                <p style={{ marginBottom: '1.5rem' }}>{featured.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: 'var(--color-text-main)', fontSize: '1.05rem', fontWeight: 500 }}>
                  {featureItems.map((feature, index) => (
                    <li key={`${feature}-${index}`} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--color-accent)' }}>✦</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {featured.ctaText && featured.ctaUrl && (
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={featured.ctaUrl} className="btn-primary">
                      {featured.ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {(leadership || news) && (
        <section className="news-section section-padding">
          <div className="container">
            <div className="news-layout">
              {leadership && (
                <motion.div className="leadership-panel" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <div className="quote-badge img-hover-scale" style={{ width: '120px', height: '120px' }}>
                    <img src={getBlockImage(leadership)} alt="Leadership" style={{ objectPosition: 'center top' }} />
                  </div>
                  <h3>{leadership.heading}</h3>
                  <p className="quote-author">{leadership.description}</p>
                </motion.div>
              )}

              {news && (
                <motion.div className="news-feed" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <h3 className="feed-title">{news.heading}</h3>
                  {newsItems.map((item, index) => (
                    <div className="news-card" key={`${item.title}-${index}`}>
                      <span className="news-date">{item.date}</span>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                      <button className="link-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Read Article <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {accolades && (
        <section className="accolades-section section-padding" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="container text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text-main)' }}>
              {accolades.heading}
            </motion.h2>
            <div className="accolades-grid">
              {accoladeItems.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  className="accolade-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                >
                  <span className="stars">★★★★★</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {newsletter && (
        <section className="newsletter-section section-padding">
          <div className="container">
            <motion.div className="newsletter-box glass-effect" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="nl-content">
                <h2>{newsletter.heading}</h2>
                <p>{newsletter.description}</p>
              </div>
              <div className="nl-form">
                <input type="email" placeholder="Your Email Address" />
                <button className="btn-primary">Subscribe</button>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

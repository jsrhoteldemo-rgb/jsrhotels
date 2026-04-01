import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../config/api';
import { fallbackSiteSetting, fallbackSocialLinks } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import type { ContactInfo, SiteSetting, SocialLink } from '../types/content';
import './Footer.css';

interface FooterData {
  siteSetting: SiteSetting;
  socialLinks: SocialLink[];
  contact?: ContactInfo | null;
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform.toLowerCase().includes('facebook')) {
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }

  if (platform.toLowerCase().includes('instagram')) {
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const Footer = () => {
  const developerLinkedInUrl = 'https://www.linkedin.com/in/harikumarpatel/';
  const { data } = usePublicData<FooterData>({
    path: '/api/public/footer',
    fallbackData: { siteSetting: fallbackSiteSetting, socialLinks: fallbackSocialLinks },
  });
  const siteSetting = data?.siteSetting;
  const socialLinks = data?.socialLinks || [];
  const contact = data?.contact;

  const logoAssetUrl = siteSetting?.logoAsset?.url;
  const logoSrc = logoAssetUrl ? resolveAssetUrl(logoAssetUrl) : '/logo.jpg';

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo-wrapper">
            <img
              src={logoSrc}
              alt={`${siteSetting?.brandName || 'JSR Hotels'} Logo`}
              className="footer-logo"
              onError={(event) => {
                event.currentTarget.src = '/logo.jpg';
              }}
            />
            <h2 className="footer-brand-name">{siteSetting?.brandName || 'JSR Hotels'}</h2>
          </div>
          <p>{siteSetting?.footerTagline || ''}</p>
          <div className="social-links">
            {socialLinks
              .filter((link) => link.isVisible)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform}>
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">Our Story</Link>
            </li>
            <li>
              <Link to="/culture">Our Culture</Link>
            </li>
            <li>
              <Link to="/team">Meet Our Team</Link>
            </li>
            <li>
              <Link to="/portfolio">Portfolio</Link>
            </li>
            <li>
              <Link to="/services">Capabilities</Link>
            </li>
            <li>
              <Link to="/awards">Awards & Accolades</Link>
            </li>
            <li>
              <Link to="/careers">Careers</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>{contact?.address || ''}</p>
          <p>
            Email:{' '}
            <a href={`mailto:${contact?.generalEmail || ''}`}>
              {contact?.generalEmail || '-'}
            </a>
          </p>
          <p>
            Phone:{' '}
            <a href={`tel:${(contact?.generalPhone || '').replace(/[^+\d]/g, '')}`}>
              {contact?.generalPhone || '-'}
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p>&copy; {new Date().getFullYear()} {siteSetting?.brandName || 'JSR Hotels'}. All rights reserved.</p>
          <p className="designer-credit">
            Designed and Developed by{' '}
            <a href={developerLinkedInUrl} target="_blank" rel="noopener noreferrer">
              Harikumar Patel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

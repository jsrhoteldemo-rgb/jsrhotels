import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { resolveAssetUrl } from '../config/api';
import { fallbackSiteSetting } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import type { SiteSetting } from '../types/content';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { data: siteSetting } = usePublicData<SiteSetting>({
    path: '/api/public/site-settings',
    fallbackData: fallbackSiteSetting,
  });

  const isHomePage = location.pathname === '/';
  const isSolid = !isHomePage || scrolled || mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoSrc = siteSetting.logoAsset?.url ? resolveAssetUrl(siteSetting.logoAsset.url) : '/logo.jpg';

  return (
    <header className={`navbar ${isSolid ? 'glass-effect scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <img
            src={logoSrc}
            alt={`${siteSetting.brandName || 'JSR Hotels'} Logo`}
            className="nav-logo-img"
            onError={(event) => {
              event.currentTarget.src = '/logo.jpg';
            }}
          />
        </Link>

        <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
            Our Story
          </NavLink>
          <NavLink to="/services" onClick={() => setMobileMenuOpen(false)}>
            Capabilities
          </NavLink>
          <NavLink to="/development" onClick={() => setMobileMenuOpen(false)}>
            Development
          </NavLink>
          <NavLink to="/portfolio" onClick={() => setMobileMenuOpen(false)}>
            Portfolio
          </NavLink>
          <NavLink to="/awards" onClick={() => setMobileMenuOpen(false)}>
            Awards
          </NavLink>
          <NavLink to="/culture" onClick={() => setMobileMenuOpen(false)}>
            Culture
          </NavLink>
          <NavLink to="/team" onClick={() => setMobileMenuOpen(false)}>
            Team
          </NavLink>
          <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </NavLink>
        </nav>

        <button
          className="mobile-menu-btn"
          aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;

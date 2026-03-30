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

  const handleNavItemClick = () => {
    window.setTimeout(() => setMobileMenuOpen(false), 0);
  };

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
          <NavLink to="/" onClick={handleNavItemClick}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={handleNavItemClick}>
            Our Story
          </NavLink>
          <NavLink to="/services" onClick={handleNavItemClick}>
            Capabilities
          </NavLink>
          <NavLink to="/development" onClick={handleNavItemClick}>
            Development
          </NavLink>
          <NavLink to="/portfolio" onClick={handleNavItemClick}>
            Portfolio
          </NavLink>
          <NavLink to="/awards" onClick={handleNavItemClick}>
            Awards
          </NavLink>
          <NavLink to="/culture" onClick={handleNavItemClick}>
            Culture
          </NavLink>
          <NavLink to="/team" onClick={handleNavItemClick}>
            Team
          </NavLink>
          <NavLink to="/contact" onClick={handleNavItemClick}>
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

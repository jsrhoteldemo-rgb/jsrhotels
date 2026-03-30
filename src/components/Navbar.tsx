import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { resolveAssetUrl } from '../config/api';
import { fallbackSiteSetting } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import type { SiteSetting } from '../types/content';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'Our Story' },
  { path: '/services', label: 'Capabilities' },
  { path: '/development', label: 'Development' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/awards', label: 'Awards' },
  { path: '/culture', label: 'Culture' },
  { path: '/team', label: 'Team' },
  { path: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const logoSrc = siteSetting.logoAsset?.url
    ? resolveAssetUrl(siteSetting.logoAsset.url)
    : '/logo.jpg';

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleRouteClick =
    (path: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setMobileMenuOpen(false);

      if (location.pathname === path) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      navigate(path);

      // Fallback for production edge cases where client-side nav is interrupted.
      window.setTimeout(() => {
        if (window.location.pathname !== path) {
          window.location.assign(path);
        }
      }, 160);
    };

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
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={isActivePath(item.path) ? 'active' : ''}
              onClick={handleRouteClick(item.path)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className="mobile-menu-btn"
          aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;

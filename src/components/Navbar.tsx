import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { resolveAssetUrl } from '../config/api';
import { fallbackSiteSetting } from '../data/fallbackContent';
import { prefetchPublicData, usePublicData } from '../hooks/usePublicData';
import type { SiteSetting } from '../types/content';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'Our Story' },
  { path: '/services', label: 'Capabilities' },
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
  const prefetchPortfolioData = useCallback(() => {
    void prefetchPublicData('/api/public/brands');
    void prefetchPublicData('/api/public/portfolio');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      prefetchPortfolioData();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [prefetchPortfolioData]);

  const logoAssetUrl = siteSetting?.logoAsset?.url;
  const logoSrc = logoAssetUrl ? resolveAssetUrl(logoAssetUrl) : '/logo.jpg';
  const brandName = siteSetting?.brandName || 'JSR Hotels';

  // Synchronize favicon with site logo
  useEffect(() => {
    if (logoSrc) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = logoSrc;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = logoSrc;
        document.head.appendChild(newLink);
      }
    }
  }, [logoSrc]);

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
            alt={`${brandName} Logo`}
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
              onMouseEnter={item.path === '/portfolio' ? prefetchPortfolioData : undefined}
              onFocus={item.path === '/portfolio' ? prefetchPortfolioData : undefined}
              onTouchStart={item.path === '/portfolio' ? prefetchPortfolioData : undefined}
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

import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // If not on the Home page, or if the mobile menu is open, the navbar should use the solid/dark-text style.
  const isHomePage = location.pathname === '/';
  const isSolid = !isHomePage || scrolled || mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isSolid ? 'glass-effect scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.jpg" alt="JSR Hotels Logo" className="nav-logo-img" />
        </Link>
        
        <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/portfolio" onClick={() => setMobileMenuOpen(false)}>Portfolio</NavLink>
          <NavLink to="/services" onClick={() => setMobileMenuOpen(false)}>Services</NavLink>
          <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
        </nav>

        <button 
          className="mobile-menu-btn"
          aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
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

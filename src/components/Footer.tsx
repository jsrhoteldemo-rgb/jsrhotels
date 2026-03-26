import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo-wrapper">
             <img src="/logo.jpg" alt="JSR Hotels Logo" className="footer-logo" />
             <h2 className="footer-brand-name">JSR Hotels</h2>
          </div>
          <p>Experience luxury, comfort, and an unforgettable journey. Your premium destination awaits.</p>
          <div className="social-links">
             <a href="#" aria-label="Facebook">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
             </a>
             <a href="#" aria-label="Instagram">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>
             <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
             </a>
          </div>
        </div>
        
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/services">Capabilities</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>123 Luxury Ave, Beverly Hills, CA 90210</p>
          <p>Email: <a href="mailto:info@jsrhotels.com">info@jsrhotels.com</a></p>
          <p>Phone: <a href="tel:+15551234567">+1 (555) 123-4567</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p>&copy; {new Date().getFullYear()} JSR Hotels. All rights reserved.</p>
          <p className="designer-credit">Designed by Harikumar Patel</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

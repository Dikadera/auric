import React, { useState, useEffect } from 'react';
import { Sparkles, Instagram, Calendar, Menu, X } from 'lucide-react';

export default function Navbar({ onBookClick, onCustomizerClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Custom Studio', href: '#customizer' },
    { name: 'Lookbook', href: '#gallery' },
    { name: 'Policies & FAQ', href: '#policies' },
    { name: 'Reviews', href: '#reviews' },
  ];

  return (
    <header className={`navbar-header ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="#" className="nav-logo">
          <div className="logo-icon">
            <Sparkles size={20} color="#D4AF37" />
          </div>
          <div className="logo-text">
            <span className="brand-name">AURIC NAILS</span>
            <span className="brand-sub">BESPOKE STUDIO</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link">
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="nav-right">
          <a
            href="https://instagram.com/auricc_nails"
            target="_blank"
            rel="noopener noreferrer"
            className="insta-pill"
            title="Follow @auricc_nails"
          >
            <Instagram size={16} />
            <span>@auricc_nails</span>
          </a>

          <button onClick={onBookClick} className="btn-gold nav-book-btn">
            <Calendar size={16} />
            <span>Book Now</span>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} color="#D4AF37" /> : <Menu size={24} color="#D4AF37" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onCustomizerClick();
              }}
              className="btn-outline mobile-btn"
            >
              <Sparkles size={16} /> Customizer Studio
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="btn-gold mobile-btn"
            >
              <Calendar size={16} /> Book Appointment
            </button>
          </nav>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 22px 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .navbar-scrolled {
          padding: 14px 0;
          background: rgba(9, 9, 13, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #FFF;
          line-height: 1;
        }
        .brand-sub {
          font-size: 0.65rem;
          letter-spacing: 2.5px;
          color: var(--gold-light);
          font-weight: 600;
          margin-top: 3px;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: var(--transition);
        }
        .nav-link:hover {
          color: var(--gold-light);
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .insta-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-main);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;
          transition: var(--transition);
        }
        .insta-pill:hover {
          border-color: var(--gold-primary);
          color: var(--gold-light);
          background: rgba(212, 175, 55, 0.1);
        }
        .nav-book-btn {
          padding: 10px 20px;
          font-size: 0.85rem;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
        }
        .mobile-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(14, 14, 20, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          padding: 24px;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-nav-link {
          color: var(--text-main);
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 500;
        }
        .mobile-btn {
          width: 100%;
          justify-content: center;
          margin-top: 8px;
        }
        @media (max-width: 992px) {
          .desktop-nav {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
          .insta-pill {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

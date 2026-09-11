import React, { useState } from 'react';
import { Sparkles, Instagram, MapPin, Clock, Send, ArrowUp, Heart } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '16px' }}>
              <div className="logo-icon">
                <Sparkles size={20} color="#D4AF37" />
              </div>
              <div className="logo-text">
                <span className="brand-name">AURIC NAILS</span>
                <span className="brand-sub">BESPOKE STUDIO</span>
              </div>
            </div>

            <p className="brand-desc">
              High-end bespoke nail studio specializing in liquid gold chrome, 3D sculpted embellishments, acrylic extensions, and healthy BIAB overlays.
            </p>

            <a
              href="https://instagram.com/auricc_nails"
              target="_blank"
              rel="noopener noreferrer"
              className="insta-pill footer-insta"
            >
              <Instagram size={16} />
              <span>Follow @auricc_nails</span>
            </a>
          </div>

          {/* Opening Hours */}
          <div className="footer-col">
            <h4 className="footer-title"><Clock size={16} color="#D4AF37" /> Opening Hours</h4>
            <ul className="footer-list">
              <li><span>Tuesday - Friday:</span> <strong>10:00 AM - 7:00 PM</strong></li>
              <li><span>Saturday:</span> <strong>9:00 AM - 6:00 PM</strong></li>
              <li><span>Sunday - Monday:</span> <strong style={{ color: '#888' }}>Closed (Private VIP)</strong></li>
            </ul>
          </div>

          {/* Location */}
          <div className="footer-col">
            <h4 className="footer-title"><MapPin size={16} color="#D4AF37" /> Studio Location</h4>
            <p className="footer-text">
              104 Auric Studio Lane, Suite 4B<br />
              Sanitization Protocol Certified<br />
              <em>By Appointment Only</em>
            </p>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4 className="footer-title"><Send size={16} color="#D4AF37" /> VIP Drop Alerts</h4>
            <p className="footer-text">
              Subscribe to get notified first when new monthly slot drops & seasonal nail art collections open.
            </p>

            {subscribed ? (
              <div className="subscribe-success">
                ✨ You're on the VIP list! Check your inbox soon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="btn-gold sub-btn">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Auric Nails (@auricc_nails). All Rights Reserved. Handcrafted with precision.</p>

          <button onClick={scrollToTop} className="top-btn" title="Back to top">
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .footer-section {
          background: #060609;
          border-top: 1px solid var(--glass-border);
          padding: 80px 0 30px 0;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }
        .brand-desc {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .footer-insta {
          width: fit-content;
        }
        .footer-title {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          color: #FFF;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .footer-list li {
          display: flex;
          justify-content: space-between;
        }
        .footer-list strong {
          color: #FFF;
        }
        .footer-text {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.7;
        }
        .newsletter-form {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }
        .newsletter-form input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 10px 16px;
          color: #FFF;
          font-size: 0.85rem;
          flex: 1;
        }
        .newsletter-form input:focus {
          outline: none;
          border-color: var(--gold-primary);
        }
        .sub-btn {
          padding: 10px 18px;
          font-size: 0.8rem;
          border-radius: 20px;
        }
        .subscribe-success {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid var(--glass-border-active);
          color: var(--gold-light);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.82rem;
          margin-top: 14px;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--glass-border);
          padding-top: 24px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .top-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--gold-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .top-btn:hover {
          background: var(--gold-primary);
          color: #000;
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

import React from 'react';
import { Sparkles, Calendar, Palette, ShieldCheck, Star, Award, ChevronRight } from 'lucide-react';

export default function Hero({ onBookClick, onCustomizerClick }) {
  return (
    <section className="hero-section">
      <div className="hero-bg-glow"></div>

      <div className="container hero-container">
        {/* Left Column Text */}
        <div className="hero-content">
          <div className="badge-gold hero-badge pulse-gold">
            <Sparkles size={14} />
            <span>LUXURY BESPOKE NAIL STUDIO</span>
          </div>

          <h1 className="hero-title">
            Where Elegance Meets <span className="gold-text">Liquid Gold Artistry</span>
          </h1>

          <p className="hero-desc">
            Welcome to <strong>Auric Nails</strong> (<span className="gold-text">@auricc_nails</span>). Specializing in luxury acrylic extensions, long-wear Gel-X sets, BIAB overlays, and signature 3D metallic chrome nail art crafted with flawless precision.
          </p>

          {/* Action Buttons */}
          <div className="hero-actions">
            <button onClick={onBookClick} className="btn-gold">
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>

            <button onClick={onCustomizerClick} className="btn-outline">
              <Palette size={18} />
              <span>Virtual Studio</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <Star size={16} color="#D4AF37" fill="#D4AF37" />
                <span className="stat-val">4.9 / 5</span>
              </div>
              <span className="stat-label">300+ Five-Star Reviews</span>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Award size={16} color="#D4AF37" />
                <span className="stat-val">4+ Weeks</span>
              </div>
              <span className="stat-label">Guaranteed Retention</span>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <ShieldCheck size={16} color="#D4AF37" />
                <span className="stat-val">100% Medical</span>
              </div>
              <span className="stat-label">Autoclave Sterilization</span>
            </div>
          </div>
        </div>

        {/* Right Column Visual Showcase */}
        <div className="hero-visual">
          <div className="hero-image-frame glass-card">
            <img
              src="/images/hero.png"
              alt="Auric Nails Signature Champagne Gold Chrome Set"
              className="hero-img"
            />
            <div className="image-overlay-glow"></div>

            {/* Floating Floating Badges */}
            <div className="floating-card float-1 glass-card">
              <div className="float-icon">✨</div>
              <div>
                <p className="float-title">Signature Set</p>
                <p className="float-sub">Champagne Gold Chrome</p>
              </div>
            </div>

            <div className="floating-card float-2 glass-card">
              <div className="float-icon">💅</div>
              <div>
                <p className="float-title">Master Tech</p>
                <p className="float-sub">@auricc_nails</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          padding: 160px 0 100px 0;
          overflow: hidden;
          background: radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 60%);
        }
        .hero-bg-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }
        .hero-badge {
          margin-bottom: 24px;
        }
        .hero-title {
          font-family: var(--font-serif);
          font-size: 3.8rem;
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
        .hero-desc {
          color: var(--text-muted);
          font-size: 1.15rem;
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 580px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          border-top: 1px solid var(--glass-border);
          padding-top: 28px;
        }
        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .stat-val {
          font-family: var(--font-sans);
          font-size: 1.1rem;
          font-weight: 700;
          color: #FFF;
        }
        .stat-label {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .hero-visual {
          position: relative;
        }
        .hero-image-frame {
          position: relative;
          border-radius: 24px;
          padding: 12px;
          background: rgba(18, 18, 26, 0.8);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
        }
        .hero-img {
          width: 100%;
          height: 480px;
          object-fit: cover;
          border-radius: 18px;
          display: block;
        }
        .image-overlay-glow {
          position: absolute;
          inset: 12px;
          border-radius: 18px;
          box-shadow: inset 0 0 30px rgba(212, 175, 55, 0.2);
          pointer-events: none;
        }
        .floating-card {
          position: absolute;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          background: rgba(18, 18, 26, 0.9);
          box-shadow: 0 15px 30px rgba(0,0,0,0.6);
        }
        .float-1 {
          bottom: 24px;
          left: -20px;
        }
        .float-2 {
          top: 30px;
          right: -20px;
        }
        .float-icon {
          font-size: 1.4rem;
        }
        .float-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: #FFF;
        }
        .float-sub {
          font-size: 0.75rem;
          color: var(--gold-light);
        }

        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .hero-title {
            font-size: 3rem;
          }
          .hero-desc {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-stats-grid {
            text-align: left;
          }
          .float-1, .float-2 {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .hero-title {
            font-size: 2.3rem;
          }
          .hero-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}

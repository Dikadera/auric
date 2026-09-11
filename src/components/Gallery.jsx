import React, { useState } from 'react';
import { Camera, Heart, Sparkles, ArrowRight, Instagram } from 'lucide-react';
import { GALLERY_LOOKS } from '../data/servicesData';

export default function Gallery({ onBookLook }) {
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'Chrome', '3D Art', 'Charms', 'Minimalist'];

  const filteredLooks = activeTab === 'All'
    ? GALLERY_LOOKS
    : GALLERY_LOOKS.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="section-header">
          <div className="badge-gold">
            <Camera size={14} />
            <span>@AURICC_NAILS INSTAGRAM PORTFOLIO</span>
          </div>
          <h2>Editorial Lookbook Showcase</h2>
          <p>Explore recent bespoke sets crafted at Auric Studio. Tap "Book This Look" to transfer the exact design tier to your appointment booking.</p>

          {/* Category Tabs */}
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredLooks.map((look) => (
            <div key={look.id} className="look-card glass-card">
              <div className="look-img-wrapper">
                <img src={look.image} alt={look.title} className="look-img" />
                <div className="look-overlay">
                  <div className="look-likes">
                    <Heart size={16} fill="#D4AF37" color="#D4AF37" />
                    <span>{look.likes}</span>
                  </div>

                  <button onClick={() => onBookLook(look)} className="btn-gold book-look-btn">
                    <Sparkles size={14} /> Book This Look
                  </button>
                </div>
              </div>

              <div className="look-details">
                <div className="look-tags">
                  {look.tags.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
                <h3>{look.title}</h3>
                <div className="look-meta">
                  <span>Shape: <strong>{look.shape}</strong></span>
                  <span>Art Tier: <strong>{look.tier}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="gallery-footer-cta">
          <a
            href="https://instagram.com/auricc_nails"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline insta-big-btn"
          >
            <Instagram size={18} />
            <span>Follow @auricc_nails on Instagram for daily inspiration</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>

      <style>{`
        .gallery-section {
          padding: 100px 0;
          background: #09090D;
        }
        .category-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
          flex-wrap: wrap;
        }
        .tab-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 8px 20px;
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .tab-btn:hover {
          color: #FFF;
          border-color: var(--gold-primary);
        }
        .tab-btn.active {
          background: var(--gold-gradient);
          color: #000;
          border-color: transparent;
          font-weight: 700;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }
        .look-card {
          border-radius: 20px;
          overflow: hidden;
          transition: var(--transition);
        }
        .look-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--gold-glow);
        }
        .look-img-wrapper {
          position: relative;
          height: 320px;
          overflow: hidden;
        }
        .look-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .look-card:hover .look-img {
          transform: scale(1.08);
        }
        .look-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(9, 9, 13, 0.9) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .look-card:hover .look-overlay {
          opacity: 1;
        }
        .look-likes {
          align-self: flex-end;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #FFF;
          font-weight: 700;
        }
        .book-look-btn {
          width: 100%;
          justify-content: center;
          padding: 12px;
        }
        .look-details {
          padding: 20px;
        }
        .look-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .tag-pill {
          font-size: 0.7rem;
          color: var(--gold-light);
          background: rgba(212, 175, 55, 0.1);
          padding: 2px 8px;
          border-radius: 8px;
        }
        .look-details h3 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #FFF;
          margin-bottom: 8px;
        }
        .look-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          border-top: 1px solid var(--glass-border);
          padding-top: 8px;
        }
        .look-meta strong {
          color: #FFF;
        }
        .gallery-footer-cta {
          display: flex;
          justify-content: center;
        }
        .insta-big-btn {
          padding: 16px 32px;
          font-size: 1rem;
        }
      `}</style>
    </section>
  );
}

import React, { useState } from 'react';
import { Shield, ChevronDown, Star, MessageSquareQuote } from 'lucide-react';
import { POLICIES, REVIEWS } from '../data/servicesData';

export default function Policies() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="policies" className="policies-section">
      <div className="container">
        <div className="policies-grid">
          {/* Left Column: FAQ & Policies Accordion */}
          <div className="faq-col">
            <div className="badge-gold">
              <Shield size={14} />
              <span>STUDIO STANDARDS & FREQUENT QUESTIONS</span>
            </div>
            <h2>Booking Policies & Guidelines</h2>
            <p className="section-sub">
              To ensure a seamless, high-end experience for every client, please review our studio policies below before reserving.
            </p>

            <div className="accordion-list">
              {POLICIES.map((item, idx) => (
                <div
                  key={item.title}
                  className={`accordion-item glass-card ${openIndex === idx ? 'open' : ''}`}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                    className="accordion-header"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      size={18}
                      className={`chevron-icon ${openIndex === idx ? 'rotate' : ''}`}
                    />
                  </button>

                  {openIndex === idx && (
                    <div className="accordion-content">
                      <p>{item.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Client Reviews */}
          <div id="reviews" className="reviews-col">
            <div className="badge-gold">
              <MessageSquareQuote size={14} />
              <span>VERIFIED CLIENT REVIEWS</span>
            </div>
            <h2>What Clients Say</h2>
            <p className="section-sub">Real feedback from `@auricc_nails` clients.</p>

            <div className="reviews-stack">
              {REVIEWS.map((rev, i) => (
                <div key={i} className="review-card glass-card">
                  <div className="review-stars">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} size={16} fill="#D4AF37" color="#D4AF37" />
                    ))}
                  </div>

                  <p className="review-text">"{rev.text}"</p>

                  <div className="review-author">
                    <div>
                      <h4 className="author-name">{rev.name}</h4>
                      <span className="author-handle">{rev.handle}</span>
                    </div>
                    <span className="service-tag-chip">{rev.service}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .policies-section {
          padding: 100px 0;
          background: #0C0C12;
        }
        .policies-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        .section-sub {
          color: var(--text-muted);
          margin: 12px 0 30px 0;
          font-size: 1rem;
        }
        .accordion-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .accordion-item {
          border-radius: 16px;
          overflow: hidden;
          transition: var(--transition);
        }
        .accordion-header {
          width: 100%;
          padding: 20px 24px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFF;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          text-align: left;
        }
        .chevron-icon {
          color: var(--gold-light);
          transition: transform 0.3s ease;
        }
        .chevron-icon.rotate {
          transform: rotate(180deg);
        }
        .accordion-content {
          padding: 0 24px 20px 24px;
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.7;
          border-top: 1px dashed var(--glass-border);
          padding-top: 14px;
        }

        .reviews-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .review-card {
          padding: 24px;
          border-radius: 18px;
        }
        .review-stars {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }
        .review-text {
          font-size: 0.95rem;
          color: var(--text-main);
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .review-author {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--glass-border);
          padding-top: 12px;
        }
        .author-name {
          font-size: 0.9rem;
          color: #FFF;
        }
        .author-handle {
          font-size: 0.78rem;
          color: var(--gold-light);
        }
        .service-tag-chip {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: 12px;
        }

        @media (max-width: 992px) {
          .policies-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

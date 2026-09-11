import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, RefreshCw, Palette } from 'lucide-react';
import { NAIL_SHAPES } from '../data/servicesData';

export default function NailCustomizer({ onTransferToBooking }) {
  const [selectedShape, setSelectedShape] = useState('almond');
  const [selectedColor, setSelectedColor] = useState('#D4AF37');
  const [finishEffect, setFinishEffect] = useState('chrome');
  const [artOverlay, setArtOverlay] = useState('swirls');

  const colorOptions = [
    { id: '#D4AF37', name: 'Champagne Gold Chrome', bg: 'linear-gradient(135deg, #FFF0C2, #D4AF37, #997517)', type: 'chrome' },
    { id: '#121218', name: 'Obsidian Midnight Noir', bg: 'linear-gradient(135deg, #2C2C38, #121218, #050508)', type: 'dark' },
    { id: '#7A0C1B', name: 'Velvet Wine Crimson', bg: 'linear-gradient(135deg, #B52237, #7A0C1B, #3D000A)', type: 'rich' },
    { id: '#F7E5D0', name: 'Glazed Donut Pearl', bg: 'linear-gradient(135deg, #FFFFFF, #F7E5D0, #E0C7AA)', type: 'pearl' },
    { id: '#E4C7B5', name: 'Milky Nude Cream', bg: 'linear-gradient(135deg, #F3DCD0, #E4C7B5, #C69F8B)', type: 'nude' },
    { id: '#0B3C2A', name: 'Emerald Jewel Dust', bg: 'linear-gradient(135deg, #1C6B4D, #0B3C2A, #041B12)', type: 'rich' }
  ];

  const artOptions = [
    { id: 'swirls', name: '3D Gold Liquid Swirls', icon: '🌀' },
    { id: 'french', name: 'Micro Chrome French Tip', icon: '✨' },
    { id: 'gems', name: 'Swarovski Crystal Cluster', icon: '💎' },
    { id: 'drips', name: 'Metallic Chrome Drips', icon: '💧' },
    { id: 'none', name: 'Solid Minimalist High Shine', icon: '💅' }
  ];

  const handleReset = () => {
    setSelectedShape('almond');
    setSelectedColor('#D4AF37');
    setFinishEffect('chrome');
    setArtOverlay('swirls');
  };

  const handleBookThisDesign = () => {
    const selectedColorObj = colorOptions.find((c) => c.id === selectedColor);
    onTransferToBooking({
      shape: selectedShape,
      colorName: selectedColorObj?.name || 'Custom',
      artOverlay: artOptions.find((a) => a.id === artOverlay)?.name
    });
  };

  // Helper for dynamic nail tip shape path
  const getNailBorderRadius = (shape) => {
    switch (shape) {
      case 'almond': return '50% 50% 12px 12px / 75% 75% 12px 12px';
      case 'coffin': return '8px 8px 12px 12px / 4px 4px 12px 12px';
      case 'stiletto': return '50% 50% 12px 12px / 95% 95% 12px 12px';
      case 'square': return '4px 4px 12px 12px';
      case 'duck': return '30px 30px 12px 12px / 15px 15px 12px 12px';
      case 'oval': return '40% 40% 12px 12px / 60% 60% 12px 12px';
      default: return '50% 50% 12px 12px';
    }
  };

  return (
    <section id="customizer" className="customizer-section">
      <div className="container">
        <div className="section-header">
          <div className="badge-gold">
            <Palette size={14} />
            <span>AURIC VIRTUAL NAIL STUDIO</span>
          </div>
          <h2>Interactive Custom Set Designer</h2>
          <p>Customize your dream nail set shape, color, finish, and 3D art level before locking in your appointment.</p>
        </div>

        <div className="customizer-grid glass-card">
          {/* Controls Column */}
          <div className="controls-col">
            {/* 1. Shape Selection */}
            <div className="control-group">
              <label className="control-label">
                <span>1. Select Nail Silhouette / Shape</span>
              </label>
              <div className="shapes-mini-grid">
                {NAIL_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShape(s.id)}
                    className={`shape-btn ${selectedShape === s.id ? 'active' : ''}`}
                  >
                    <span className="shape-icon">{s.icon}</span>
                    <span className="shape-name">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Shade */}
            <div className="control-group">
              <label className="control-label">
                <span>2. Select Shade Palette</span>
                <span className="selected-tag">{colorOptions.find(c => c.id === selectedColor)?.name}</span>
              </label>
              <div className="colors-row">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`color-circle ${selectedColor === c.id ? 'active' : ''}`}
                    style={{ background: c.bg }}
                    title={c.name}
                  >
                    {selectedColor === c.id && <Check size={14} color="#000" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 3D Art Overlay */}
            <div className="control-group">
              <label className="control-label">
                <span>3. Select Art embellishment</span>
              </label>
              <div className="art-options-list">
                {artOptions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setArtOverlay(a.id)}
                    className={`art-btn ${artOverlay === a.id ? 'active' : ''}`}
                  >
                    <span>{a.icon} {a.name}</span>
                    {artOverlay === a.id && <Check size={16} color="#D4AF37" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="customizer-actions">
              <button onClick={handleReset} className="btn-outline reset-btn">
                <RefreshCw size={16} /> Reset
              </button>

              <button onClick={handleBookThisDesign} className="btn-gold transfer-btn">
                <span>Book This Custom Look</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Interactive Live Hand Canvas */}
          <div className="preview-col">
            <div className="preview-header">
              <span className="live-dot"></span> LIVE VISUAL PREVIEW
            </div>

            <div className="hand-canvas">
              <div className="hand-illustration">
                {/* 5 Nails Preview */}
                {[0, 1, 2, 3, 4].map((index) => {
                  const heights = [70, 95, 110, 95, 65];
                  const widths = [28, 32, 34, 32, 26];
                  const isAccent = index === 2 || index === 3;
                  return (
                    <div key={index} className="finger-container">
                      <div
                        className="nail-tip"
                        style={{
                          height: `${heights[index]}px`,
                          width: `${widths[index]}px`,
                          borderRadius: getNailBorderRadius(selectedShape),
                          background: colorOptions.find(c => c.id === selectedColor)?.bg,
                          boxShadow: selectedColor === '#D4AF37' ? '0 0 20px rgba(212,175,55,0.6)' : '0 8px 20px rgba(0,0,0,0.5)'
                        }}
                      >
                        {/* Metallic Gloss Reflection */}
                        <div className="nail-gloss"></div>

                        {/* Art Overlays */}
                        {artOverlay === 'swirls' && (
                          <div className="art-swirls-overlay">✨</div>
                        )}
                        {artOverlay === 'french' && (
                          <div className="art-french-tip"></div>
                        )}
                        {artOverlay === 'gems' && isAccent && (
                          <div className="art-gem-cluster">💎</div>
                        )}
                        {artOverlay === 'drips' && (
                          <div className="art-drips-overlay">💧</div>
                        )}
                      </div>
                      <div className="finger-skin"></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="preview-footer-info">
              <div className="info-chip">
                <span>Shape:</span> <strong>{selectedShape.toUpperCase()}</strong>
              </div>
              <div className="info-chip">
                <span>Art Level:</span> <strong>{artOverlay === 'none' ? 'Clean Girl' : 'Opulence'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .customizer-section {
          padding: 100px 0;
          background: #09090D;
          position: relative;
        }
        .customizer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 40px;
          border-radius: 24px;
        }
        .controls-col {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .control-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.95rem;
          font-weight: 700;
          color: #FFF;
        }
        .selected-tag {
          font-size: 0.8rem;
          color: var(--gold-light);
          font-weight: 500;
        }
        .shapes-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .shape-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-muted);
        }
        .shape-btn:hover {
          border-color: var(--gold-primary);
          color: #FFF;
          background: rgba(212, 175, 55, 0.05);
        }
        .shape-btn.active {
          background: rgba(212, 175, 55, 0.15);
          border-color: var(--gold-primary);
          color: var(--gold-light);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
        }
        .shape-icon {
          font-size: 1.2rem;
        }
        .shape-name {
          font-size: 0.78rem;
          font-weight: 600;
        }
        .colors-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .color-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        }
        .color-circle:hover {
          transform: scale(1.1);
        }
        .color-circle.active {
          border-color: #FFF;
          transform: scale(1.15);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }
        .art-options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .art-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-muted);
          font-size: 0.88rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .art-btn:hover {
          border-color: var(--gold-primary);
          color: #FFF;
        }
        .art-btn.active {
          background: rgba(212, 175, 55, 0.1);
          border-color: var(--gold-primary);
          color: #FFF;
        }
        .customizer-actions {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }
        .transfer-btn {
          flex: 1;
          justify-content: center;
        }
        .preview-col {
          background: rgba(10, 10, 15, 0.7);
          border-radius: 18px;
          border: 1px solid var(--glass-border);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          color: var(--gold-light);
          font-weight: 700;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D4AF37;
          box-shadow: 0 0 10px #D4AF37;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .hand-canvas {
          margin: 40px 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 240px;
        }
        .hand-illustration {
          display: flex;
          align-items: flex-end;
          gap: 16px;
        }
        .finger-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .nail-tip {
          position: relative;
          transition: var(--transition);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nail-gloss {
          position: absolute;
          top: 0;
          left: 15%;
          width: 25%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.6), transparent);
          border-radius: 20px;
          pointer-events: none;
        }
        .art-swirls-overlay {
          font-size: 0.9rem;
          filter: drop-shadow(0 0 4px #FFF);
        }
        .art-french-tip {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 30%;
          background: linear-gradient(135deg, #FFF, #D4AF37);
          border-radius: inherit;
        }
        .art-drips-overlay {
          font-size: 0.8rem;
        }
        .art-gem-cluster {
          font-size: 0.9rem;
        }
        .finger-skin {
          width: 100%;
          height: 120px;
          background: linear-gradient(180deg, #D4A59A, #9E6B60);
          border-radius: 12px 12px 0 0;
          margin-top: -6px;
        }
        .preview-footer-info {
          display: flex;
          gap: 20px;
          background: rgba(255, 255, 255, 0.03);
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        @media (max-width: 992px) {
          .customizer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

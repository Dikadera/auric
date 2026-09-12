import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import PinkMistCanvas from './PinkMistCanvas';

const LOADING_PHRASES = [
  'Preparing Bespoke Experience…',
  'Syncing Custom Sets & Options…',
  'Initializing Auric Studio…'
];

export default function Preloader({ message, fullScreen = true }) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: fullScreen ? 'fixed' : 'relative',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      minHeight: fullScreen ? '100vh' : '400px',
      background: 'radial-gradient(circle at 50% 40%, #1F0516 0%, #0C0109 60%, #050004 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#FFFFFF'
    }}>
      {/* Background Falling Pink Mist */}
      <PinkMistCanvas />

      {/* Ambient Radial Background Glow */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(236,72,153,0.1) 40%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        maxWidth: '380px',
        width: '90%',
        padding: '20px'
      }}>
        {/* ── 1. THE GOLDEN ROLLER ────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {/* Outer Roller Orbit Track */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)'
          }} />

          {/* Traveling Liquid Gold Roller Bead */}
          <div style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#D4AF37',
            borderRightColor: '#EC4899',
            animation: 'auricRollerSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)'
          }} />

          {/* Inner Glowing Core Sparkle */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(212,175,55,0.25) 100%)',
            border: '1px solid rgba(212,175,55,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'auricPulseCore 1.6s ease-in-out infinite alternate'
          }}>
            <Sparkles size={22} color="#D4AF37" />
          </div>
        </div>

        {/* ── 2. TYPOGRAPHY ─────────────────────────────────────────────────── */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '10px',
          margin: 0,
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F59E0B 60%, #EC4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingLeft: '10px' // Offset letterSpacing
        }}>
          AURIC
        </h1>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '7px',
          color: 'rgba(212, 175, 55, 0.9)',
          marginTop: '6px',
          marginBottom: '20px',
          textTransform: 'uppercase',
          paddingLeft: '7px'
        }}>
          BESPOKE NAILS
        </span>

        {/* ── 3. THE "LINE AURIC" SWEEPING LIQUID GOLD LINE ──────────────────── */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '280px',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          {/* Sweeping Laser Beam Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '40%',
            background: 'linear-gradient(90deg, transparent 0%, #EC4899 30%, #FFD700 70%, transparent 100%)',
            boxShadow: '0 0 10px #FFD700, 0 0 20px #EC4899',
            animation: 'auricLineSweep 1.6s ease-in-out infinite'
          }} />
        </div>

        {/* ── 4. CAPTION STATUS TEXT ────────────────────────────────────────── */}
        <p style={{
          fontSize: '0.82rem',
          color: 'rgba(255, 255, 255, 0.75)',
          fontWeight: 500,
          letterSpacing: '0.5px',
          margin: 0,
          minHeight: '20px',
          transition: 'all 0.3s ease'
        }}>
          {message || LOADING_PHRASES[phraseIdx]}
        </p>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes auricRollerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes auricPulseCore {
          0% { transform: scale(0.92); opacity: 0.8; }
          100% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes auricLineSweep {
          0% { left: -40%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

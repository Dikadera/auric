import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Sparkles } from 'lucide-react';

// Royalty-free luxury ambient spa & lounge audio tracks
const AMBIENT_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.35); // Gentle ambient volume
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(AMBIENT_AUDIO_URL);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Handle user interaction to satisfy browser autoplay policy
    const handleFirstUserInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        // Attempt autoplay on first user click/tap
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Autoplay blocked by browser until manual button toggle:", err);
        });
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      audio.pause();
    };
  }, []);

  // Sync volume & mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {/* Floating Music Button */}
      <button
        onClick={togglePlay}
        aria-label="Toggle Luxury Ambient Music"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: isPlaying
            ? 'linear-gradient(135deg, #EC4899 0%, #D4AF37 100%)'
            : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isPlaying ? '1px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isPlaying
            ? '0 8px 25px rgba(236, 72, 153, 0.4), 0 0 15px rgba(212, 175, 55, 0.4)'
            : '0 4px 15px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}
      >
        {isPlaying ? (
          /* Animated Equalizer Sound Bars */
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '16px' }}>
            <span style={{ width: '3px', height: '100%', background: '#FFF', borderRadius: '2px', animation: 'eqBar 0.6s ease-in-out infinite alternate' }} />
            <span style={{ width: '3px', height: '60%', background: '#FFF', borderRadius: '2px', animation: 'eqBar 0.8s ease-in-out infinite alternate 0.2s' }} />
            <span style={{ width: '3px', height: '80%', background: '#FFF', borderRadius: '2px', animation: 'eqBar 0.5s ease-in-out infinite alternate 0.4s' }} />
          </div>
        ) : (
          <Music size={20} color="rgba(255, 255, 255, 0.85)" />
        )}
      </button>

      {/* Expandable Player Controls / Label on Hover or Active */}
      {(showTooltip || isPlaying) && (
        <div style={{
          background: 'rgba(15, 14, 23, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFF', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} color="#D4AF37" /> Auric Lounge Ambient
            </span>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              {isPlaying ? 'Playing Ambient Track' : 'Click to Play Audio'}
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              background: 'none',
              border: 'none',
              color: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 2
            }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes eqBar {
          0% { height: 30%; }
          100% { height: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Sparkles, SkipForward, ChevronUp, Check } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export const AMBIENT_TRACKS = [
  {
    id: 'track-1',
    name: 'Crystal Wave Zen',
    genre: 'Ultra Soft Meditation Pad',
    url: '/audio/ambient1.mp3'
  },
  {
    id: 'track-2',
    name: 'Tranquility Spa',
    genre: 'Soft Physical Therapy Pad',
    url: '/audio/ambient2.mp3'
  },
  {
    id: 'track-3',
    name: 'Peaceful Meditation',
    genre: 'Gentle Pure Spa Ambient',
    url: '/audio/ambient3.mp3'
  }
];

export default function BackgroundMusic() {
  const [musicConfig, setMusicConfig] = useState({ musicEnabled: true });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume] = useState(0.35);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);

  const audioRef = useRef(null);

  // Subscribe to real-time Admin toggle settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'studioConfig'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMusicConfig({ musicEnabled: data.musicEnabled !== false });
      }
    }, (err) => {
      console.warn("Music config snapshot notice:", err);
    });

    return () => unsub();
  }, []);

  const currentTrack = AMBIENT_TRACKS[currentTrackIndex];

  // Pause audio immediately if Admin turns off music globally
  useEffect(() => {
    if (musicConfig.musicEnabled === false) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [musicConfig.musicEnabled]);

  // Handle track source switching & lifecycle
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(currentTrack.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;
    } else {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : volume;
      if (wasPlaying && musicConfig.musicEnabled !== false) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.warn("Track play notice:", err);
        });
      }
    }

    const handleFirstUserInteraction = () => {
      if (!hasInteracted && musicConfig.musicEnabled !== false) {
        setHasInteracted(true);
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn("Autoplay notice:", err);
          });
        }
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [currentTrackIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync volume & mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current || musicConfig.musicEnabled === false) return;
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

  const selectTrack = (idx, e) => {
    if (e) e.stopPropagation();
    setCurrentTrackIndex(idx);
    setShowTrackList(false);
    if (!isPlaying && audioRef.current && musicConfig.musicEnabled !== false) {
      // Start playing selected track immediately
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 50);
    }
  };

  const handleNextTrack = (e) => {
    e.stopPropagation();
    const nextIdx = (currentTrackIndex + 1) % AMBIENT_TRACKS.length;
    selectTrack(nextIdx, e);
  };

  // If Admin explicitly disabled music, hide the music widget entirely
  if (musicConfig.musicEnabled === false) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => {
        setShowTooltip(false);
        setShowTrackList(false);
      }}
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
      {/* Floating Music Toggle Button */}
      <button
        onClick={togglePlay}
        aria-label="Toggle Luxury Ambient Music"
        title="Toggle Ambient Audio"
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

      {/* Expandable Player Controls / Track Selector Bar */}
      {(showTooltip || isPlaying || showTrackList) && (
        <div style={{
          position: 'relative',
          background: 'rgba(15, 14, 23, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Current Track Info (Click to open playlist dropdown) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowTrackList(!showTrackList);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '145px',
              cursor: 'pointer'
            }}
            title="Click to view all 3 ambient tracks"
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFF', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Sparkles size={11} color="#D4AF37" /> {currentTrack.name}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.65)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {isPlaying ? currentTrack.genre : 'Click play to start audio'} <ChevronUp size={10} style={{ transform: showTrackList ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Skip to Next Track Button */}
            <button
              onClick={handleNextTrack}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                color: '#FFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={`Next Track (${currentTrackIndex + 1}/3): ${currentTrack.name}`}
            >
              <SkipForward size={13} />
            </button>

            {/* Mute Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          {/* Interactive Playlist Dropdown Menu (Lists all 3 tracks) */}
          {showTrackList && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '10px',
              width: '220px',
              background: 'rgba(20, 18, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'slideUp 0.2s ease'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Ambient Track (3 Available)
              </div>
              {AMBIENT_TRACKS.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <button
                    key={track.id}
                    onClick={(e) => selectTrack(idx, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                      border: isSelected ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                      color: isSelected ? '#F472B6' : '#E2E8F0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500 }}>
                        {idx + 1}. {track.name}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: isSelected ? 'rgba(244, 114, 182, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}>
                        {track.genre}
                      </span>
                    </div>
                    {isSelected && <Check size={14} color="#F472B6" />}
                  </button>
                );
              })}
            </div>
          )}
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

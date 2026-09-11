import React, { useEffect, useRef } from 'react';

export default function PinkMistCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles & Mist Clouds
    const PARTICLE_COUNT = 75;
    const particles = [];

    const colors = [
      { r: 244, g: 114, b: 182 }, // Soft Pink
      { r: 236, g: 72,  b: 153 }, // Deep Rose Pink
      { r: 251, g: 113, b: 133 }, // Coral Pink
      { r: 212, g: 175, b: 55  }, // Liquid Gold Highlight
      { r: 248, g: 187, b: 208 }  // Blush Pink
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 50 + 6, // Mix of large mist clouds & fine particles
        speedY: Math.random() * 0.75 + 0.2, // Smooth downward drift
        speedX: Math.random() * 0.4 - 0.2, // Gentle horizontal oscillation
        wobbleFreq: Math.random() * 0.02 + 0.005,
        wobbleAmp: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.phase += p.wobbleFreq;
        p.x += Math.sin(p.phase) * p.wobbleAmp * 0.3 + p.speedX;
        p.y += p.speedY;

        // Reset particle to top when it falls past the bottom
        if (p.y - p.radius > height) {
          p.y = -p.radius * 2;
          p.x = Math.random() * width;
        }
        if (p.x < -p.radius * 2) p.x = width + p.radius;
        if (p.x > width + p.radius * 2) p.x = -p.radius;

        // Draw Soft Glowing Gradient Particle
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius
        );
        gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`);
        gradient.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9
      }}
    />
  );
}

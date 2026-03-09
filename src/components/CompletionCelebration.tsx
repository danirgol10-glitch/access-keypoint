import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
}

interface CompletionCelebrationProps {
  trigger: boolean;
  onFinished?: () => void;
}

function getCelebrationColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  return [
    style.getPropertyValue('--celebration-1').trim() || '#4FA3FF',
    style.getPropertyValue('--celebration-2').trim() || '#1E5BFF',
    style.getPropertyValue('--celebration-3').trim() || '#FFD23F',
    style.getPropertyValue('--celebration-4').trim() || '#FFE680',
    style.getPropertyValue('--celebration-5').trim() || '#2B7FFF',
  ];
}

const PARTICLE_COUNT = 40;
const DURATION = 1500;

export const CompletionCelebration = ({ trigger, onFinished }: CompletionCelebrationProps) => {
  const [showFlash, setShowFlash] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const { t } = useLanguage();

  const createParticles = useCallback((): Particle[] => {
    const colors = getCelebrationColors();
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      return {
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        life: 1,
      };
    });
  }, []);

  useEffect(() => {
    if (!trigger) return;

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 400);
    setTimeout(() => setShowMessage(true), 600);
    setTimeout(() => {
      setShowMessage(false);
      onFinished?.();
    }, 3500);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    let parts = createParticles();
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > DURATION) {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        return;
      }

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const progress = elapsed / DURATION;

      parts = parts.map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy + 0.1,
        vy: p.vy + 0.05,
        opacity: Math.max(0, 1 - progress * 1.2),
        life: 1 - progress,
      }));

      parts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [trigger, createParticles, onFinished]);

  if (!trigger) return null;

  const celebrationLine = getComputedStyle(document.documentElement).getPropertyValue('--celebration-line').trim() || '#FFD23F';

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {showFlash && (
        <div className="absolute inset-0 animate-[celebration-flash_0.4s_ease-out_forwards]" />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {showMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-[fade-in_0.5s_ease-out]">
          <h2 className="text-3xl font-black text-white tracking-wide mb-1">
            {t('celebration.title')}
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ background: celebrationLine }} />
          <p className="text-sm font-medium text-white/60 tracking-widest uppercase">
            {t('celebration.subtitle')}
          </p>
        </div>
      )}
    </div>
  );
};

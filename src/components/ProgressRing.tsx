import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressRingProps {
  percent: number;
  ownedCount: number;
  totalStickers: number;
  onComplete?: () => void;
}

const RADIUS = 100;
const STROKE = 22;
const CENTER = RADIUS + STROKE;
const SIZE = CENTER * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIMATION_DURATION = 900;

export const ProgressRing = ({ percent, ownedCount, totalStickers, onComplete }: ProgressRingProps) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const hasCompletedRef = useRef(false);
  const rafRef = useRef<number>();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isWC2026 = theme === 'world-cup-2026';

  useEffect(() => {
    const startTime = performance.now();
    const targetPercent = Math.min(percent, 100);
    const targetCount = ownedCount;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedPercent(eased * targetPercent);
      setDisplayCount(Math.round(eased * targetCount));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedPercent(targetPercent);
        setDisplayCount(targetCount);
        if (targetPercent >= 100 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete?.();
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [percent, ownedCount, onComplete]);

  const offset = CIRCUMFERENCE - (animatedPercent / 100) * CIRCUMFERENCE;
  const isComplete = animatedPercent >= 100;

  const tickAngle = -90;
  const tickRad = (tickAngle * Math.PI) / 180;
  const tickX = CENTER + (RADIUS) * Math.cos(tickRad);
  const tickY = CENTER + (RADIUS) * Math.sin(tickRad);

  const style = getComputedStyle(document.documentElement);
  const ringTrack = style.getPropertyValue('--ring-track').trim() || '#E5E5E5';
  const ringFill = style.getPropertyValue('--ring-fill').trim() || '#00B5E2';
  const ringGlowColor = style.getPropertyValue('--ring-glow-color').trim() || 'rgba(0,181,226,0.15)';
  const ringMarker = style.getPropertyValue('--ring-marker').trim() || '#F15A29';
  const ringComplete = style.getPropertyValue('--ring-complete').trim() || '#8CC63F';
  const accentHighlight = style.getPropertyValue('--accent-highlight').trim() || '#00B5E2';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="drop-shadow-lg">
        <defs>
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={ringFill} floodOpacity="0.25" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {isWC2026 && (
            <linearGradient id="ring-multicolor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B5E2" />
              <stop offset="25%" stopColor="#F15A29" />
              <stop offset="50%" stopColor="#8CC63F" />
              <stop offset="75%" stopColor="#FFD23F" />
              <stop offset="100%" stopColor="#6A5ACD" />
            </linearGradient>
          )}
        </defs>

        <circle
          cx={CENTER} cy={CENTER}
          r={RADIUS + STROKE / 2 + 3}
          fill="none"
          stroke={accentHighlight}
          strokeWidth={1.5}
          opacity={0.4}
        />

        <circle
          cx={CENTER} cy={CENTER} r={RADIUS}
          fill="none" stroke={ringTrack}
          strokeWidth={STROKE} opacity={0.6}
        />

        <circle
          cx={CENTER} cy={CENTER} r={RADIUS}
          fill="none"
          stroke={isWC2026 ? 'url(#ring-multicolor)' : ringFill}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          filter="url(#ring-glow)"
          className={isComplete ? 'animate-[ring-pulse_1.5s_ease-in-out]' : ''}
          style={{ transition: 'none' }}
        />

        {isComplete && (
          <circle
            cx={CENTER} cy={CENTER}
            r={RADIUS + STROKE / 2 + 3}
            fill="none" stroke={ringComplete}
            strokeWidth={2} opacity={0.7}
          />
        )}

        {!isComplete && (
          <circle cx={tickX} cy={tickY} r={3.5} fill={ringMarker} opacity={0.8} />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[3.5rem] font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
          {animatedPercent.toFixed(1)}%
        </span>
        <div className="w-10 h-[2px] opacity-50 mt-2.5 mb-2 rounded-full" style={{ background: accentHighlight }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>
          {t('home.roadTo100')}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--text-hint)' }}>
          {t('home.stickersCount', { count: displayCount, total: totalStickers })}
        </span>
      </div>
    </div>
  );
};

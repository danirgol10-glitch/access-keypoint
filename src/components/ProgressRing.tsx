import { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    const startTime = performance.now();
    const targetPercent = Math.min(percent, 100);
    const targetCount = ownedCount;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      // ease-out cubic
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

  // Golden tick mark position at 100% (top of circle, which is the start)
  const tickAngle = -90; // top
  const tickRad = (tickAngle * Math.PI) / 180;
  const tickX = CENTER + (RADIUS) * Math.cos(tickRad);
  const tickY = CENTER + (RADIUS) * Math.sin(tickRad);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="drop-shadow-lg">
        <defs>
          {/* Glow filter for active segment */}
          <filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#4FA3FF" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gold glow for complete state */}
          <filter id="gold-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#FFD23F" floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base ring - deep blue */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#123E8C"
          strokeWidth={STROKE}
          opacity={0.6}
        />

        {/* Active ring - electric blue with glow */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={isComplete ? '#4FA3FF' : '#4FA3FF'}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          filter="url(#ring-glow)"
          className={isComplete ? 'animate-[ring-pulse_1.5s_ease-in-out]' : ''}
          style={{ transition: 'none' }}
        />

        {/* Gold outline for complete state */}
        {isComplete && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + STROKE / 2 + 2}
            fill="none"
            stroke="#FFD23F"
            strokeWidth={1.5}
            opacity={0.6}
            filter="url(#gold-glow)"
          />
        )}

        {/* Golden tick mark at 100% position */}
        {!isComplete && (
          <circle
            cx={tickX}
            cy={tickY}
            r={3.5}
            fill="#FFD23F"
            opacity={0.8}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[3.5rem] font-black text-white tracking-tight leading-none">
          {animatedPercent.toFixed(1)}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mt-2">
          Road to 100%
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mt-1">
          {displayCount} / {totalStickers} stickers
        </span>
      </div>
    </div>
  );
};

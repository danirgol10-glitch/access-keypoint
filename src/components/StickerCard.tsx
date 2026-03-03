import { Check } from 'lucide-react';
import type { ComputedStatus } from '@/hooks/useUserStickers';
import { useLanguage } from '@/contexts/LanguageContext';

interface StickerCardProps {
  code: string;
  teamName?: string | null;
  status: ComputedStatus;
  onClick: () => void;
}

const statusStyles: Record<ComputedStatus, { bg: string; color: string }> = {
  HAVE: { bg: 'rgba(212,175,55,0.20)', color: '#D4AF37' },
  NEED: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' },
  DUPLICATE: { bg: 'rgba(79,163,255,0.15)', color: 'hsl(222, 100%, 65%)' },
};

const cardStyles: Record<ComputedStatus, { background: string; border: string }> = {
  HAVE: { background: 'rgba(212,175,55,0.12)', border: '1px solid #D4AF37' },
  NEED: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' },
  DUPLICATE: { background: 'rgba(79,163,255,0.08)', border: '1px solid rgba(79,163,255,0.30)' },
};

const statusLabelKeys: Record<ComputedStatus, string> = {
  HAVE: 'sticker.have',
  NEED: 'sticker.need',
  DUPLICATE: 'sticker.duplicate',
};

export function StickerCard({ code, teamName, status, onClick }: StickerCardProps) {
  const { t } = useLanguage();
  const style = statusStyles[status];
  const card = cardStyles[status];
  const isOwned = status === 'HAVE' || status === 'DUPLICATE';

  return (
    <button
      onClick={onClick}
      className="relative aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center transition-colors duration-150 active:scale-[0.96] focus:outline-none"
      style={{ background: card.background, border: card.border }}
    >
      {isOwned && (
        <Check
          className="absolute top-1.5 right-1.5"
          size={12}
          strokeWidth={3}
          style={{ color: status === 'HAVE' ? '#D4AF37' : '#4FA3FF' }}
        />
      )}
      <span className="font-semibold text-sm" style={{ color: status === 'HAVE' ? '#FFD86B' : isOwned ? '#CFE3FF' : '#FFFFFF' }}>{code}</span>
      {teamName && (
        <span className="text-[10px] mt-1 truncate w-full" style={{ color: status === 'HAVE' ? 'rgba(255,216,107,0.50)' : isOwned ? 'rgba(207,227,255,0.55)' : 'rgba(255,255,255,0.45)' }}>
          {teamName}
        </span>
      )}
      <span
        className="mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
        style={{ background: style.bg, color: style.color }}
      >
        {t(statusLabelKeys[status])}
      </span>
    </button>
  );
}

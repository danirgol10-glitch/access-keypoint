import { Check } from 'lucide-react';
import type { ComputedStatus } from '@/hooks/useUserStickers';
import { useLanguage } from '@/contexts/LanguageContext';

interface StickerCardProps {
  code: string;
  teamName?: string | null;
  status: ComputedStatus;
  onClick: () => void;
}

const statusLabelKeys: Record<ComputedStatus, string> = {
  HAVE: 'sticker.have',
  NEED: 'sticker.need',
  DUPLICATE: 'sticker.duplicate',
};

export function StickerCard({ code, teamName, status, onClick }: StickerCardProps) {
  const { t } = useLanguage();
  const isOwned = status === 'HAVE' || status === 'DUPLICATE';

  const getCardStyle = () => {
    if (status === 'HAVE') return { background: 'var(--sticker-owned-bg)', border: `1px solid var(--sticker-owned-border)` };
    if (status === 'DUPLICATE') return { background: 'var(--sticker-duplicate-bg)', border: `1px solid var(--sticker-duplicate-border)` };
    return { background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' };
  };

  const getBadgeStyle = () => {
    if (status === 'HAVE') return { background: 'var(--sticker-owned-badge-bg)', color: 'var(--sticker-owned-color)' };
    if (status === 'DUPLICATE') return { background: 'var(--sticker-duplicate-badge-bg)', color: 'var(--sticker-duplicate-color)' };
    return { background: 'var(--surface-input)', color: 'var(--text-secondary)' };
  };

  const getTextColor = () => {
    if (status === 'HAVE') return 'var(--sticker-owned-text)';
    if (status === 'DUPLICATE') return 'var(--sticker-duplicate-text)';
    return 'var(--text-primary)';
  };

  const getSubtextColor = () => {
    if (status === 'HAVE') return 'var(--sticker-owned-subtext)';
    if (status === 'DUPLICATE') return 'var(--sticker-duplicate-subtext)';
    return 'var(--text-muted)';
  };

  return (
    <button onClick={onClick}
      className="relative aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center transition-colors duration-150 active:scale-[0.96] focus:outline-none"
      style={getCardStyle()}>
      {isOwned && (
        <Check className="absolute top-1.5 right-1.5" size={12} strokeWidth={3}
          style={{ color: status === 'HAVE' ? 'var(--sticker-owned-color)' : 'var(--sticker-duplicate-color)' }} />
      )}
      <span className="font-semibold text-sm" style={{ color: getTextColor() }}>{code}</span>
      {teamName && <span className="text-[10px] mt-1 truncate w-full" style={{ color: getSubtextColor() }}>{teamName}</span>}
      <span className="mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={getBadgeStyle()}>{t(statusLabelKeys[status])}</span>
    </button>
  );
}

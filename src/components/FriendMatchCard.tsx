import { formatTimeAgoEs } from '@/lib/dateUtils';
import { User, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FriendMatchCardProps {
  username: string | null;
  matchCount: number;
  duplicateTotal?: number;
  lastActiveAt?: string | null;
  onView: () => void;
}

export function FriendMatchCard({ username, matchCount, duplicateTotal, lastActiveAt, onView }: FriendMatchCardProps) {
  const { t } = useLanguage();
  const activeLabel = lastActiveAt ? t('match.active', { time: formatTimeAgoEs(lastActiveAt) }) : null;

  return (
    <button onClick={onView}
      className="w-full flex items-center gap-3 p-3 rounded-[14px] text-left transition-all duration-150 active:scale-[0.98] active:opacity-80"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 avatar-themed">
        <div className="w-full h-full rounded-full flex items-center justify-center avatar-themed-inner">
          <User className="w-4 h-4" style={{ color: 'var(--icon-default)' }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] truncate" style={{ color: 'var(--text-primary)' }}>@{username ?? t('common.unknown')}</p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {matchCount > 0 ? t('match.hasStickers', { count: matchCount, s: matchCount !== 1 ? 's' : '' }) : t('match.noMatching')}
          {duplicateTotal !== undefined && duplicateTotal > 0 && <span> · {t('match.dupes', { count: duplicateTotal })}</span>}
        </p>
        {activeLabel && <p className="text-[11px]" style={{ color: 'var(--text-hint)' }}>{activeLabel}</p>}
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
    </button>
  );
}

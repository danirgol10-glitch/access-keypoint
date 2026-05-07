import { formatTimeAgoEs } from '@/lib/dateUtils';
import { User, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { ListRow } from '@/components/ui/list-row';

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
  const displayName = username ?? t('common.unknown');
  const initials = username?.slice(0, 2).toUpperCase();

  return (
    <ListRow
      interactive
      onClick={onView}
      leading={<AvatarCircle initials={initials} icon={<User className="h-4 w-4" />} size="md" />}
      title={`@${displayName}`}
      subtitle={
        <>
          {matchCount > 0 ? t('match.hasStickers', { count: matchCount, s: matchCount !== 1 ? 's' : '' }) : t('match.noMatching')}
          {duplicateTotal !== undefined && duplicateTotal > 0 && <span> · {t('match.dupes', { count: duplicateTotal })}</span>}
          {activeLabel && <span className="block text-[var(--text-hint)]">{activeLabel}</span>}
        </>
      }
      trailing={<ChevronRight className="h-4 w-4" />}
      className="bg-[var(--surface-card)]"
    />
  );
}

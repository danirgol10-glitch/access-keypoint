import { Check } from 'lucide-react';
import type { ComputedStatus } from '@/hooks/useUserStickers';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

const statusClasses: Record<ComputedStatus, { card: string; check: string; code: string; team: string; badge: string }> = {
  HAVE: {
    card: 'border-2 border-[var(--sticker-owned-border)] bg-[var(--sticker-owned-bg)] shadow-control',
    check: 'border-[var(--sticker-owned-border)] bg-[var(--sticker-owned-badge-bg)] text-[var(--sticker-owned-color)]',
    code: 'text-[var(--sticker-owned-text)]',
    team: 'text-[var(--sticker-owned-subtext)]',
    badge: 'border-[var(--sticker-owned-border)] bg-[var(--sticker-owned-badge-bg)] text-[var(--sticker-owned-color)]',
  },
  DUPLICATE: {
    card: 'border-2 border-[var(--sticker-duplicate-border)] bg-[var(--sticker-duplicate-bg)] shadow-control',
    check: 'border-[var(--sticker-duplicate-border)] bg-[var(--sticker-duplicate-badge-bg)] text-[var(--sticker-duplicate-color)]',
    code: 'text-[var(--sticker-duplicate-text)]',
    team: 'text-[var(--sticker-duplicate-subtext)]',
    badge: 'border-[var(--sticker-duplicate-border)] bg-[var(--sticker-duplicate-badge-bg)] text-[var(--sticker-duplicate-color)]',
  },
  NEED: {
    card: 'border border-[var(--surface-card-border)] bg-[var(--surface-card)] shadow-control',
    check: '',
    code: 'text-[var(--text-primary)]',
    team: 'text-[var(--text-muted)]',
    badge: 'border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--text-secondary)]',
  },
};

export function StickerCard({ code, teamName, status, onClick }: StickerCardProps) {
  const { t } = useLanguage();
  const isOwned = status === 'HAVE' || status === 'DUPLICATE';

  const classes = statusClasses[status];
  const statusLabel = t(statusLabelKeys[status]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${code}${teamName ? ` ${teamName}` : ''} ${statusLabel}`}
      className={cn(
        'tap-target pressable relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[14px] p-2.5 text-left outline-none transition-[background-color,border-color,box-shadow,transform,opacity] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
        classes.card,
      )}
    >
      <span className="pointer-events-none absolute inset-x-2 top-2 h-px rounded-full bg-white/20" />

      {isOwned && (
        <span className={cn('absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border', classes.check)}>
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}

      <span className={cn('w-full truncate pr-5 text-sm font-bold leading-tight', classes.code)}>{code}</span>
      <span
        className={cn('mt-1 line-clamp-2 min-h-0 w-full flex-1 overflow-hidden text-[10px] font-medium leading-tight', classes.team)}
      >
        {teamName ?? ''}
      </span>

      <span className={cn('mt-2 max-w-full shrink-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-4', classes.badge)}>
        {statusLabel}
      </span>
    </button>
  );
}

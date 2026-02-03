import { Badge } from '@/components/ui/badge';
import type { StickerStatus } from '@/hooks/useUserStickers';

interface StickerCardProps {
  code: string;
  team?: string | null;
  status: StickerStatus | null;
  onClick: () => void;
}

const statusConfig: Record<StickerStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  HAVE: { label: 'Have', variant: 'default' },
  NEED: { label: 'Need', variant: 'secondary' },
  DUPLICATE: { label: 'Duplicate', variant: 'outline' },
};

export function StickerCard({ code, team, status, onClick }: StickerCardProps) {
  const statusInfo = status ? statusConfig[status] : null;

  return (
    <button
      onClick={onClick}
      className="aspect-[3/4] rounded-lg border border-border bg-card p-2 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <span className="font-semibold text-foreground text-sm">{code}</span>
      {team && (
        <span className="text-xs text-muted-foreground mt-1 truncate w-full">
          {team}
        </span>
      )}
      <Badge
        variant={statusInfo?.variant ?? 'outline'}
        className="mt-2 text-[10px] px-1.5 py-0"
      >
        {statusInfo?.label ?? 'Unmarked'}
      </Badge>
    </button>
  );
}

import { Badge } from '@/components/ui/badge';
import type { ComputedStatus } from '@/hooks/useUserStickers';

interface StickerCardProps {
  code: string;
  teamName?: string | null;
  status: ComputedStatus;
  onClick: () => void;
}

const statusConfig: Record<ComputedStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  HAVE: { label: 'Have', variant: 'default' },
  NEED: { label: 'Need', variant: 'secondary' },
  DUPLICATE: { label: 'Duplicate', variant: 'outline' },
};

export function StickerCard({ code, teamName, status, onClick }: StickerCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className="aspect-[3/4] rounded-lg border border-border bg-card p-2 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <span className="font-semibold text-foreground text-sm">{code}</span>
      {teamName && (
        <span className="text-xs text-muted-foreground mt-1 truncate w-full">
          {teamName}
        </span>
      )}
      <Badge
        variant={statusInfo.variant}
        className="mt-2 text-[10px] px-1.5 py-0"
      >
        {statusInfo.label}
      </Badge>
    </button>
  );
}

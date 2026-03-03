import type { ComputedStatus } from '@/hooks/useUserStickers';

interface StickerCardProps {
  code: string;
  teamName?: string | null;
  status: ComputedStatus;
  onClick: () => void;
}

const statusConfig: Record<ComputedStatus, { label: string; bg: string; color: string }> = {
  HAVE: { label: 'Have', bg: 'rgba(34,197,94,0.15)', color: 'hsl(142, 72%, 55%)' },
  NEED: { label: 'Need', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' },
  DUPLICATE: { label: 'Dup', bg: 'rgba(79,163,255,0.15)', color: 'hsl(222, 100%, 65%)' },
};

export function StickerCard({ code, teamName, status, onClick }: StickerCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className="aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center transition-all duration-150 active:scale-[0.96] focus:outline-none"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{code}</span>
      {teamName && (
        <span className="text-[10px] mt-1 truncate w-full" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {teamName}
        </span>
      )}
      <span
        className="mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
        style={{ background: statusInfo.bg, color: statusInfo.color }}
      >
        {statusInfo.label}
      </span>
    </button>
  );
}

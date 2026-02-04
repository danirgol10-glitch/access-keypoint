import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import type { TradeRequest } from '@/hooks/useTradeRequests';

interface TradeRequestCardProps {
  request: TradeRequest;
  type: 'sent' | 'received';
  onClick: () => void;
}

const statusConfig: Record<
  TradeRequest['status'],
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  SENT: { label: 'Sent', variant: 'default' },
  ACCEPTED: { label: 'Accepted', variant: 'secondary' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'outline' },
};

export function TradeRequestCard({ request, type, onClick }: TradeRequestCardProps) {
  const statusInfo = statusConfig[request.status];
  const relativeTime = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground truncate">
              {type === 'sent' ? 'To' : 'From'}: @{request.other_user?.username ?? 'Unknown'}
            </span>
            <Badge variant={statusInfo.variant} className="text-xs">
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{request.item_count} sticker{request.item_count !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{relativeTime}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}

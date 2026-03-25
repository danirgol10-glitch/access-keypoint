import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRequest } from '@/hooks/useTradeRequests';

interface TradeRequestCardProps {
  request: TradeRequest;
  type: 'sent' | 'received';
  onClick: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  isUpdating?: boolean;
}

const statusVariants: Record<
  TradeRequest['status'],
  { labelKey: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  SENT: { labelKey: 'trade.statusPending', variant: 'default' },
  ACCEPTED: { labelKey: 'trade.statusAccepted', variant: 'secondary' },
  REJECTED: { labelKey: 'trade.statusRejected', variant: 'destructive' },
  CANCELLED: { labelKey: 'trade.statusCancelled', variant: 'outline' },
};

export function TradeRequestCard({
  request,
  type,
  onClick,
  onAccept,
  onReject,
  onCancel,
  isUpdating,
}: TradeRequestCardProps) {
  const { t } = useLanguage();
  const statusInfo = statusVariants[request.status];
  const relativeTime = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });
  const canAct = request.status === 'SENT';

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground truncate">
              {type === 'sent' ? t('trade.to') : t('trade.from')}: @{request.other_user?.username ?? t('common.unknown')}
            </span>
            <Badge variant={statusInfo.variant} className="text-xs">
              {t(statusInfo.labelKey)}
            </Badge>
          </div>
          {request.other_user?.city && (
            <div className="text-xs text-muted-foreground truncate">
              {request.other_user.city}{request.other_user.university_name ? ` • ${request.other_user.university_name}` : ''}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('trade.stickers', { count: request.item_count, s: request.item_count !== 1 ? 's' : '' })}</span>
            <span>•</span>
            <span>{relativeTime}</span>
          </div>
        </div>

        {canAct && (
          <div className="flex items-center gap-2 mr-2">
            {type === 'received' && onAccept && onReject && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => handleAction(e, onAccept)}
                  disabled={isUpdating}
                  className="h-8 px-3"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('trade.accept')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleAction(e, onReject)}
                  disabled={isUpdating}
                  className="h-8 px-3"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('trade.reject')}
                </Button>
              </>
            )}
            {type === 'sent' && onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleAction(e, onCancel)}
                disabled={isUpdating}
                className="h-8 px-3"
              >
                {t('trade.cancel')}
              </Button>
            )}
          </div>
        )}

        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}

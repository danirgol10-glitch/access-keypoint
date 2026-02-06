import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/hooks/useNotifications';
import { Bell, Check, X, Send, Ban } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const typeConfig = {
  TRADE_RECEIVED: { icon: Send, color: 'bg-blue-500' },
  TRADE_ACCEPTED: { icon: Check, color: 'bg-green-500' },
  TRADE_REJECTED: { icon: X, color: 'bg-red-500' },
  TRADE_CANCELLED: { icon: Ban, color: 'bg-muted-foreground' },
};

export const NotificationCard = ({ notification, onRead }: NotificationCardProps) => {
  const navigate = useNavigate();
  const isUnread = !notification.read_at;
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (isUnread) {
      onRead(notification.id);
    }
    if (notification.trade_request_id) {
      navigate(`/request/${notification.trade_request_id}`);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent ${isUnread ? 'border-primary/50 bg-primary/5' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className={`rounded-full p-2 ${config.color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isUnread ? 'font-medium' : 'text-muted-foreground'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {isUnread && (
          <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
        )}
      </CardContent>
    </Card>
  );
};

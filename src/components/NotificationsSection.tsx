import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/NotificationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const NotificationsSection = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, isMarkingAllAsRead } = useNotifications();
  const { t } = useLanguage();

  const handleRead = async (id: string) => {
    try { await markAsRead(id); } catch (error) { console.error('Failed to mark notification as read:', error); }
  };

  const handleMarkAllAsRead = async () => {
    try { await markAllAsRead(); } catch (error) { console.error('Failed to mark all notifications as read:', error); }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2"><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notif.title')}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={isMarkingAllAsRead} className="text-xs h-8">
              <CheckCheck className="h-4 w-4 mr-1" />
              {t('notif.markAllRead')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t('notif.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 10).map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onRead={handleRead} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

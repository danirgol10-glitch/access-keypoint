import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Image, Users, MessageSquare, User, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useConversations } from '@/hooks/useConversations';

const tabs = [
  { path: '/', label: 'Progress', icon: Home },
  { path: '/album', label: 'Album', icon: Image },
  { path: '/friends', label: 'Friends', icon: Users },
  { path: '/requests', label: 'Requests', icon: MessageSquare },
  { path: '/chats', label: 'Chats', icon: MessageCircle },
  { path: '/profile', label: 'Profile', icon: User },
];

const MainLayout = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { data: conversations = [] } = useConversations();
  const chatUnreadCount = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            const showBadge =
              (tab.path === '/profile' && unreadCount > 0) ||
              (tab.path === '/chats' && chatUnreadCount > 0);
            const badgeNum = tab.path === '/chats' ? chatUnreadCount : unreadCount;

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full transition-colors relative',
                  'hover:bg-muted/50'
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 mb-1 transition-colors',
                      isActive ? 'text-tab-active' : 'text-tab-inactive'
                    )}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                      {badgeNum > 99 ? '99+' : badgeNum}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isActive ? 'text-tab-active' : 'text-tab-inactive'
                  )}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;

import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Image, Handshake, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useConversations } from '@/hooks/useConversations';
import { useLastActive } from '@/hooks/useLastActive';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const tabConfig = [
  { path: '/', labelKey: 'nav.progress', icon: Home },
  { path: '/album', labelKey: 'nav.album', icon: Image },
  { path: '/trading', labelKey: 'nav.trading', icon: Handshake },
  { path: '/friends', labelKey: 'nav.friends', icon: Users },
];

const WC2026_TAB_COLORS = ['#00B5E2', '#8CC63F', '#F15A29', '#6A5ACD'];

const MainLayout = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { data: conversations = [] } = useConversations();
  const chatUnreadCount = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const tradingBadge = unreadCount + chatUnreadCount;
  const { touch } = useLastActive();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isWC2026 = theme === 'world-cup-2026';

  useEffect(() => {
    touch();
  }, [location.pathname, touch]);

  const isChatDetail = location.pathname.startsWith('/chat/');

  return (
    <div className="app-full-screen flex flex-col overflow-hidden page-bg">
      <main className={cn("flex-1 min-h-0 w-full max-w-full overflow-x-hidden", isChatDetail ? "overflow-hidden" : "overflow-y-auto")}>
        <Outlet />
      </main>

      <nav className="z-50 flex-shrink-0 safe-bottom" style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border-top)' }}>
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabConfig.map((tab, index) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            const showBadge = tab.path === '/trading' && tradingBadge > 0;
            const badgeNum = tradingBadge;

            const activeColor = isWC2026 ? WC2026_TAB_COLORS[index] : undefined;

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center w-full h-full transition-colors relative"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 mb-1 transition-colors',
                      !isWC2026 && (isActive ? 'text-tab-active' : 'text-tab-inactive')
                    )}
                    style={isWC2026 ? { color: isActive ? activeColor : '#999999' } : undefined}
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
                    !isWC2026 && (isActive ? 'text-tab-active' : 'text-tab-inactive')
                  )}
                  style={isWC2026 ? { color: isActive ? activeColor : '#999999' } : undefined}
                >
                  {t(tab.labelKey)}
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

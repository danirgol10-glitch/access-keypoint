import { useEffect, useRef } from 'react';
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
  const mainRef = useRef<HTMLElement | null>(null);
  const { unreadCount } = useNotifications();
  const { data: conversations = [] } = useConversations();
  const chatUnreadCount = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const tradingBadge = unreadCount + chatUnreadCount;
  const { touch } = useLastActive();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isWC2026 = theme === 'world-cup-2026';
  const isChatDetail = location.pathname.startsWith('/chat/');

  useEffect(() => {
    touch();
  }, [location.pathname, touch]);

  useEffect(() => {
    if (isChatDetail) return;
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [isChatDetail, location.pathname]);

  return (
    <div className="app-full-screen flex flex-col overflow-hidden page-bg">
      <main
        ref={mainRef}
        className={cn(
          "min-h-0 flex-1 w-full max-w-full overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]",
          isChatDetail ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        {isChatDetail ? (
          <Outlet />
        ) : (
          <div
            key={location.pathname}
            className="min-h-full w-full animate-in fade-in-0 slide-in-from-bottom-1 [animation-duration:var(--motion-duration-fast)] [animation-timing-function:var(--motion-ease-standard)] motion-reduce:animate-none"
          >
            <Outlet />
          </div>
        )}
      </main>

      <nav
        aria-label="Navegación principal"
        className="z-50 flex-shrink-0 safe-bottom border-t border-[var(--nav-border-top)] bg-[var(--nav-bg)] shadow-[0_-18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around gap-1 px-2">
          {tabConfig.map((tab, index) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            const showBadge = tab.path === '/trading' && tradingBadge > 0;
            const badgeNum = tradingBadge;

            const activeColor = isWC2026 ? WC2026_TAB_COLORS[index] : undefined;
            const tabColor = isWC2026
              ? isActive
                ? activeColor
                : 'rgba(247,250,252,0.58)'
              : undefined;

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  "tap-target pressable group relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xl)] px-1.5 py-1 text-center outline-none transition-[color,opacity,transform] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                  !isWC2026 && (isActive ? 'text-tab-active' : 'text-tab-inactive hover:text-[var(--text-secondary)]')
                )}
                style={isWC2026 ? { color: tabColor } : undefined}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1 h-0.5 w-5 rounded-full opacity-0 transition-[opacity,transform,background-color,box-shadow] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)]",
                    isActive && "scale-100 opacity-100",
                    !isWC2026 && "bg-primary shadow-[0_0_12px_rgba(53,208,127,0.45)]"
                  )}
                  style={isWC2026 && isActive ? { backgroundColor: activeColor, boxShadow: `0 0 12px ${activeColor}80` } : undefined}
                />

                <div
                  className={cn(
                    "relative mb-0.5 flex h-8 min-w-10 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,transform] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)]",
                    !isWC2026 &&
                      (isActive
                        ? 'border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] shadow-[0_8px_18px_rgba(53,208,127,0.12)]'
                        : 'border-transparent bg-transparent group-hover:border-[var(--surface-border)] group-hover:bg-[var(--surface-hover)]')
                  )}
                  style={
                    isWC2026 && isActive
                      ? {
                          backgroundColor: `${activeColor}24`,
                          borderColor: `${activeColor}66`,
                          boxShadow: `0 8px 18px ${activeColor}22`,
                        }
                      : undefined
                  }
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)]',
                      !isWC2026 && (isActive ? 'text-tab-active' : 'text-tab-inactive group-hover:text-[var(--text-secondary)]')
                    )}
                    style={isWC2026 ? { color: tabColor } : undefined}
                  />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white/60 bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground shadow-[0_5px_14px_rgba(0,0,0,0.38)] ring-2 ring-[var(--page-bg)]">
                      {badgeNum > 99 ? '99+' : badgeNum}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'max-w-full truncate text-[11px] font-semibold leading-none tracking-normal transition-colors [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)]',
                    !isWC2026 && (isActive ? 'text-tab-active' : 'text-tab-inactive group-hover:text-[var(--text-secondary)]')
                  )}
                  style={isWC2026 ? { color: tabColor } : undefined}
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

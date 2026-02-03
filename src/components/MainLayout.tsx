import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Image, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/album', label: 'Album', icon: Image },
  { path: '/requests', label: 'Requests', icon: MessageSquare },
  { path: '/profile', label: 'Profile', icon: User },
];

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content area */}
      <main className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full transition-colors',
                  'hover:bg-muted/50'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 mb-1 transition-colors',
                    isActive ? 'text-tab-active' : 'text-tab-inactive'
                  )}
                />
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

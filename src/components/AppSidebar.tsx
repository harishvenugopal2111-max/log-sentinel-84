import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  Shield,
  Settings,
  User,
  Activity,
  Bell,
  Zap,
  LogOut,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Monitor, label: 'System Monitor', path: '/system-monitor' },
  { icon: ScrollText, label: 'Logs', path: '/logs' },
  { icon: Activity, label: 'Anomalies', path: '/anomalies' },
  { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: Zap, label: 'Auto-Heal', path: '/auto-heal' },
];

const bottomItems = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <Shield className="h-7 w-7 text-primary" />
        <span className="text-lg font-bold text-foreground tracking-tight">
          Log Guardian
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary glow-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-4 space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        {/* User Info */}
        {user && (
          <div className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{user.email}</p>
                <div className="flex items-center gap-1">
                  {isAdmin && <Crown className="h-3 w-3 text-warning" />}
                  <p className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isAdmin ? "text-warning" : "text-muted-foreground"
                  )}>
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

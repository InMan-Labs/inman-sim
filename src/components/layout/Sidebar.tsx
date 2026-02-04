import { LayoutDashboard, Activity, BookOpen, FileText, Calendar } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Orchestration', path: '/orchestration', icon: Activity },
  { name: 'Runbooks', path: '/runbooks', icon: BookOpen },
  { name: 'Audit Logs', path: '/audit-logs', icon: FileText },
  { name: 'Scheduler', path: '/scheduler', icon: Calendar },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 border-r border-border bg-sidebar h-[calc(100vh-3.5rem)] flex flex-col">
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          InMan v2.4.1
        </div>
      </div>
    </aside>
  );
}

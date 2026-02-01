import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Environment } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { user, logout } = useAuth();
  const { currentEnvironment, setCurrentEnvironment, notifications, markNotificationRead } = useData();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markNotificationRead(notification.id);
    navigate(notification.link);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Left side - Organization */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">IM</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Acme Manufacturing</h1>
            <p className="text-xs text-muted-foreground">InMan Platform</p>
          </div>
        </div>

        {/* Environment Selector */}
        <Select
          value={currentEnvironment}
          onValueChange={(value) => setCurrentEnvironment(value as Environment)}
        >
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Production">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-status-error" />
                Production
              </div>
            </SelectItem>
            <SelectItem value="Staging">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-status-warning" />
                Staging
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right side - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 hover:bg-muted rounded-md transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-status-error text-[10px] font-medium text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border">
              <h3 className="font-medium text-sm">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-accent/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      )}
                      <div className={!notification.read ? '' : 'ml-4'}>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-status-error">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

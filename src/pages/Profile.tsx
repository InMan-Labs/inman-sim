import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Mail, Users, Shield, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Profile</h1>

      <div className="enterprise-card-elevated space-y-6">
        {/* User Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground">{user.email}</p>
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Teams</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.teams.map((team) => (
                  <span key={team} className="badge-info">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Permissions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.permissions.map((permission) => (
                  <span key={permission} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

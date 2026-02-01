import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Incident } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, User as UserIcon } from 'lucide-react';

type TabType = 'assigned' | 'open';

export default function OrchestrationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const { incidents, currentEnvironment } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredIncidents = incidents.filter(inc => {
    if (inc.environment !== currentEnvironment) return false;
    if (activeTab === 'assigned') {
      return inc.assignedTo === user?.name && inc.status !== 'Completed';
    }
    return inc.status === 'Open';
  });

  const handleIncidentClick = (incident: Incident) => {
    navigate(`/orchestration/${incident.id}`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Orchestration</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to infrastructure incidents
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('assigned')}
            className={cn(
              'pb-3 text-sm font-medium transition-colors relative',
              activeTab === 'assigned' ? 'tab-active' : 'tab-inactive'
            )}
          >
            Assigned to Me
            {incidents.filter(i => i.assignedTo === user?.name && i.status !== 'Completed' && i.environment === currentEnvironment).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {incidents.filter(i => i.assignedTo === user?.name && i.status !== 'Completed' && i.environment === currentEnvironment).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={cn(
              'pb-3 text-sm font-medium transition-colors relative',
              activeTab === 'open' ? 'tab-active' : 'tab-inactive'
            )}
          >
            Open Incidents
            {incidents.filter(i => i.status === 'Open' && i.environment === currentEnvironment).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                {incidents.filter(i => i.status === 'Open' && i.environment === currentEnvironment).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Incident List */}
      {filteredIncidents.length === 0 ? (
        <div className="enterprise-card text-center py-12">
          <p className="text-muted-foreground">No incidents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => handleIncidentClick(incident)}
              className="enterprise-card hover:shadow-enterprise-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {incident.id}
                    </span>
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                  <h3 className="font-medium text-foreground truncate">
                    {incident.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trigger: <code className="px-1 py-0.5 bg-muted rounded text-xs">{incident.triggerCondition}</code>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimestamp(incident.timestamp)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    {incident.assignedTo}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

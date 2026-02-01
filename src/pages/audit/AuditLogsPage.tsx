import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Environment } from '@/types';

export default function AuditLogsPage() {
  const [activeEnv, setActiveEnv] = useState<Environment>('Production');
  const { auditLogs } = useData();
  const navigate = useNavigate();

  const filteredLogs = auditLogs.filter(log => log.environment === activeEnv);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Success':
        return <CheckCircle2 className="w-4 h-4 text-status-success" />;
      case 'Partial':
        return <AlertCircle className="w-4 h-4 text-status-warning" />;
      case 'Failure':
        return <XCircle className="w-4 h-4 text-status-error" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Review execution history and compliance records
        </p>
      </div>

      {/* Environment Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveEnv('Production')}
            className={cn(
              'pb-3 text-sm font-medium transition-colors relative',
              activeEnv === 'Production' ? 'tab-active' : 'tab-inactive'
            )}
          >
            Production Audit Logs
          </button>
          <button
            onClick={() => setActiveEnv('Staging')}
            className={cn(
              'pb-3 text-sm font-medium transition-colors relative',
              activeEnv === 'Staging' ? 'tab-active' : 'tab-inactive'
            )}
          >
            Staging Audit Logs
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="enterprise-card text-center py-12">
          <p className="text-muted-foreground">No audit logs found for {activeEnv}</p>
        </div>
      ) : (
        <div className="enterprise-card overflow-hidden p-0">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Incident ID</th>
                <th>Runbook</th>
                <th>Approved By</th>
                <th>Executed By</th>
                <th>Outcome</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => navigate(`/audit-logs/${log.id}`)}
                  className="cursor-pointer"
                >
                  <td className="font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="font-mono text-sm">{log.incidentId}</td>
                  <td>{log.runbookName}</td>
                  <td>{log.approvedBy}</td>
                  <td>{log.executedBy}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getOutcomeIcon(log.outcome)}
                      {log.outcome}
                    </div>
                  </td>
                  <td>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

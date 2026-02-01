import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAuditLog, getExecutionResult } = useData();

  const auditLog = getAuditLog(id || '');
  const executionResult = auditLog ? getExecutionResult(auditLog.executionId) : null;

  if (!auditLog) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Audit log not found</p>
        <Button variant="outline" onClick={() => navigate('/audit-logs')} className="mt-4">
          Back to Audit Logs
        </Button>
      </div>
    );
  }

  const getOutcomeColor = () => {
    switch (auditLog.outcome) {
      case 'Success': return 'text-status-success';
      case 'Partial': return 'text-status-warning';
      case 'Failure': return 'text-status-error';
    }
  };

  const getOutcomeIcon = () => {
    switch (auditLog.outcome) {
      case 'Success': return <CheckCircle2 className="w-6 h-6" />;
      case 'Partial': return <AlertCircle className="w-6 h-6" />;
      case 'Failure': return <XCircle className="w-6 h-6" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/audit-logs')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Audit Logs
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Audit Entry</h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">{auditLog.id}</p>
          </div>
          <div className={cn('flex items-center gap-2', getOutcomeColor())}>
            {getOutcomeIcon()}
            <span className="text-lg font-semibold">{auditLog.outcome}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          <div className="enterprise-card-elevated">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Incident ID</span>
                <p className="font-mono mt-1">{auditLog.incidentId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Runbook</span>
                <p className="mt-1">{auditLog.runbookName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Environment</span>
                <p className="mt-1">{auditLog.environment}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp</span>
                <p className="mt-1">{new Date(auditLog.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Execution Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 w-px bg-border my-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">Execution Approved</p>
                  <p className="text-sm text-muted-foreground">
                    Approved by {auditLog.approvedBy}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {executionResult && new Date(executionResult.startTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-status-info-bg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-status-info" />
                  </div>
                  <div className="flex-1 w-px bg-border my-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">Execution Started</p>
                  <p className="text-sm text-muted-foreground">
                    Executed by {auditLog.executedBy}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Runner: {executionResult?.runnerId}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    auditLog.outcome === 'Success' ? 'bg-status-success-bg' :
                    auditLog.outcome === 'Failure' ? 'bg-status-error-bg' : 'bg-status-warning-bg'
                  )}>
                    {auditLog.outcome === 'Success' ? (
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                    ) : auditLog.outcome === 'Failure' ? (
                      <XCircle className="w-4 h-4 text-status-error" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-status-warning" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Execution Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Outcome: {auditLog.outcome}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {executionResult?.duration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              Compliance Check Results
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <span className="text-sm">Approval Chain Validated</span>
                <span className="flex items-center gap-1.5 text-sm text-status-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <span className="text-sm">Environment Authorization</span>
                <span className="flex items-center gap-1.5 text-sm text-status-success">
                  <CheckCircle2 className="w-4 h-4" />
                  {auditLog.environment} - Authorized
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <span className="text-sm">Policy Compliance</span>
                <span className="flex items-center gap-1.5 text-sm text-status-success">
                  <CheckCircle2 className="w-4 h-4" />
                  SOC2, ISO27001
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <span className="text-sm">Execution Logging</span>
                <span className="flex items-center gap-1.5 text-sm text-status-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Full audit trail captured
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="enterprise-card">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/results/${auditLog.executionId}`)}
              >
                View Execution Details
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/orchestration/${auditLog.incidentId}`)}
              >
                View Incident
              </Button>
            </div>
          </div>

          <div className="enterprise-card">
            <h3 className="font-semibold mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Audit ID</span>
                <p className="font-mono mt-1 text-xs break-all">{auditLog.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Execution ID</span>
                <p className="font-mono mt-1 text-xs break-all">{auditLog.executionId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

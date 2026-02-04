import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, 
  Server, User, FileText, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExecutionResult, auditLogs } = useData();

  const result = getExecutionResult(id || '');
  const auditEntry = auditLogs.find(a => a.executionId === id);

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Execution result not found</p>
        <Button variant="outline" onClick={() => navigate('/orchestration')} className="mt-4">
          Back to Orchestration
        </Button>
      </div>
    );
  }

  const getOutcomeColor = () => {
    switch (result.outcome) {
      case 'Success': return 'text-status-success';
      case 'Partial': return 'text-status-warning';
      case 'Failure': return 'text-status-error';
    }
  };

  const getOutcomeIcon = () => {
    switch (result.outcome) {
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
          onClick={() => navigate('/orchestration')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orchestration
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Execution Results</h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">{result.id}</p>
          </div>
          <div className={cn('flex items-center gap-2', getOutcomeColor())}>
            {getOutcomeIcon()}
            <span className="text-lg font-semibold">{result.outcome}</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="enterprise-card-elevated mb-6">
        <h2 className="text-lg font-semibold mb-4">Execution Summary</h2>
        <p className="text-muted-foreground mb-4">
          Runbook "{result.runbookName}" was executed {result.outcome === 'Success' ? 'successfully' : 'with issues'} 
          {result.targetServers && result.targetServers.length > 0 
            ? ` on ${result.targetServers.join(', ')}`
            : ` for incident ${result.incidentId}`
          }. 
          {result.stepsExecuted.filter(s => s.status === 'Success').length}/{result.stepsExecuted.length} steps completed.
        </p>

        {/* Execution Context if provided */}
        {result.executionContext && (
          <div className="mb-4 p-3 rounded-md bg-primary/5 border border-primary/10">
            <div className="text-xs text-muted-foreground mb-1">Execution Context</div>
            <p className="text-sm">{result.executionContext}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="font-semibold">{result.duration}</p>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Server className="w-4 h-4" />
              <span className="text-xs">Environment</span>
            </div>
            <p className="font-semibold">{result.environment}</p>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs">Executed By</span>
            </div>
            <p className="font-semibold">{result.executedBy}</p>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Steps</span>
            </div>
            <p className="font-semibold">{result.stepsExecuted.length} completed</p>
          </div>
        </div>

        {/* Target Servers if provided */}
        {result.targetServers && result.targetServers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Target Servers</div>
            <div className="flex flex-wrap gap-2">
              {result.targetServers.map((server) => (
                <span key={server} className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                  {server}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Steps Executed */}
      <div className="enterprise-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Steps Executed</h2>
        <div className="space-y-2">
          {result.stepsExecuted.map((step, index) => (
            <div key={step.stepId} className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                step.status === 'Success' ? 'bg-status-success-bg text-status-success' :
                step.status === 'Failure' ? 'bg-status-error-bg text-status-error' :
                'bg-muted text-muted-foreground'
              )}>
                {step.status === 'Success' ? '✓' : step.status === 'Failure' ? '✗' : '-'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{step.description}</p>
                {step.output && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.output}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{step.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Tabs */}
      <div className="enterprise-card mb-6">
        <Tabs defaultValue="execution" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="execution">Execution Logs</TabsTrigger>
            <TabsTrigger value="system">System Logs</TabsTrigger>
            <TabsTrigger value="raw">Raw Output</TabsTrigger>
          </TabsList>

          <TabsContent value="execution">
            <div className="p-4 rounded-md bg-foreground/5 font-mono text-xs max-h-64 overflow-y-auto">
              {result.executionLogs.map((log, i) => (
                <div key={i} className="py-0.5 text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="p-4 rounded-md bg-foreground/5 font-mono text-xs max-h-64 overflow-y-auto">
              {result.systemLogs.map((log, i) => (
                <div key={i} className="py-0.5 text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="raw">
            <pre className="p-4 rounded-md bg-foreground/5 font-mono text-xs max-h-64 overflow-y-auto whitespace-pre-wrap text-muted-foreground">
              {result.rawOutput}
            </pre>
          </TabsContent>
        </Tabs>
      </div>

      {/* Metadata */}
      <div className="enterprise-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Metadata</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Execution ID</span>
            <p className="font-mono mt-1">{result.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Environment</span>
            <p className="mt-1">{result.environment}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Runner ID</span>
            <p className="font-mono mt-1">{result.runnerId}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Approved By</span>
            <p className="mt-1">{result.approvedBy}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Executed By</span>
            <p className="mt-1">{result.executedBy}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Start Time</span>
            <p className="mt-1">{new Date(result.startTime).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(`/orchestration/${result.incidentId}`)}>
          Back to Incident
        </Button>
        {auditEntry && (
          <Button variant="outline" onClick={() => navigate(`/audit-logs/${auditEntry.id}`)}>
            View Audit Entry
          </Button>
        )}
      </div>
    </div>
  );
}

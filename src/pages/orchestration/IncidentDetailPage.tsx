import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Play, RefreshCw, MessageSquarePlus,
  AlertTriangle, CheckCircle2, XCircle, Shield,
  Server, Clock, Loader2
} from 'lucide-react';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIncident, getRunbook, runbooks, executeRunbook, updateIncident } = useData();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRunbookModal, setShowRunbookModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  const incident = getIncident(id || '');
  const runbook = incident?.runbookId ? getRunbook(incident.runbookId) : null;

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Incident not found</p>
        <Button variant="outline" onClick={() => navigate('/orchestration')} className="mt-4">
          Back to Orchestration
        </Button>
      </div>
    );
  }

  const handleExecute = async () => {
    if (!runbook) return;
    
    setIsExecuting(true);
    try {
      const result = await executeRunbook(incident.id, runbook.id);
      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error('Execution failed:', error);
      setIsExecuting(false);
    }
  };

  const handleAssignRunbook = (runbookId: string) => {
    updateIncident(incident.id, { runbookId });
    setShowRunbookModal(false);
  };

  const getImpactLevel = () => {
    if (incident.severity === 'Critical' || incident.severity === 'High') {
      return { level: 'High', color: 'severity-high' };
    }
    if (incident.severity === 'Medium') {
      return { level: 'Moderate', color: 'severity-medium' };
    }
    return { level: 'Low', color: 'severity-low' };
  };

  const impact = getImpactLevel();

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
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-muted-foreground">{incident.id}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{incident.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Incident Overview */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Incident Overview</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Environment</span>
                <p className="font-medium mt-1">{incident.environment}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned To</span>
                <p className="font-medium mt-1">{incident.assignedTo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trigger Condition</span>
                <p className="font-medium mt-1">
                  <code className="px-2 py-1 bg-muted rounded text-xs">{incident.triggerCondition}</code>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium mt-1">{new Date(incident.timestamp).toLocaleString()}</p>
              </div>
            </div>
            {incident.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="mt-1 text-sm">{incident.description}</p>
              </div>
            )}
          </div>

          {/* Assigned Runbook */}
          {runbook && (
            <div className="enterprise-card">
              <h2 className="text-lg font-semibold mb-4">Assigned Runbook</h2>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{runbook.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {runbook.category} • Risk: <SeverityBadge severity={runbook.riskLevel} />
                  </p>
                </div>
                <span className="text-sm text-muted-foreground font-mono">{runbook.id}</span>
              </div>

              {/* Execution Plan */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Execution Plan</h4>
                <div className="space-y-2">
                  {runbook.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{step.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Action: {step.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Preview */}
              {runbook.script && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Script Preview</h4>
                  <pre className="p-4 rounded-md bg-foreground/5 text-xs overflow-x-auto font-mono text-muted-foreground max-h-48 overflow-y-auto">
                    {runbook.script}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Security & Risk Analysis */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Security & Risk Analysis</h2>
            
            {/* Impact Analysis */}
            <div className="mb-6">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-muted-foreground" />
                Impact Analysis
              </h3>
              <div className="p-4 rounded-md bg-muted/50 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className={impact.color}>{impact.level} Operational Impact</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                    <span><strong>Servers affected:</strong> 1 host ({incident.title.split(' on ')[1] || 'target server'})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                    <span><strong>Services impacted:</strong> Web application tier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                    <span><strong>Expected downtime:</strong> None (non-disruptive)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                    <span><strong>Blast radius:</strong> Single host</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Compliance Check */}
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Company Compliance Check
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm">Least-privilege execution</span>
                  <span className="flex items-center gap-1.5 text-sm text-status-success">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm">Environment allowed</span>
                  <span className="flex items-center gap-1.5 text-sm text-status-success">
                    <CheckCircle2 className="w-4 h-4" />
                    {incident.environment}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm">Approval level satisfied</span>
                  <span className="flex items-center gap-1.5 text-sm text-status-success">
                    <CheckCircle2 className="w-4 h-4" />
                    {runbook?.approvalLevelRequired || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm">Destructive commands</span>
                  <span className="flex items-center gap-1.5 text-sm text-status-success">
                    <CheckCircle2 className="w-4 h-4" />
                    None detected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="enterprise-card">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                disabled={!runbook || isExecuting || incident.status !== 'Open'}
                onClick={handleExecute}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Runbook
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowRunbookModal(true)}
                disabled={incident.status !== 'Open'}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Assign New Runbook
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowContextModal(true)}
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Add Context
              </Button>
            </div>
          </div>

          {/* Status Info */}
          {incident.status === 'Executing' && (
            <div className="enterprise-card bg-status-warning-bg border-status-warning">
              <div className="flex items-center gap-2 text-status-warning">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Execution in Progress</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while the runbook is being executed...
              </p>
            </div>
          )}

          {incident.status === 'Completed' && (
            <div className="enterprise-card bg-status-success-bg border-status-success">
              <div className="flex items-center gap-2 text-status-success">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Incident Resolved</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This incident has been successfully remediated.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Runbook Modal */}
      <Dialog open={showRunbookModal} onOpenChange={setShowRunbookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Runbook</DialogTitle>
            <DialogDescription>
              Select a runbook to assign to this incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {runbooks.map((rb) => (
              <button
                key={rb.id}
                onClick={() => handleAssignRunbook(rb.id)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  rb.id === incident.runbookId 
                    ? 'border-primary bg-accent' 
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{rb.name}</span>
                  <SeverityBadge severity={rb.riskLevel} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{rb.category}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Context Modal */}
      <Dialog open={showContextModal} onOpenChange={setShowContextModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Context / Constraints</DialogTitle>
            <DialogDescription>
              Add additional information or constraints for this incident
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter additional context, constraints, or notes..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowContextModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowContextModal(false)}>
              Save Context
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

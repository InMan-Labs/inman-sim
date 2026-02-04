import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { RunbookExecutionModal } from '@/components/runbooks/RunbookExecutionModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Edit, Copy, Shield, CheckCircle2 } from 'lucide-react';

export default function RunbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRunbook, addRunbook } = useData();
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  const runbook = getRunbook(id || '');

  if (!runbook) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Runbook not found</p>
        <Button variant="outline" onClick={() => navigate('/runbooks')} className="mt-4">
          Back to Runbooks
        </Button>
      </div>
    );
  }

  const handleDuplicate = () => {
    const newRunbook = {
      ...runbook,
      id: `RB-${Date.now()}`,
      name: `${runbook.name} (Copy)`,
      lastModified: new Date().toISOString(),
    };
    addRunbook(newRunbook);
    navigate(`/runbooks/${newRunbook.id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/runbooks')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Runbooks
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-muted-foreground">{runbook.id}</span>
              <SeverityBadge severity={runbook.riskLevel} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{runbook.name}</h1>
            <p className="text-muted-foreground mt-1">{runbook.category} • {runbook.ownerTeam}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/runbooks/${runbook.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button onClick={() => setShowExecutionModal(true)}>
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Configuration */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Configuration</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Severity</span>
                <p className="font-medium mt-1"><SeverityBadge severity={runbook.severity} /></p>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Level</span>
                <p className="font-medium mt-1"><SeverityBadge severity={runbook.riskLevel} /></p>
              </div>
              <div>
                <span className="text-muted-foreground">Auto Execute</span>
                <p className="font-medium mt-1">{runbook.autoExecuteAllowed ? 'Allowed' : 'Not Allowed'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Approval Required</span>
                <p className="font-medium mt-1">{runbook.approvalLevelRequired}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Supported Environments</span>
                <div className="flex gap-2 mt-1">
                  {runbook.supportedEnvironments.map((env) => (
                    <span key={env} className="badge-info">{env}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trigger Conditions */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Trigger Conditions</h2>
            <div className="space-y-2">
              {runbook.triggerConditions.map((trigger, index) => (
                <div key={index} className="p-3 rounded-md bg-muted/50">
                  <code className="text-sm">
                    {trigger.name} {trigger.operator} {trigger.value}
                  </code>
                  <span className="ml-2 text-xs text-muted-foreground">({trigger.type})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Checks */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Pre-Checks</h2>
            <div className="space-y-2">
              {runbook.preChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm">{check.check}</span>
                  <span className="text-sm text-muted-foreground">Expected: {check.expected}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Execution Steps</h2>
            <div className="space-y-3">
              {runbook.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 p-4 rounded-md bg-muted/50">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{step.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Action: <code className="px-1.5 py-0.5 bg-background rounded">{step.action}</code>
                    </p>
                    {Object.keys(step.parameters).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Parameters: {JSON.stringify(step.parameters)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Post-Checks */}
          <div className="enterprise-card">
            <h2 className="text-lg font-semibold mb-4">Post-Checks</h2>
            <div className="space-y-2">
              {runbook.postChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm">{check.check}</span>
                  <span className="text-sm text-muted-foreground">Expected: {check.expected}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Script Preview */}
          {runbook.script && (
            <div className="enterprise-card">
              <h2 className="text-lg font-semibold mb-4">Script</h2>
              <pre className="p-4 rounded-md bg-foreground/5 text-xs overflow-x-auto font-mono text-muted-foreground max-h-64 overflow-y-auto">
                {runbook.script}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Required Context */}
          <div className="enterprise-card">
            <h3 className="font-semibold mb-3">Required Context</h3>
            <div className="space-y-1">
              {runbook.requiredContext.map((ctx) => (
                <div key={ctx} className="text-sm py-1">
                  <code className="px-2 py-0.5 bg-muted rounded">{ctx}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Rollback */}
          <div className="enterprise-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Rollback Plan
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{runbook.rollback.description}</p>
            <div className="space-y-1">
              {runbook.rollback.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  {action}
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="enterprise-card">
            <h3 className="font-semibold mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner Team</span>
                <span>{runbook.ownerTeam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Modified</span>
                <span>{new Date(runbook.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Modal */}
      <RunbookExecutionModal
        runbook={runbook}
        open={showExecutionModal}
        onOpenChange={setShowExecutionModal}
      />
    </div>
  );
}

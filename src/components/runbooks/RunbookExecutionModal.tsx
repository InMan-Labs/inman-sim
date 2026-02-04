import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { servers } from '@/data/historicalData';
import { Runbook } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Server, AlertTriangle, Shield, Play, Loader2 } from 'lucide-react';

interface RunbookExecutionModalProps {
  runbook: Runbook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExecutionStep = 'server-select' | 'confirm' | 'executing';

export function RunbookExecutionModal({ runbook, open, onOpenChange }: RunbookExecutionModalProps) {
  const navigate = useNavigate();
  const { currentEnvironment, executeRunbookDirect } = useData();
  const [step, setStep] = useState<ExecutionStep>('server-select');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [executionContext, setExecutionContext] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const availableServers = servers.filter(s => s.environment === currentEnvironment);

  const handleServerToggle = (serverId: string) => {
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServers.length === availableServers.length) {
      setSelectedServers([]);
    } else {
      setSelectedServers(availableServers.map(s => s.id));
    }
  };

  const handleContinue = () => {
    if (step === 'server-select' && selectedServers.length > 0) {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('server-select');
    }
  };

  const handleExecute = async () => {
    setStep('executing');
    setIsExecuting(true);
    
    try {
      const result = await executeRunbookDirect(runbook.id, selectedServers, executionContext);
      onOpenChange(false);
      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error('Execution failed:', error);
      setIsExecuting(false);
      setStep('confirm');
    }
  };

  const handleClose = () => {
    if (!isExecuting) {
      setStep('server-select');
      setSelectedServers([]);
      setExecutionContext('');
      onOpenChange(false);
    }
  };

  const getPlaceholderText = () => {
    const placeholders: Record<string, string> = {
      'Disk Cleanup': 'e.g., Log files consuming excessive space in /var/log',
      'Service Restart': 'e.g., Restart only if service is unresponsive for > 5 min',
      'High Memory Remediation': 'e.g., Memory leak suspected in worker process',
      'CPU Spike Mitigation': 'e.g., Runaway process detected, safe to terminate',
      'Certificate Renewal': 'e.g., Renew certificate for api.acme-manufacturing.com',
      'User Access Revocation': 'e.g., Employee termination - immediate revocation required',
    };
    return placeholders[runbook.name] || 'Provide additional context for this execution...';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === 'server-select' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Select Target Servers
              </DialogTitle>
              <DialogDescription>
                Choose where <span className="font-medium">{runbook.name}</span> should run
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Environment indicator */}
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="badge-info">{currentEnvironment}</span>
              </div>

              {/* Server selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Available Servers</Label>
                  <button 
                    onClick={handleSelectAll}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedServers.length === availableServers.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableServers.map((server) => (
                    <label
                      key={server.id}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedServers.includes(server.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedServers.includes(server.id)}
                        onCheckedChange={() => handleServerToggle(server.id)}
                      />
                      <div className="flex-1">
                        <span className="font-mono text-sm">{server.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Context input */}
              <div>
                <Label className="text-sm font-medium">Additional Context (Optional)</Label>
                <Textarea
                  className="mt-2"
                  placeholder={getPlaceholderText()}
                  value={executionContext}
                  onChange={(e) => setExecutionContext(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This context will be logged in the execution record and audit trail.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={selectedServers.length === 0}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Confirm Execution
              </DialogTitle>
              <DialogDescription>
                Review the execution details before proceeding
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Execution Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Runbook</span>
                  <span className="font-medium">{runbook.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Environment</span>
                  <span className="badge-info">{currentEnvironment}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <SeverityBadge severity={runbook.riskLevel} />
                </div>
                <div className="p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground block mb-2">Target Servers</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedServers.map((serverId) => (
                      <span key={serverId} className="px-2 py-1 text-xs font-mono bg-background rounded border">
                        {serverId}
                      </span>
                    ))}
                  </div>
                </div>
                {executionContext && (
                  <div className="p-3 rounded-md bg-muted/50">
                    <span className="text-sm text-muted-foreground block mb-2">Execution Context</span>
                    <p className="text-sm">{executionContext}</p>
                  </div>
                )}
              </div>

              {/* Warning for high risk */}
              {runbook.riskLevel === 'High' && (
                <div className="flex items-start gap-3 p-3 rounded-md bg-status-warning/10 border border-status-warning/30">
                  <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-status-warning">High-Risk Execution</p>
                    <p className="text-muted-foreground mt-1">
                      This runbook has been marked as high-risk. Ensure you have the appropriate approvals.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleExecute}>
                <Play className="w-4 h-4 mr-2" />
                Confirm & Execute
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'executing' && (
          <>
            <DialogHeader>
              <DialogTitle>Executing Runbook</DialogTitle>
              <DialogDescription>
                Please wait while the runbook is being executed...
              </DialogDescription>
            </DialogHeader>

            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">
                Running <span className="font-medium">{runbook.name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                on {selectedServers.length} server{selectedServers.length > 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Runbook, RunbookStep, Severity, RiskLevel, ApprovalLevel, Environment } from '@/types';
import { useToast } from '@/hooks/use-toast';

const emptyRunbook: Omit<Runbook, 'id'> = {
  name: '',
  category: 'Infrastructure',
  riskLevel: 'Low',
  severity: 'Medium',
  lastModified: new Date().toISOString(),
  ownerTeam: '',
  autoExecuteAllowed: false,
  approvalLevelRequired: 'Engineer',
  supportedEnvironments: ['Production', 'Staging'],
  triggerConditions: [{ type: 'metric', name: '', operator: '>', value: '' }],
  requiredContext: ['hostname', 'environment'],
  preChecks: [{ check: '', expected: '' }],
  steps: [{ id: 'step_1', description: '', action: '', parameters: {} }],
  postChecks: [{ check: '', expected: '' }],
  rollback: {
    description: '',
    actions: [''],
    notify: ['on_call'],
  },
};

export default function RunbookEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRunbook, addRunbook, updateRunbook } = useData();
  const { toast } = useToast();

  const existingRunbook = id && id !== 'new' ? getRunbook(id) : null;
  const [formData, setFormData] = useState<Omit<Runbook, 'id'>>(
    existingRunbook ? { ...existingRunbook } : { ...emptyRunbook }
  );

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Runbook name is required',
        variant: 'destructive',
      });
      return;
    }

    if (existingRunbook) {
      updateRunbook(existingRunbook.id, { ...formData, lastModified: new Date().toISOString() });
      toast({ title: 'Runbook Updated', description: 'Changes saved successfully' });
    } else {
      const newRunbook: Runbook = {
        ...formData,
        id: `RB-${Date.now()}`,
        lastModified: new Date().toISOString(),
      };
      addRunbook(newRunbook);
      toast({ title: 'Runbook Created', description: 'New runbook added to repository' });
      navigate(`/runbooks/${newRunbook.id}`);
      return;
    }
    navigate(`/runbooks/${existingRunbook?.id || id}`);
  };

  const addStep = () => {
    const newStep: RunbookStep = {
      id: `step_${formData.steps.length + 1}`,
      description: '',
      action: '',
      parameters: {},
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const updateStep = (index: number, updates: Partial<RunbookStep>) => {
    setFormData({
      ...formData,
      steps: formData.steps.map((step, i) =>
        i === index ? { ...step, ...updates } : step
      ),
    });
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/runbooks')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Runbooks
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            {existingRunbook ? 'Edit Runbook' : 'Create Runbook'}
          </h1>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Runbook
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="enterprise-card">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Runbook Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Disk Cleanup"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: typeof formData.category) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Application">Application</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Owner Team</Label>
              <Input
                value={formData.ownerTeam}
                onChange={(e) => setFormData({ ...formData, ownerTeam: e.target.value })}
                placeholder="e.g., Infrastructure"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: Severity) =>
                  setFormData({ ...formData, severity: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value: RiskLevel) =>
                  setFormData({ ...formData, riskLevel: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Approval Level Required</Label>
              <Select
                value={formData.approvalLevelRequired}
                onValueChange={(value: ApprovalLevel) =>
                  setFormData({ ...formData, approvalLevelRequired: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="Senior Engineer">Senior Engineer</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Auto Execute Allowed</Label>
              <Select
                value={formData.autoExecuteAllowed ? 'true' : 'false'}
                onValueChange={(value) =>
                  setFormData({ ...formData, autoExecuteAllowed: value === 'true' })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Execution Steps</h2>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>

          <div className="space-y-4">
            {formData.steps.map((step, index) => (
              <div key={step.id} className="p-4 rounded-md border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Step {index + 1}</span>
                  {formData.steps.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={step.description}
                      onChange={(e) => updateStep(index, { description: e.target.value })}
                      placeholder="What this step does"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Action</Label>
                    <Input
                      value={step.action}
                      onChange={(e) => updateStep(index, { action: e.target.value })}
                      placeholder="e.g., run_command"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Parameters (JSON)</Label>
                    <Input
                      value={JSON.stringify(step.parameters)}
                      onChange={(e) => {
                        try {
                          const params = JSON.parse(e.target.value);
                          updateStep(index, { parameters: params });
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder='{"key": "value"}'
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rollback */}
        <div className="enterprise-card">
          <h2 className="text-lg font-semibold mb-4">Rollback Plan</h2>
          <div>
            <Label>Rollback Description</Label>
            <Textarea
              value={formData.rollback.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rollback: { ...formData.rollback, description: e.target.value },
                })
              }
              placeholder="When and why rollback should happen..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/runbooks')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Runbook
          </Button>
        </div>
      </div>
    </div>
  );
}

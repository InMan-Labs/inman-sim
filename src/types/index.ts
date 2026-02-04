export type Environment = 'Production' | 'Staging';

export type IncidentStatus = 'Open' | 'Executing' | 'Completed';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ApprovalLevel = 'Engineer' | 'Senior Engineer' | 'Admin';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type JobStatus = 'Scheduled' | 'Paused' | 'Executing' | 'Completed';

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  environment: Environment;
  assignedTo: string;
  status: IncidentStatus;
  triggerCondition: string;
  timestamp: string;
  runbookId?: string;
  description?: string;
}

export interface RunbookStep {
  id: string;
  description: string;
  action: string;
  parameters: Record<string, string>;
}

export interface Runbook {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Application' | 'Security' | 'Maintenance';
  riskLevel: RiskLevel;
  severity: Severity;
  lastModified: string;
  ownerTeam: string;
  autoExecuteAllowed: boolean;
  approvalLevelRequired: ApprovalLevel;
  supportedEnvironments: Environment[];
  triggerConditions: Array<{
    type: 'metric' | 'event';
    name: string;
    operator: string;
    value: string;
  }>;
  requiredContext: string[];
  preChecks: Array<{ check: string; expected: string }>;
  steps: RunbookStep[];
  postChecks: Array<{ check: string; expected: string }>;
  rollback: {
    description: string;
    actions: string[];
    notify: string[];
  };
  script?: string;
}

export interface ExecutionResult {
  id: string;
  incidentId: string;
  runbookId: string;
  runbookName: string;
  environment: Environment;
  runnerId: string;
  approvedBy: string;
  executedBy: string;
  startTime: string;
  endTime: string;
  duration: string;
  outcome: 'Success' | 'Partial' | 'Failure';
  targetServers?: string[];
  executionContext?: string;
  stepsExecuted: Array<{
    stepId: string;
    description: string;
    status: 'Success' | 'Failure' | 'Skipped';
    output?: string;
    duration: string;
  }>;
  executionLogs: string[];
  systemLogs: string[];
  rawOutput: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  environment: Environment;
  incidentId: string;
  runbookName: string;
  approvedBy: string;
  executedBy: string;
  outcome: 'Success' | 'Partial' | 'Failure';
  executionId: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  runbookId: string;
  schedule: string;
  nextRun: string;
  lastRun?: string;
  status: JobStatus;
  environment: Environment;
}

export interface Notification {
  id: string;
  type: 'incident_assigned' | 'execution_completed' | 'approval_required';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
  teams: string[];
  permissions: string[];
}

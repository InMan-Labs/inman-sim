import { AuditLogEntry, ExecutionResult, Environment } from '@/types';

// Server list for consistent reference
export const servers = [
  { id: 'prod-app-01', name: 'prod-app-01', environment: 'Production' as Environment },
  { id: 'prod-app-02', name: 'prod-app-02', environment: 'Production' as Environment },
  { id: 'prod-app-03', name: 'prod-app-03', environment: 'Production' as Environment },
  { id: 'prod-db-01', name: 'prod-db-01', environment: 'Production' as Environment },
  { id: 'prod-db-02', name: 'prod-db-02', environment: 'Production' as Environment },
  { id: 'prod-web-01', name: 'prod-web-01', environment: 'Production' as Environment },
  { id: 'prod-web-02', name: 'prod-web-02', environment: 'Production' as Environment },
  { id: 'prod-cache-01', name: 'prod-cache-01', environment: 'Production' as Environment },
  { id: 'staging-app-01', name: 'staging-app-01', environment: 'Staging' as Environment },
  { id: 'staging-app-02', name: 'staging-app-02', environment: 'Staging' as Environment },
  { id: 'staging-db-01', name: 'staging-db-01', environment: 'Staging' as Environment },
  { id: 'staging-web-01', name: 'staging-web-01', environment: 'Staging' as Environment },
];

const runbookMeta = [
  { id: 'RB-001', name: 'Disk Cleanup', successRate: 0.97 },
  { id: 'RB-002', name: 'Service Restart', successRate: 0.94 },
  { id: 'RB-003', name: 'High Memory Remediation', successRate: 0.91 },
  { id: 'RB-004', name: 'CPU Spike Mitigation', successRate: 0.95 },
  { id: 'RB-005', name: 'Certificate Renewal', successRate: 0.99 },
  { id: 'RB-006', name: 'User Access Revocation', successRate: 1.0 },
];

const approvers = ['Admin User', 'Sarah Chen', 'Mike Johnson', 'Emily Rodriguez'];
const executors = ['Admin User', 'Sarah Chen', 'Mike Johnson', 'Emily Rodriguez', 'System'];

// Historical incident types with frequencies
const incidentTypes = [
  { title: 'Disk Usage Critical', runbookId: 'RB-001', frequency: 34 },
  { title: 'Service Unresponsive', runbookId: 'RB-002', frequency: 28 },
  { title: 'High Memory Usage', runbookId: 'RB-003', frequency: 22 },
  { title: 'CPU Spike Detected', runbookId: 'RB-004', frequency: 18 },
  { title: 'Certificate Expiring', runbookId: 'RB-005', frequency: 12 },
  { title: 'Access Revocation Required', runbookId: 'RB-006', frequency: 8 },
];

// Generate 30 days of historical data
function generateHistoricalData() {
  const auditLogs: AuditLogEntry[] = [];
  const executionResults: ExecutionResult[] = [];
  
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  let executionId = 1000;
  
  // Create executions based on incident type frequencies
  incidentTypes.forEach((incidentType) => {
    const runbook = runbookMeta.find(r => r.id === incidentType.runbookId)!;
    
    for (let i = 0; i < incidentType.frequency; i++) {
      executionId++;
      
      // Distribute evenly across 30 days
      const timestamp = thirtyDaysAgo + (i / incidentType.frequency) * (now - thirtyDaysAgo);
      const startTime = new Date(timestamp);
      const duration = Math.floor(Math.random() * 120) + 30; // 30-150 seconds
      const endTime = new Date(timestamp + duration * 1000);
      
      // Determine outcome based on success rate
      const isSuccess = Math.random() < runbook.successRate;
      const outcome: 'Success' | 'Partial' | 'Failure' = isSuccess 
        ? 'Success' 
        : Math.random() > 0.5 ? 'Partial' : 'Failure';
      
      // Pick random server
      const prodServers = servers.filter(s => s.environment === 'Production');
      const server = prodServers[Math.floor(Math.random() * prodServers.length)];
      
      const approver = approvers[Math.floor(Math.random() * approvers.length)];
      const executor = executors[Math.floor(Math.random() * executors.length)];
      
      const incidentId = `INC-${1000 + executionId}`;
      const execId = `EXEC-${executionId}`;
      
      // Create audit log entry
      auditLogs.push({
        id: `AUDIT-${executionId}`,
        timestamp: endTime.toISOString(),
        environment: 'Production',
        incidentId,
        runbookName: runbook.name,
        approvedBy: approver,
        executedBy: executor,
        outcome,
        executionId: execId,
      });
      
      // Create execution result
      executionResults.push({
        id: execId,
        incidentId,
        runbookId: incidentType.runbookId,
        runbookName: runbook.name,
        environment: 'Production',
        runnerId: `runner-${server.id}`,
        approvedBy: approver,
        executedBy: executor,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${duration}s`,
        outcome,
        targetServers: [server.name],
        executionContext: getRandomContext(incidentType.title),
        stepsExecuted: [
          { stepId: 'step_1', description: 'Pre-check validation', status: 'Success', duration: '2s' },
          { stepId: 'step_2', description: 'Execute primary action', status: outcome === 'Failure' ? 'Failure' : 'Success', duration: `${Math.floor(duration * 0.6)}s` },
          { stepId: 'step_3', description: 'Post-check validation', status: outcome === 'Failure' ? 'Skipped' : 'Success', duration: '3s' },
        ],
        executionLogs: [
          `[${startTime.toISOString()}] Execution started on ${server.name}`,
          `[${startTime.toISOString()}] Pre-checks passed`,
          `[${endTime.toISOString()}] Execution ${outcome.toLowerCase()}`,
        ],
        systemLogs: [
          `[INFO] Target server: ${server.name}`,
          `[INFO] Approved by: ${approver}`,
          `[INFO] Policy compliance: PASSED`,
        ],
        rawOutput: `=== Execution on ${server.name} ===\nOutcome: ${outcome}\nDuration: ${duration}s`,
      });
    }
  });
  
  // Add some staging executions
  for (let i = 0; i < 15; i++) {
    executionId++;
    const timestamp = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
    const stagingServers = servers.filter(s => s.environment === 'Staging');
    const server = stagingServers[Math.floor(Math.random() * stagingServers.length)];
    const runbook = runbookMeta[Math.floor(Math.random() * runbookMeta.length)];
    
    auditLogs.push({
      id: `AUDIT-${executionId}`,
      timestamp: new Date(timestamp).toISOString(),
      environment: 'Staging',
      incidentId: `INC-STG-${executionId}`,
      runbookName: runbook.name,
      approvedBy: approvers[Math.floor(Math.random() * approvers.length)],
      executedBy: executors[Math.floor(Math.random() * executors.length)],
      outcome: 'Success',
      executionId: `EXEC-${executionId}`,
    });
  }
  
  // Sort by timestamp descending
  auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  executionResults.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
  
  return { auditLogs, executionResults };
}

function getRandomContext(incidentType: string): string {
  const contexts: Record<string, string[]> = {
    'Disk Usage Critical': [
      'Log files consuming excessive space',
      'Temporary files not being cleaned',
      'Database dump files accumulated',
      'Application cache overflow',
    ],
    'Service Unresponsive': [
      'Service stopped responding after deployment',
      'Memory leak causing slowdown',
      'Connection pool exhausted',
      'Upstream dependency timeout',
    ],
    'High Memory Usage': [
      'Batch job consuming memory',
      'Memory leak in worker process',
      'Cache eviction not working',
      'Large dataset loaded in memory',
    ],
    'CPU Spike Detected': [
      'Runaway process detected',
      'Unexpected traffic spike',
      'Inefficient query execution',
      'Background job overload',
    ],
    'Certificate Expiring': [
      'Automated renewal failed',
      'Certificate mismatch detected',
      'Expiry notification triggered',
    ],
    'Access Revocation Required': [
      'Employee termination',
      'Role change requested',
      'Security policy enforcement',
    ],
  };
  
  const options = contexts[incidentType] || ['Standard execution'];
  return options[Math.floor(Math.random() * options.length)];
}

// Generate historical data on import
const { auditLogs: historicalAuditLogs, executionResults: historicalExecutionResults } = generateHistoricalData();

export { historicalAuditLogs, historicalExecutionResults };

// Dashboard statistics derived from historical data
export function getDashboardStats() {
  const prodLogs = historicalAuditLogs.filter(l => l.environment === 'Production');
  
  const totalIncidents = prodLogs.length;
  const successfulExecutions = prodLogs.filter(l => l.outcome === 'Success').length;
  const partialExecutions = prodLogs.filter(l => l.outcome === 'Partial').length;
  const failedExecutions = prodLogs.filter(l => l.outcome === 'Failure').length;
  
  // Calculate MTTR (Mean Time To Resolution) - simulated at ~42 minutes
  const avgMTTR = 113;
  
  // Calculate time saved (15 min saved per automated execution vs manual)
  const timeSavedMinutes = totalIncidents * 127; // 100 min avg saved per execution
  const timeSavedHours = Math.round(timeSavedMinutes / 60);
  
  // Runbook usage stats
  const runbookUsage = incidentTypes.map(it => ({
    name: runbookMeta.find(r => r.id === it.runbookId)?.name || it.runbookId,
    executions: it.frequency,
    successRate: runbookMeta.find(r => r.id === it.runbookId)?.successRate || 0.9,
  })).sort((a, b) => b.executions - a.executions);
  
  // Incident trend by day (last 30 days)
  const incidentTrend: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = prodLogs.filter(l => l.timestamp.startsWith(dateStr)).length;
    incidentTrend.push({ date: dateStr, count: count || Math.floor(Math.random() * 3) + 2 });
  }
  
  // Incidents by severity (simulated based on incident types)
  const incidentsBySeverity = {
    Critical: Math.floor(totalIncidents * 0.15),
    High: Math.floor(totalIncidents * 0.35),
    Medium: Math.floor(totalIncidents * 0.50),
  };
  
  // Top recurring incident types
  const topIncidentTypes = incidentTypes.slice(0, 3).map(it => ({
    type: it.title,
    count: it.frequency,
  }));
  
  return {
    totalIncidents,
    avgMTTR,
    successRate: Math.round((successfulExecutions / totalIncidents) * 100),
    timeSavedHours,
    successfulExecutions,
    partialExecutions,
    failedExecutions,
    runbookUsage,
    incidentTrend,
    incidentsBySeverity,
    topIncidentTypes,
    // Governance metrics
    approvalCompliance: 100,
    blockedByPolicy: 3,
    highRiskExecutions: 7,
  };
}

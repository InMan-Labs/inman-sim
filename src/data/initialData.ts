import { 
  Incident, Runbook, ScheduledJob, Notification, 
  ExecutionResult, AuditLogEntry 
} from '@/types';

export const initialIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Disk Usage Critical on prod-web-01',
    severity: 'Critical',
    environment: 'Production',
    assignedTo: 'Admin User',
    status: 'Open',
    triggerCondition: 'disk.usage > 90%',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    runbookId: 'RB-001',
    description: 'Disk usage on production web server has exceeded 90% threshold. Immediate action required to prevent service disruption.',
  },
  {
    id: 'INC-002',
    title: 'High Memory Usage on app-server-03',
    severity: 'High',
    environment: 'Production',
    assignedTo: 'Admin User',
    status: 'Open',
    triggerCondition: 'memory.usage > 85%',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    runbookId: 'RB-003',
    description: 'Application server memory consumption is abnormally high. Performance degradation may occur.',
  },
  {
    id: 'INC-003',
    title: 'API Service Unresponsive',
    severity: 'Critical',
    environment: 'Production',
    assignedTo: 'Sarah Chen',
    status: 'Open',
    triggerCondition: 'http.response_time > 5000ms',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    runbookId: 'RB-002',
    description: 'Core API service is not responding within acceptable timeframes.',
  },
  {
    id: 'INC-004',
    title: 'CPU Spike on batch-processor-01',
    severity: 'Medium',
    environment: 'Production',
    assignedTo: 'Mike Johnson',
    status: 'Open',
    triggerCondition: 'cpu.usage > 80% for 10m',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    runbookId: 'RB-004',
    description: 'Batch processing server showing sustained high CPU usage.',
  },
  {
    id: 'INC-005',
    title: 'SSL Certificate Expiring Soon',
    severity: 'Medium',
    environment: 'Production',
    assignedTo: 'Admin User',
    status: 'Open',
    triggerCondition: 'cert.expiry < 7d',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    runbookId: 'RB-005',
    description: 'SSL certificate for api.acme-manufacturing.com expires in 5 days.',
  },
  {
    id: 'INC-006',
    title: 'Database Connection Pool Exhausted',
    severity: 'High',
    environment: 'Staging',
    assignedTo: 'Emily Rodriguez',
    status: 'Open',
    triggerCondition: 'db.connections > 95%',
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    runbookId: 'RB-002',
    description: 'Database connection pool is nearly exhausted on staging environment.',
  },
];

export const initialRunbooks: Runbook[] = [
  {
    id: 'RB-001',
    name: 'Disk Cleanup',
    category: 'Infrastructure',
    riskLevel: 'Medium',
    severity: 'High',
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    ownerTeam: 'Infrastructure',
    autoExecuteAllowed: false,
    approvalLevelRequired: 'Senior Engineer',
    supportedEnvironments: ['Production', 'Staging'],
    triggerConditions: [
      { type: 'metric', name: 'disk.usage', operator: '>', value: '90%' }
    ],
    requiredContext: ['hostname', 'mount_point', 'environment'],
    preChecks: [
      { check: 'disk.available', expected: '> 0' },
      { check: 'system.load', expected: '< 10' },
    ],
    steps: [
      { id: 'step_1', description: 'Identify large files and directories', action: 'scan_disk', parameters: { path: '/var', depth: '3' } },
      { id: 'step_2', description: 'Clear application logs older than 7 days', action: 'clear_logs', parameters: { retention: '7d', path: '/var/log/app' } },
      { id: 'step_3', description: 'Remove temporary files', action: 'clear_temp', parameters: { path: '/tmp', age: '1d' } },
      { id: 'step_4', description: 'Verify disk space recovered', action: 'check_disk', parameters: { mount: '/' } },
    ],
    postChecks: [
      { check: 'disk.usage', expected: '< 80%' },
    ],
    rollback: {
      description: 'If disk cleanup fails or causes issues, escalate to on-call engineer',
      actions: ['Notify on-call', 'Create incident ticket'],
      notify: ['on_call', 'team_lead'],
    },
    script: `#!/bin/bash
# Disk Cleanup Runbook Script
set -e

echo "[$(date)] Starting disk cleanup on $(hostname)"

# Find large files
echo "Scanning for large files..."
find /var -type f -size +100M -exec ls -lh {} \\;

# Clear old logs
echo "Clearing application logs older than 7 days..."
find /var/log/app -type f -mtime +7 -delete

# Clear temp files
echo "Removing temporary files..."
find /tmp -type f -mtime +1 -delete

# Verify
echo "Current disk usage:"
df -h /

echo "[$(date)] Disk cleanup completed"`,
  },
  {
    id: 'RB-002',
    name: 'Service Restart',
    category: 'Application',
    riskLevel: 'Medium',
    severity: 'High',
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    ownerTeam: 'Platform',
    autoExecuteAllowed: false,
    approvalLevelRequired: 'Engineer',
    supportedEnvironments: ['Production', 'Staging'],
    triggerConditions: [
      { type: 'event', name: 'service.unresponsive', operator: '==', value: 'true' }
    ],
    requiredContext: ['service_name', 'hostname', 'environment'],
    preChecks: [
      { check: 'service.status', expected: 'running' },
      { check: 'load_balancer.health', expected: 'healthy' },
    ],
    steps: [
      { id: 'step_1', description: 'Drain connections from load balancer', action: 'lb_drain', parameters: { timeout: '30s' } },
      { id: 'step_2', description: 'Stop the service gracefully', action: 'service_stop', parameters: { grace_period: '15s' } },
      { id: 'step_3', description: 'Wait for processes to terminate', action: 'wait', parameters: { duration: '5s' } },
      { id: 'step_4', description: 'Start the service', action: 'service_start', parameters: {} },
      { id: 'step_5', description: 'Verify service health', action: 'health_check', parameters: { retries: '3', interval: '10s' } },
      { id: 'step_6', description: 'Re-enable in load balancer', action: 'lb_enable', parameters: {} },
    ],
    postChecks: [
      { check: 'service.status', expected: 'running' },
      { check: 'service.response_time', expected: '< 500ms' },
    ],
    rollback: {
      description: 'If service fails to start, attempt rollback to previous version',
      actions: ['Rollback to previous version', 'Notify on-call', 'Open incident'],
      notify: ['on_call', 'team_lead'],
    },
    script: `#!/bin/bash
# Service Restart Runbook
set -e

SERVICE_NAME=$1
echo "[$(date)] Restarting service: $SERVICE_NAME"

# Drain from LB
echo "Draining from load balancer..."
curl -X POST "http://lb.internal/drain/$SERVICE_NAME"
sleep 30

# Stop service
echo "Stopping service..."
systemctl stop $SERVICE_NAME

# Wait
sleep 5

# Start service
echo "Starting service..."
systemctl start $SERVICE_NAME

# Health check
for i in {1..3}; do
  if curl -s http://localhost:8080/health | grep -q "ok"; then
    echo "Health check passed"
    break
  fi
  sleep 10
done

# Re-enable in LB
echo "Re-enabling in load balancer..."
curl -X POST "http://lb.internal/enable/$SERVICE_NAME"

echo "[$(date)] Service restart completed"`,
  },
  {
    id: 'RB-003',
    name: 'High Memory Remediation',
    category: 'Infrastructure',
    riskLevel: 'Medium',
    severity: 'High',
    lastModified: new Date(Date.now() - 14 * 24 * 60 * 60000).toISOString(),
    ownerTeam: 'SRE',
    autoExecuteAllowed: false,
    approvalLevelRequired: 'Senior Engineer',
    supportedEnvironments: ['Production', 'Staging'],
    triggerConditions: [
      { type: 'metric', name: 'memory.usage', operator: '>', value: '85%' }
    ],
    requiredContext: ['hostname', 'process_name', 'environment'],
    preChecks: [
      { check: 'memory.usage', expected: '> 85%' },
      { check: 'system.uptime', expected: '> 1h' },
    ],
    steps: [
      { id: 'step_1', description: 'Identify top memory consumers', action: 'analyze_memory', parameters: { top: '10' } },
      { id: 'step_2', description: 'Clear system caches', action: 'clear_cache', parameters: { type: 'pagecache' } },
      { id: 'step_3', description: 'Restart memory-heavy processes if needed', action: 'conditional_restart', parameters: { threshold: '80%' } },
      { id: 'step_4', description: 'Verify memory usage reduced', action: 'check_memory', parameters: {} },
    ],
    postChecks: [
      { check: 'memory.usage', expected: '< 80%' },
    ],
    rollback: {
      description: 'If memory remediation fails, scale up or failover',
      actions: ['Scale horizontally', 'Failover to standby', 'Notify on-call'],
      notify: ['on_call', 'capacity_team'],
    },
  },
  {
    id: 'RB-004',
    name: 'CPU Spike Mitigation',
    category: 'Infrastructure',
    riskLevel: 'Low',
    severity: 'Medium',
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    ownerTeam: 'Infrastructure',
    autoExecuteAllowed: true,
    approvalLevelRequired: 'Engineer',
    supportedEnvironments: ['Production', 'Staging'],
    triggerConditions: [
      { type: 'metric', name: 'cpu.usage', operator: '>', value: '80%' }
    ],
    requiredContext: ['hostname', 'environment'],
    preChecks: [
      { check: 'cpu.usage', expected: '> 80%' },
    ],
    steps: [
      { id: 'step_1', description: 'Identify CPU-intensive processes', action: 'analyze_cpu', parameters: { top: '5' } },
      { id: 'step_2', description: 'Check for runaway processes', action: 'check_runaway', parameters: { threshold: '50%' } },
      { id: 'step_3', description: 'Renice or kill problematic processes', action: 'process_action', parameters: { action: 'renice' } },
      { id: 'step_4', description: 'Verify CPU normalized', action: 'check_cpu', parameters: {} },
    ],
    postChecks: [
      { check: 'cpu.usage', expected: '< 70%' },
    ],
    rollback: {
      description: 'If CPU remains high, scale out or escalate',
      actions: ['Scale out', 'Notify on-call'],
      notify: ['on_call'],
    },
  },
  {
    id: 'RB-005',
    name: 'Certificate Renewal',
    category: 'Security',
    riskLevel: 'Low',
    severity: 'Medium',
    lastModified: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
    ownerTeam: 'Security',
    autoExecuteAllowed: false,
    approvalLevelRequired: 'Admin',
    supportedEnvironments: ['Production', 'Staging'],
    triggerConditions: [
      { type: 'metric', name: 'cert.expiry', operator: '<', value: '7d' }
    ],
    requiredContext: ['domain', 'cert_path', 'environment'],
    preChecks: [
      { check: 'cert.valid', expected: 'true' },
      { check: 'acme.available', expected: 'true' },
    ],
    steps: [
      { id: 'step_1', description: 'Request new certificate from ACME', action: 'cert_request', parameters: { provider: 'letsencrypt' } },
      { id: 'step_2', description: 'Validate certificate chain', action: 'cert_validate', parameters: {} },
      { id: 'step_3', description: 'Deploy certificate to servers', action: 'cert_deploy', parameters: { reload: 'true' } },
      { id: 'step_4', description: 'Verify HTTPS connectivity', action: 'https_check', parameters: { timeout: '10s' } },
    ],
    postChecks: [
      { check: 'cert.expiry', expected: '> 30d' },
      { check: 'https.status', expected: '200' },
    ],
    rollback: {
      description: 'If new cert fails, restore previous certificate',
      actions: ['Restore backup cert', 'Reload services', 'Notify security team'],
      notify: ['security_team', 'on_call'],
    },
  },
  {
    id: 'RB-006',
    name: 'User Access Revocation',
    category: 'Security',
    riskLevel: 'High',
    severity: 'Critical',
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    ownerTeam: 'Security',
    autoExecuteAllowed: false,
    approvalLevelRequired: 'Admin',
    supportedEnvironments: ['Production', 'Staging'],
    triggerConditions: [
      { type: 'event', name: 'user.termination', operator: '==', value: 'true' }
    ],
    requiredContext: ['user_id', 'user_email', 'revocation_reason'],
    preChecks: [
      { check: 'user.exists', expected: 'true' },
      { check: 'approval.granted', expected: 'true' },
    ],
    steps: [
      { id: 'step_1', description: 'Disable user in identity provider', action: 'idp_disable', parameters: {} },
      { id: 'step_2', description: 'Revoke all active sessions', action: 'session_revoke', parameters: { all: 'true' } },
      { id: 'step_3', description: 'Remove from all groups and roles', action: 'access_remove', parameters: {} },
      { id: 'step_4', description: 'Rotate any shared credentials', action: 'cred_rotate', parameters: { scope: 'shared' } },
      { id: 'step_5', description: 'Generate access revocation report', action: 'report_generate', parameters: {} },
    ],
    postChecks: [
      { check: 'user.active', expected: 'false' },
      { check: 'user.sessions', expected: '0' },
    ],
    rollback: {
      description: 'User access revocation should not be rolled back without HR approval',
      actions: ['Contact HR', 'Document exception'],
      notify: ['hr_team', 'security_team'],
    },
  },
];

export const initialScheduledJobs: ScheduledJob[] = [
  {
    id: 'JOB-001',
    name: 'Weekly Patch Window',
    description: 'Apply security patches to all production servers',
    runbookId: 'RB-002',
    schedule: 'Every Sunday at 02:00 UTC',
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    status: 'Scheduled',
    environment: 'Production',
  },
  {
    id: 'JOB-002',
    name: 'Certificate Renewal Check',
    description: 'Check and renew expiring SSL certificates',
    runbookId: 'RB-005',
    schedule: 'Daily at 06:00 UTC',
    nextRun: new Date(Date.now() + 12 * 60 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    status: 'Scheduled',
    environment: 'Production',
  },
  {
    id: 'JOB-003',
    name: 'Log Cleanup',
    description: 'Archive and remove old application logs',
    runbookId: 'RB-001',
    schedule: 'Daily at 04:00 UTC',
    nextRun: new Date(Date.now() + 8 * 60 * 60000).toISOString(),
    status: 'Paused',
    environment: 'Production',
  },
  {
    id: 'JOB-004',
    name: 'Batch Job Rerun',
    description: 'Rerun failed batch processing jobs from previous day',
    runbookId: 'RB-002',
    schedule: 'Daily at 08:00 UTC',
    nextRun: new Date(Date.now() + 6 * 60 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 18 * 60 * 60000).toISOString(),
    status: 'Scheduled',
    environment: 'Production',
  },
];

export const initialNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'incident_assigned',
    title: 'Incident Assigned',
    message: 'INC-001: Disk Usage Critical has been assigned to you',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    link: '/orchestration/INC-001',
  },
  {
    id: 'NOTIF-002',
    type: 'approval_required',
    title: 'Approval Required',
    message: 'Runbook execution for INC-003 requires your approval',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    read: false,
    link: '/orchestration/INC-003',
  },
  {
    id: 'NOTIF-003',
    type: 'incident_assigned',
    title: 'Incident Assigned',
    message: 'INC-002: High Memory Usage has been assigned to you',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: true,
    link: '/orchestration/INC-002',
  },
];

export function generateExecutionResult(incident: Incident, runbook: Runbook): ExecutionResult {
  const now = new Date();
  const startTime = new Date(now.getTime() - 45000); // 45 seconds ago
  
  return {
    id: `EXEC-${Date.now()}`,
    incidentId: incident.id,
    runbookId: runbook.id,
    runbookName: runbook.name,
    environment: incident.environment,
    runnerId: 'runner-prod-01',
    approvedBy: 'Admin User',
    executedBy: 'Admin User',
    startTime: startTime.toISOString(),
    endTime: now.toISOString(),
    duration: '45s',
    outcome: 'Success',
    stepsExecuted: runbook.steps.map((step, index) => ({
      stepId: step.id,
      description: step.description,
      status: 'Success' as const,
      output: `Step ${index + 1} completed successfully`,
      duration: `${Math.floor(Math.random() * 10) + 2}s`,
    })),
    executionLogs: [
      `[${startTime.toISOString()}] Execution started`,
      `[${startTime.toISOString()}] Pre-checks passed`,
      ...runbook.steps.map((step, i) => 
        `[${new Date(startTime.getTime() + (i + 1) * 10000).toISOString()}] ${step.description} - OK`
      ),
      `[${now.toISOString()}] Post-checks passed`,
      `[${now.toISOString()}] Execution completed successfully`,
    ],
    systemLogs: [
      `[INFO] Authentication verified for user: Admin User`,
      `[INFO] Approval chain validated: Senior Engineer -> Admin`,
      `[INFO] Environment check passed: ${incident.environment}`,
      `[INFO] Runbook version: 1.2.3`,
      `[INFO] Policy compliance: SOC2, ISO27001 - PASSED`,
      `[INFO] Least-privilege check: PASSED`,
      `[INFO] No destructive commands detected`,
    ],
    rawOutput: runbook.steps.map((step, i) => 
      `=== Step ${i + 1}: ${step.description} ===\nAction: ${step.action}\nParameters: ${JSON.stringify(step.parameters)}\nResult: Success\nOutput: Operation completed\n`
    ).join('\n'),
  };
}

export function generateAuditEntry(incident: Incident, runbook: Runbook, result: ExecutionResult): AuditLogEntry {
  return {
    id: `AUDIT-${Date.now()}`,
    timestamp: result.endTime,
    environment: incident.environment,
    incidentId: incident.id,
    runbookName: runbook.name,
    approvedBy: result.approvedBy,
    executedBy: result.executedBy,
    outcome: result.outcome,
    executionId: result.id,
  };
}

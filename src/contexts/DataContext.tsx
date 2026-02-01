import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Incident, Runbook, ExecutionResult, AuditLogEntry, 
  ScheduledJob, Notification, Environment 
} from '@/types';
import { 
  initialIncidents, 
  initialRunbooks, 
  initialScheduledJobs, 
  initialNotifications,
  generateExecutionResult,
  generateAuditEntry
} from '@/data/initialData';

interface DataContextType {
  // Environment
  currentEnvironment: Environment;
  setCurrentEnvironment: (env: Environment) => void;
  
  // Incidents
  incidents: Incident[];
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  getIncident: (id: string) => Incident | undefined;
  
  // Runbooks
  runbooks: Runbook[];
  addRunbook: (runbook: Runbook) => void;
  updateRunbook: (id: string, updates: Partial<Runbook>) => void;
  getRunbook: (id: string) => Runbook | undefined;
  
  // Executions
  executionResults: ExecutionResult[];
  executeRunbook: (incidentId: string, runbookId: string) => Promise<ExecutionResult>;
  getExecutionResult: (id: string) => ExecutionResult | undefined;
  
  // Audit Logs
  auditLogs: AuditLogEntry[];
  getAuditLog: (id: string) => AuditLogEntry | undefined;
  
  // Scheduled Jobs
  scheduledJobs: ScheduledJob[];
  updateJob: (id: string, updates: Partial<ScheduledJob>) => void;
  executeJobNow: (jobId: string) => Promise<ExecutionResult>;
  
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>('Production');
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [runbooks, setRunbooks] = useState<Runbook[]>(initialRunbooks);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(initialScheduledJobs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const updateIncident = useCallback((id: string, updates: Partial<Incident>) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, ...updates } : inc
    ));
  }, []);

  const getIncident = useCallback((id: string) => {
    return incidents.find(inc => inc.id === id);
  }, [incidents]);

  const addRunbook = useCallback((runbook: Runbook) => {
    setRunbooks(prev => [...prev, runbook]);
  }, []);

  const updateRunbook = useCallback((id: string, updates: Partial<Runbook>) => {
    setRunbooks(prev => prev.map(rb => 
      rb.id === id ? { ...rb, ...updates } : rb
    ));
  }, []);

  const getRunbook = useCallback((id: string) => {
    return runbooks.find(rb => rb.id === id);
  }, [runbooks]);

  const executeRunbook = useCallback(async (incidentId: string, runbookId: string): Promise<ExecutionResult> => {
    const incident = incidents.find(i => i.id === incidentId);
    const runbook = runbooks.find(r => r.id === runbookId);
    
    if (!incident || !runbook) {
      throw new Error('Incident or runbook not found');
    }

    // Update incident to executing
    updateIncident(incidentId, { status: 'Executing', runbookId });

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate result
    const result = generateExecutionResult(incident, runbook);
    setExecutionResults(prev => [...prev, result]);

    // Generate audit entry
    const auditEntry = generateAuditEntry(incident, runbook, result);
    setAuditLogs(prev => [...prev, auditEntry]);

    // Update incident to completed
    updateIncident(incidentId, { status: 'Completed' });

    // Add notification
    addNotification({
      type: 'execution_completed',
      title: 'Execution Completed',
      message: `Runbook "${runbook.name}" completed for incident ${incidentId}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: `/results/${result.id}`,
    });

    return result;
  }, [incidents, runbooks, updateIncident]);

  const getExecutionResult = useCallback((id: string) => {
    return executionResults.find(r => r.id === id);
  }, [executionResults]);

  const getAuditLog = useCallback((id: string) => {
    return auditLogs.find(a => a.id === id);
  }, [auditLogs]);

  const updateJob = useCallback((id: string, updates: Partial<ScheduledJob>) => {
    setScheduledJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates } : job
    ));
  }, []);

  const executeJobNow = useCallback(async (jobId: string): Promise<ExecutionResult> => {
    const job = scheduledJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const runbook = runbooks.find(r => r.id === job.runbookId);
    if (!runbook) throw new Error('Runbook not found');

    // Update job status
    updateJob(jobId, { status: 'Executing' });

    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create a mock incident for the job execution
    const mockIncident: Incident = {
      id: `JOB-${jobId}`,
      title: job.name,
      severity: 'Medium',
      environment: job.environment,
      assignedTo: 'System',
      status: 'Completed',
      triggerCondition: 'Scheduled execution',
      timestamp: new Date().toISOString(),
    };

    const result = generateExecutionResult(mockIncident, runbook);
    setExecutionResults(prev => [...prev, result]);

    // Generate audit entry
    const auditEntry = generateAuditEntry(mockIncident, runbook, result);
    setAuditLogs(prev => [...prev, auditEntry]);

    // Update job status
    updateJob(jobId, { 
      status: 'Completed',
      lastRun: new Date().toISOString(),
    });

    return result;
  }, [scheduledJobs, runbooks, updateJob]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `NOTIF-${Date.now()}`,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      currentEnvironment,
      setCurrentEnvironment,
      incidents,
      updateIncident,
      getIncident,
      runbooks,
      addRunbook,
      updateRunbook,
      getRunbook,
      executionResults,
      executeRunbook,
      getExecutionResult,
      auditLogs,
      getAuditLog,
      scheduledJobs,
      updateJob,
      executeJobNow,
      notifications,
      markNotificationRead,
      addNotification,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

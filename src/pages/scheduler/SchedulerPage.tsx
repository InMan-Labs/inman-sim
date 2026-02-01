import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, RotateCcw, Calendar, Clock, 
  Server, ExternalLink, Loader2 
} from 'lucide-react';
import { ScheduledJob } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function SchedulerPage() {
  const { scheduledJobs, updateJob, executeJobNow } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [executingJobId, setExecutingJobId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExecuteNow = async (job: ScheduledJob) => {
    setExecutingJobId(job.id);
    toast({
      title: 'Executing Job',
      description: `Starting ${job.name}...`,
    });

    try {
      const result = await executeJobNow(job.id);
      navigate(`/results/${result.id}`);
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: 'An error occurred while executing the job',
        variant: 'destructive',
      });
      setExecutingJobId(null);
    }
  };

  const handlePause = (job: ScheduledJob) => {
    updateJob(job.id, { status: 'Paused' });
    toast({
      title: 'Job Paused',
      description: `${job.name} has been paused`,
    });
  };

  const handleRestart = (job: ScheduledJob) => {
    updateJob(job.id, { status: 'Scheduled' });
    toast({
      title: 'Job Restarted',
      description: `${job.name} has been reactivated`,
    });
  };

  const renderJobActions = (job: ScheduledJob) => {
    const isExecuting = executingJobId === job.id || job.status === 'Executing';

    switch (job.status) {
      case 'Scheduled':
        return (
          <>
            <Button 
              size="sm" 
              onClick={() => handleExecuteNow(job)}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Execute Now
            </Button>
            <Button size="sm" variant="outline" onClick={() => handlePause(job)}>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          </>
        );
      case 'Paused':
        return (
          <>
            <Button size="sm" variant="outline" onClick={() => handleRestart(job)}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleExecuteNow(job)}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Execute Now
            </Button>
          </>
        );
      case 'Executing':
        return (
          <Button size="sm" variant="outline" disabled>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Executing...
          </Button>
        );
      case 'Completed':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              // Find the most recent result for this job
              navigate('/audit-logs');
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Results
          </Button>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Scheduler</h1>
        <p className="text-muted-foreground mt-1">
          Manage scheduled infrastructure operations
        </p>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {scheduledJobs.map((job) => (
          <div key={job.id} className="enterprise-card-elevated">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{job.name}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{job.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Next: {formatDate(job.nextRun)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Server className="w-4 h-4" />
                    <span>{job.environment}</span>
                  </div>
                </div>

                {job.lastRun && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last run: {formatDate(job.lastRun)}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {renderJobActions(job)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {scheduledJobs.length === 0 && (
        <div className="enterprise-card text-center py-12">
          <p className="text-muted-foreground">No scheduled jobs</p>
        </div>
      )}
    </div>
  );
}

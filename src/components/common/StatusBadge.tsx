import { IncidentStatus, JobStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: IncidentStatus | JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusClass = () => {
    switch (status) {
      case 'Open':
      case 'Scheduled':
        return 'badge-info';
      case 'Executing':
        return 'badge-warning';
      case 'Completed':
        return 'badge-success';
      case 'Paused':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn(getStatusClass(), className)}>
      {status}
    </span>
  );
}

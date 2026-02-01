import { Severity, RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: Severity | RiskLevel;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const getSeverityClass = () => {
    switch (severity) {
      case 'Critical':
        return 'severity-critical';
      case 'High':
        return 'severity-high';
      case 'Medium':
        return 'severity-medium';
      case 'Low':
        return 'severity-low';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn(getSeverityClass(), className)}>
      {severity}
    </span>
  );
}

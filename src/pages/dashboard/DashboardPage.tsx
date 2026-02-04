import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '@/data/historicalData';
import { 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Timer,
  AlertTriangle,
  Shield,
  BarChart3,
  FileText,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = getDashboardStats();

  const pieData = [
    { name: 'Success', value: stats.successfulExecutions, color: 'hsl(var(--status-success))' },
    { name: 'Partial', value: stats.partialExecutions, color: 'hsl(var(--status-warning))' },
    { name: 'Failure', value: stats.failedExecutions, color: 'hsl(var(--status-error))' },
  ];

  const severityData = [
    { name: 'Critical', count: stats.incidentsBySeverity.Critical, fill: 'hsl(var(--status-error))' },
    { name: 'High', count: stats.incidentsBySeverity.High, fill: 'hsl(var(--status-warning))' },
    { name: 'Medium', count: stats.incidentsBySeverity.Medium, fill: 'hsl(var(--primary))' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Health Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Operational health and effectiveness overview — Last 30 days
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Incidents"
          value={stats.totalIncidents.toString()}
          trend={{ value: 12, direction: 'down', label: 'vs previous period' }}
          icon={<AlertTriangle className="w-5 h-5" />}
          onClick={() => navigate('/audit-logs')}
        />
        <SummaryCard
          title="Average MTTR"
          value={`${stats.avgMTTR} min`}
          trend={{ value: 18, direction: 'down', label: 'improvement' }}
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryCard
          title="Runbook Success Rate"
          value={`${stats.successRate}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          onClick={() => navigate('/runbooks')}
        />
        <SummaryCard
          title="Time Saved"
          value={`${stats.timeSavedHours} hrs`}
          subtitle="engineer-hours"
          icon={<Timer className="w-5 h-5" />}
        />
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Server Analysis */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Incident Analysis</h2>
            </div>
            <button 
              onClick={() => navigate('/audit-logs')}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </button>
          </div>

          {/* Incident Trend Chart */}
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.incidentTrend.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                  name="Incidents"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">By Severity</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }} 
                    stroke="hsl(var(--muted-foreground))"
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Recurring Issues */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Recurring Issues</h3>
            <div className="space-y-2">
              {stats.topIncidentTypes.map((incident, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="text-sm">{incident.type}</span>
                  <span className="text-sm font-medium text-muted-foreground">{incident.count} occurrences</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Past Runbook Analysis */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Runbook Performance</h2>
            </div>
            <button 
              onClick={() => navigate('/runbooks')}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </button>
          </div>

          {/* Success/Failure Donut */}
          <div className="flex items-center gap-6 mb-6">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Used Runbooks */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Most Used Runbooks</h3>
            <div className="space-y-3">
              {stats.runbookUsage.slice(0, 5).map((runbook, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{runbook.name}</span>
                    <span className="text-muted-foreground">
                      {runbook.executions} runs • {Math.round(runbook.successRate * 100)}% success
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(runbook.executions / stats.runbookUsage[0].executions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Insight callout */}
            <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Disk Cleanup</span> runbook executed{' '}
                <span className="font-medium text-foreground">{stats.runbookUsage[0].executions} times</span> with{' '}
                <span className="font-medium text-foreground">{Math.round(stats.runbookUsage[0].successRate * 100)}% success</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Governance & Safety Row */}
      <div className="enterprise-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Governance & Safety</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-status-success/5 border border-status-success/20">
            <div className="text-3xl font-bold text-status-success mb-1">
              {stats.approvalCompliance}%
            </div>
            <div className="text-sm text-muted-foreground">Approval Compliance</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-status-warning/5 border border-status-warning/20">
            <div className="text-3xl font-bold text-status-warning mb-1">
              {stats.blockedByPolicy}
            </div>
            <div className="text-sm text-muted-foreground">Executions Blocked by Policy</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
            <div className="text-3xl font-bold text-foreground mb-1">
              {stats.highRiskExecutions}
            </div>
            <div className="text-sm text-muted-foreground">High-Risk Executions (30d)</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-md bg-status-success/5 border border-status-success/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <p className="text-sm text-muted-foreground">
              All production executions were approved and audited. Full compliance maintained.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLinkCard
          icon={<FileText className="w-5 h-5" />}
          title="View Audit Logs"
          description="Review complete execution history"
          onClick={() => navigate('/audit-logs')}
        />
        <QuickLinkCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Runbook Repository"
          description="Browse and execute runbooks"
          onClick={() => navigate('/runbooks')}
        />
        <QuickLinkCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Open Incidents"
          description="View incidents requiring attention"
          onClick={() => navigate('/orchestration')}
        />
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  icon: React.ReactNode;
  onClick?: () => void;
}

function SummaryCard({ title, value, subtitle, trend, icon, onClick }: SummaryCardProps) {
  return (
    <div 
      className={`enterprise-card ${onClick ? 'cursor-pointer hover:shadow-enterprise-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.direction === 'down' ? 'text-status-success' : 'text-status-error'}`}>
            <TrendingDown className={`w-3 h-3 ${trend.direction === 'up' ? 'rotate-180' : ''}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{subtitle || title}</div>
      {trend && (
        <div className="text-xs text-muted-foreground mt-1">{trend.label}</div>
      )}
    </div>
  );
}

interface QuickLinkCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickLinkCard({ icon, title, description, onClick }: QuickLinkCardProps) {
  return (
    <button
      onClick={onClick}
      className="enterprise-card text-left hover:shadow-enterprise-md transition-shadow w-full"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </button>
  );
}

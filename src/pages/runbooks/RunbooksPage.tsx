import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { RunbookExecutionModal } from '@/components/runbooks/RunbookExecutionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, Calendar } from 'lucide-react';
import { Runbook } from '@/types';

export default function RunbooksPage() {
  const { runbooks } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRunbook, setSelectedRunbook] = useState<Runbook | null>(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  const filteredRunbooks = runbooks.filter(rb =>
    rb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rb.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRun = (runbook: Runbook, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRunbook(runbook);
    setShowExecutionModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Runbook Repository</h1>
          <p className="text-muted-foreground mt-1">
            Manage and execute infrastructure runbooks
          </p>
        </div>
        <Button onClick={() => navigate('/runbooks/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Runbook
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search runbooks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Runbook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRunbooks.map((runbook) => (
          <div
            key={runbook.id}
            className="enterprise-card hover:shadow-enterprise-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/runbooks/${runbook.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <SeverityBadge severity={runbook.riskLevel} />
            </div>

            <h3 className="font-semibold text-foreground mb-1">{runbook.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{runbook.category}</p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Last modified: {formatDate(runbook.lastModified)}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/runbooks/${runbook.id}`);
                }}
              >
                View
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => handleRun(runbook, e)}
              >
                Run
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredRunbooks.length === 0 && (
        <div className="enterprise-card text-center py-12">
          <p className="text-muted-foreground">No runbooks found matching your search</p>
        </div>
      )}

      {/* Execution Modal */}
      {selectedRunbook && (
        <RunbookExecutionModal
          runbook={selectedRunbook}
          open={showExecutionModal}
          onOpenChange={setShowExecutionModal}
        />
      )}
    </div>
  );
}

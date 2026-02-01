import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import OrchestrationPage from "@/pages/orchestration/OrchestrationPage";
import IncidentDetailPage from "@/pages/orchestration/IncidentDetailPage";
import ResultsPage from "@/pages/results/ResultsPage";
import RunbooksPage from "@/pages/runbooks/RunbooksPage";
import RunbookDetailPage from "@/pages/runbooks/RunbookDetailPage";
import RunbookEditorPage from "@/pages/runbooks/RunbookEditorPage";
import AuditLogsPage from "@/pages/audit/AuditLogsPage";
import AuditDetailPage from "@/pages/audit/AuditDetailPage";
import SchedulerPage from "@/pages/scheduler/SchedulerPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/orchestration" replace />} />
                  <Route path="/orchestration" element={<OrchestrationPage />} />
                  <Route path="/orchestration/:id" element={<IncidentDetailPage />} />
                  <Route path="/results/:id" element={<ResultsPage />} />
                  <Route path="/runbooks" element={<RunbooksPage />} />
                  <Route path="/runbooks/new" element={<RunbookEditorPage />} />
                  <Route path="/runbooks/:id" element={<RunbookDetailPage />} />
                  <Route path="/runbooks/:id/edit" element={<RunbookEditorPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/audit-logs/:id" element={<AuditDetailPage />} />
                  <Route path="/scheduler" element={<SchedulerPage />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

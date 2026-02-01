import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 h-[calc(100vh-3.5rem)] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

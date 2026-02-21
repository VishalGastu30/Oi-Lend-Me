import { Activity } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { getAdminStats, getAdminAnalytics } from './actions';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { StatsGrid } from '@/components/admin/StatsGrid';

export default async function AdminDashboard() {
  const statsData = await getAdminStats();
  const analyticsData = await getAdminAnalytics();

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="System Overview" 
        subtitle="Live monitoring of platform activity and health status."
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">All Systems Operational</span>
        </div>
      </AdminPageHeader>

      {/* Stats Grid (Client Component) */}
      <StatsGrid statsData={statsData} />

      {/* Charts Section (Client Component) */}
      <DashboardCharts data={analyticsData} />

    </div>
  );
}

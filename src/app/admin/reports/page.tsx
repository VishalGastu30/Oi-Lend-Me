import { getReports } from '../actions';
import { ReportsList } from '@/components/admin/ReportsList';
import { ReportStatus } from '@prisma/client';

export default async function ReportsPage(props: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filter = (searchParams?.filter as string) || 'ALL';
  
  // Validate filter to match strict type of getReports signature or passed as generic string if safe
  // getReports expects exact union type or 'ALL'
  const validFilters = ['ALL', 'PENDING', 'REVIEWED', 'ACTION_TAKEN'];
  const safeFilter = validFilters.includes(filter) ? (filter as 'ALL' | ReportStatus) : 'ALL';

  const reports = await getReports(safeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Moderation Queue</h2>
      </div>
      <ReportsList reports={reports} currentFilter={safeFilter} />
    </div>
  );
}

import { AlertCircle, Loader2 } from 'lucide-react';
import { AdminPageIntro } from '../../admin/AdminPageSections';
import { extractErrorMessage } from '../../admin/dashboard/adminDashboard.utils';
import { Alert, AlertDescription } from '../../ui/alert';
import { AdminDashboardKpiGrid } from './components/AdminDashboardKpiGrid';
import { AdminGrowthAndActivitySection } from './components/AdminGrowthAndActivitySection';
import { AdminModerationSection } from './components/AdminModerationSection';
import { AdminUserManagementSection } from './components/AdminUserManagementSection';
import type { AdminDashboardDataModel } from './useAdminDashboardData';

interface AdminDashboardContentProps {
  model: AdminDashboardDataModel;
  onNavigate: (path: string | number) => void;
}

export function AdminDashboardContent({ model, onNavigate }: AdminDashboardContentProps) {
  const {
    refetch,
    dashboardError,
    kpis,
    growthRange,
    setGrowthRange,
    growthArea,
    growthLine,
    growthPoints,
    growthSeries,
    recentActivity,
    usersError,
    usersErrorMessage,
    fallbackUsers,
    usersLoading,
    usersFetching,
    displayedUsers,
    moderationTasks,
    highPriorityCount,
    dashboardLoading,
    dashboardFetching,
    data: dashboardData,
  } = model;

  return (
    <div className="space-y-8">
      <AdminPageIntro
        eyebrow="Platform governance"
        title="Admin Dashboard"
        description="Monitor platform growth, user activity, and moderation tasks from one operational view."
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh Data
          </button>
        }
      />

      {dashboardError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {extractErrorMessage(dashboardError, 'Unable to load admin dashboard data.')}
          </AlertDescription>
        </Alert>
      ) : null}

      <AdminDashboardKpiGrid kpis={kpis} />

      <AdminGrowthAndActivitySection
        growthRange={growthRange}
        setGrowthRange={setGrowthRange}
        growthArea={growthArea}
        growthLine={growthLine}
        growthPoints={growthPoints}
        growthSeries={growthSeries}
        recentActivity={recentActivity}
        onNavigate={onNavigate}
      />

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <AdminUserManagementSection
          usersError={usersError}
          usersErrorMessage={usersErrorMessage}
          fallbackUsers={fallbackUsers}
          usersLoading={usersLoading}
          usersFetching={usersFetching}
          displayedUsers={displayedUsers}
          onNavigate={onNavigate}
        />
        <AdminModerationSection
          moderationTasks={moderationTasks}
          highPriorityCount={highPriorityCount}
          onNavigate={onNavigate}
        />
      </section>

      {(dashboardLoading || dashboardFetching) && !dashboardData ? (
        <div className="rounded-xl border border-[#1152d4]/10 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-[#1152d4]" />
          Loading admin insights...
        </div>
      ) : null}
    </div>
  );
}
